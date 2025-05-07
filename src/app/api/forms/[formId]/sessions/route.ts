import { NextRequest, NextResponse } from "next/server"
import { completeResponse } from "@/services/response/completeResponse"
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { QAPair } from '@/types/supabase-types'

// Use Node.js runtime instead of Edge
export const runtime = 'nodejs';

// Create a secure service client that only exists server-side
// This is safe because this code only runs on the server in an API route
const createServiceClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Extract formId from URL
  const formId = request.nextUrl.pathname.split('/')[3]; // Get formId from /api/forms/[formId]/sessions
  try {
    // formId is already extracted from the URL
    
    if (!formId) {
      return NextResponse.json(
        { error: "Form ID is required" },
        { status: 400 }
      )
    }
    
    // Get browser and device info from request headers
    const userAgent = request.headers.get('user-agent') || '';
    const metadata = {
      userAgent,
      referrer: request.headers.get('referer') || '',
      device: getDeviceType(userAgent)
    };
    
    // Initialize a form response session using the service client directly
    const serviceSupabase = createServiceClient();
    
    // Generate a unique respondent ID
    const respondentId = uuidv4();
    
    // Get the latest form version if it exists
    const { data: latestVersion, error: versionError } = await serviceSupabase
      .from('form_versions')
      .select('id')
      .eq('form_id', formId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    // If there's an error fetching versions, log it but continue (non-critical)
    if (versionError) {
      console.warn('Error checking for form versions:', versionError);
    }
    
    // Use the RPC function to track form start in a single transaction
    console.log('[API DEBUG] Calling track_form_start RPC with form_id:', formId);
    
    // Create response metadata
    const responseMetadata = {
      ...metadata,
      timestamp: new Date().toISOString(),
      form_version_id: latestVersion?.id || null
    };
    
    // Call track_form_start RPC function
    const { data: rpcResult, error: rpcError } = await serviceSupabase.rpc('track_form_start', {
      p_form_id: formId,
      p_response_id: null, // Let the function generate a new UUID
      p_visitor_id: respondentId,
      p_metadata: responseMetadata
    });
    
    if (rpcError || (rpcResult && !rpcResult.success)) {
      const errorMessage = rpcError ? rpcError.message : (rpcResult ? rpcResult.error : 'Unknown error');
      console.error('[API] Error creating form response via RPC:', errorMessage);
      throw new Error(errorMessage);
    }
    
    console.log('[API] Form start tracked successfully via RPC');
    
    // Create response data object for further processing
    const responseData = {
      id: rpcResult.response_id,
      form_id: formId,
      respondent_id: respondentId,
      status: 'in_progress',
      form_version_id: latestVersion?.id || null,
      started_at: rpcResult.timestamp,
      metadata: responseMetadata
    };
    
    // Get the first block to retrieve the starter question
    const { data: blocks, error: blocksError } = await serviceSupabase
      .from('form_blocks')
      .select('*')
      .eq('form_id', formId)
      .order('order_index')
      .limit(1);

    if (blocksError || !blocks || blocks.length === 0) {
      console.error('Error fetching form blocks:', blocksError);
      throw blocksError || new Error('No blocks found for this form');
    }

    const firstBlock = blocks[0];
    let starterQuestion = '';

    if (firstBlock.type === 'dynamic') {
      // Get the dynamic block config
      const { data: config, error: configError } = await serviceSupabase
        .from('dynamic_block_configs')
        .select('*')
        .eq('block_id', firstBlock.id)
        .single();

      if (configError) {
        console.error('Error fetching dynamic block config:', configError);
        throw configError;
      }

      starterQuestion = config.starter_question;
    } else {
      // For static blocks
      starterQuestion = firstBlock.title;
    }
    
    const response = responseData;
    
    return NextResponse.json({
      sessionId: response.id,
      starterQuestion,
      responseId: response.id,
      blocks: [] // This will be populated by a separate request
    }, { status: 200 })
  } catch (error) {
    console.error("Error creating form session:", error)
    return NextResponse.json(
      { error: "Failed to create form session" },
      { status: 500 }
    )
  }
}

// Helper function to determine device type
function getDeviceType(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return 'mobile';
  if (/tablet/i.test(userAgent)) return 'tablet';
  return 'desktop';
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  // Extract formId from URL
  const formId = request.nextUrl.pathname.split('/')[3]; // Get formId from /api/forms/[formId]/sessions
  try {
    // formId is already extracted from the URL
    
    if (!formId) {
      return NextResponse.json(
        { error: "Form ID is required" },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const { responseId, blockId, blockType, answer, currentQuestion } = body
    
    if (!responseId || !blockId || !blockType) {
      return NextResponse.json(
        { error: "Response ID, block ID, and block type are required" },
        { status: 400 }
      )
    }
    
    // Process the answer based on block type
    if (blockType === 'static') {
      // For static blocks, optionally save the answer based on the 'required' flag
      // Use the service client for public form submissions
      const supabase = createServiceClient();
      const { data: currentBlock } = await supabase
        .from('form_blocks')
        .select('order_index, required')
        .eq('id', blockId)
        .single();
      
      if (!currentBlock) {
        throw new Error('Block not found');
      }
      
      // Enforce answer only if block is marked required
      if (currentBlock.required && (!answer || (typeof answer === 'string' && answer.trim() === ''))) {
        return NextResponse.json(
          { error: "Answer is required for static blocks" },
          { status: 400 }
        )
      }
      
      // Save non-empty answers
      if (answer) {
        // Use direct service client access instead of mode-based client selection
        const serviceSupabase = createServiceClient();
        
        // Create the answer directly using the service client
        const payload = {
          response_id: responseId,
          block_id: blockId,
          answer: answer as string,
          answered_at: new Date().toISOString()
        };
        
        const { error } = await serviceSupabase
          .from('static_block_answers')
          .upsert(payload, { onConflict: 'response_id,block_id' });
          
        if (error) {
          console.error('Error saving static answer:', error);
          throw error;
        }
      }
      
      // Get the next block in sequence
      const { data: nextBlock } = await supabase
        .from('form_blocks')
        .select('*')
        .eq('form_id', formId)
        .gt('order_index', currentBlock.order_index)
        .order('order_index', { ascending: true })
        .limit(1);
      
      if (!nextBlock || nextBlock.length === 0) {
        // No more blocks, complete the form
        await completeResponse(responseId, 'viewer');
        
        return NextResponse.json({
          completed: true,
          message: "Form completed"
        }, { status: 200 })
      }
      
      return NextResponse.json({
        completed: false,
        nextBlock: nextBlock[0]
      }, { status: 200 })
    } 
    else if (blockType === 'dynamic') {
      // For dynamic blocks, process conversation
      // We need to handle both string answers (for first submissions) and QAPair[] for ongoing conversations
      
      // Get the dynamic block configuration first to check if it's required
      const supabase = createServiceClient();
      const { data: blockConfig, error: blockConfigError } = await supabase
        .from('form_blocks')
        .select('required')
        .eq('id', blockId)
        .single();
      
      if (blockConfigError) {
        console.error('Error fetching block configuration:', blockConfigError);
        throw blockConfigError;
      }
      
      // Check if the block is required
      const isRequired = blockConfig?.required || false;
      
      // Check if we have either a direct answer string or complete conversation data
      const hasValidAnswerData = answer !== undefined && (typeof answer === 'string' || Array.isArray(answer));
      
      // Allow empty answers for non-required blocks
      if ((!currentQuestion || !hasValidAnswerData) && isRequired) {
        return NextResponse.json(
          { error: "Current question and answer are required for dynamic blocks" },
          { status: 400 }
        )
      }
      
      // If the block is not required and we don't have an answer, proceed to the next block
      if ((!hasValidAnswerData || 
          (typeof answer === 'string' && answer.trim() === '') || 
          (Array.isArray(answer) && answer.length === 0)) && 
          !isRequired) {
        // Get the next block in sequence using the service client
        const supabase = createServiceClient();
        const { data: currentBlock } = await supabase
          .from('form_blocks')
          .select('order_index')
          .eq('id', blockId)
          .single();
        
        if (!currentBlock) {
          throw new Error('Block not found');
        }
        
        // Get the next block in order
        const { data: nextBlock } = await supabase
          .from('form_blocks')
          .select('*')
          .eq('form_id', formId)
          .gt('order_index', currentBlock.order_index)
          .order('order_index', { ascending: true })
          .limit(1);
        
        if (!nextBlock || nextBlock.length === 0) {
          // No more blocks, complete the form
          await completeResponse(responseId, 'viewer');
          
          return NextResponse.json({
            completed: true,
            message: "Form completed"
          }, { status: 200 })
        }
        
        return NextResponse.json({
          completed: false,
          nextBlock: nextBlock[0],
          dynamicComplete: true
        }, { status: 200 })
      }

      const isFirstQuestion = body.isFirstQuestion === true;
      let answerText: string;
      
      // Extract the answer text based on what format we received
      if (typeof answer === 'string') {
        // Direct answer as string (typically for first question)
        answerText = answer;
      } else if (Array.isArray(answer)) {
        // QAPair[] format - extract the answer to the current question
        const conversation = answer as QAPair[];
        const currentQuestionIndex = conversation.length > 0 ? conversation.length - 1 : -1;
        
        // Use the last conversation item's answer if available
        if (currentQuestionIndex >= 0 && conversation[currentQuestionIndex]?.answer) {
          answerText = conversation[currentQuestionIndex].answer;
        } else {
          // Fallback if structure isn't as expected
          answerText = typeof conversation[conversation.length - 1] === 'string' 
            ? conversation[conversation.length - 1] as unknown as string 
            : '';
        }
      } else {
        // Invalid format
        return NextResponse.json(
          { error: "Invalid answer format for dynamic block" },
          { status: 400 }
        )
      }
      
      // Process the dynamic response directly with the service client
      const serviceSupabase = createServiceClient();
      
      // First, check for existing conversation
      let existingConversation = null;
      let currentConversation = [];
      
      if (!isFirstQuestion) {
        // Try to fetch existing conversation
        const { data: conversation, error: conversationError } = await serviceSupabase
          .from('dynamic_block_responses')
          .select('*')
          .eq('response_id', responseId)
          .eq('block_id', blockId)
          .single();
        
        if (!conversationError) {
          existingConversation = conversation;
          currentConversation = conversation.conversation || [];
        }
      }
      
      // Get the dynamic block configuration
      const { data: config, error: configError } = await serviceSupabase
        .from('dynamic_block_configs')
        .select('*')
        .eq('block_id', blockId)
        .single();
      
      if (configError) {
        console.error('Error fetching dynamic block config:', configError);
        throw configError;
      }
      
      // Create the new Q&A pair
      const newQAPair = {
        question: currentQuestion,
        answer: answerText,
        timestamp: new Date().toISOString(),
        is_starter: isFirstQuestion
      };
      
      // Add to conversation
      const conversation = [...currentConversation, newQAPair];
      
      // Check if we've reached the maximum number of questions
      let isComplete = conversation.length >= (config?.max_questions || 5);
      
      // Generate the next question if not complete
      let nextQuestion = null;
      
      if (!isComplete) {
        // First, check if there's an existing next question in the conversation
        const { data: existingResponse, error: existingError } = await serviceSupabase
          .from('dynamic_block_responses')
          .select('next_question')
          .eq('response_id', responseId)
          .eq('block_id', blockId)
          .single();
          
        if (!existingError && existingResponse?.next_question) {
          // Use the existing next question if available
          nextQuestion = existingResponse.next_question;
          console.log('Using existing next question from database:', nextQuestion.substring(0, 30) + '...');
        }
        
        // Only generate a new question if we don't have one already
        if (!nextQuestion) {
          try {
            // Import the actual AI service to generate next questions instead of hardcoded placeholder
            const { processConversation } = await import('@/services/ai/processConversation');
            
            // Get form context for better question generation
            const { getFormContextClient } = await import('@/services/form/getFormContextClient');
            const context = await getFormContextClient(formId, blockId);
            
            // Extract questions and answers for the AI service
            const prevQuestions = conversation.map(qa => qa.question);
            const prevAnswers = conversation.map(qa => qa.answer);
            
            console.log('Generating next AI question with:', {
              conversationLength: conversation.length,
              lastAnswer: answerText.substring(0, 30) + '...',
              hasContext: !!context,
              formId,
              blockId
            });
            
            // Process the conversation to generate a next question
            const result = await processConversation({
              prevQuestions,
              prevAnswers,
              formContext: context,
              instructions: config?.ai_instructions || 'You are an interviewer asking follow-up questions based on previous responses.',
              temperature: config?.temperature || 0.7
            });
            
            if (result.success && result.data) {
              nextQuestion = result.data;
              console.log('Generated next question:', nextQuestion);
              isComplete = false; // If we have a next question, we're definitely not complete
            } else {
              console.log('Failed to generate next question:', result.error || 'No data returned');
              // Only mark as complete if we're at the max questions
              isComplete = conversation.length >= (config?.max_questions || 1);
            }
          } catch (aiError) {
            console.error('Error generating next question with AI:', aiError);
            // Fallback to placeholder if AI fails, TODO: Adib believes we should keep this but check with victor
            nextQuestion = "Anything else you would like to add?";
          }
        }
      }
      
      // Save or update the conversation
      if (existingConversation) {
        const { error: updateError } = await serviceSupabase
          .from('dynamic_block_responses')
          .update({
            conversation: conversation,
            next_question: nextQuestion,
            completed_at: isComplete ? new Date().toISOString() : null
          })
          .eq('id', existingConversation.id);
        
        if (updateError) {
          console.error('Error updating dynamic response:', updateError);
          throw updateError;
        }
      } else {
        const { error: insertError } = await serviceSupabase
          .from('dynamic_block_responses')
          .insert({
            response_id: responseId,
            block_id: blockId,
            conversation: conversation,
            next_question: nextQuestion,
            completed_at: isComplete ? new Date().toISOString() : null
          });
        
        if (insertError) {
          console.error('Error creating dynamic response:', insertError);
          throw insertError;
        }
      }
      
      // Store result in the same format expected by the existing code
      const result = {
        conversation,
        nextQuestion,
        isComplete
      };
      
      if (result.isComplete) {
        // Get the next block in sequence using the service client
        const supabase = createServiceClient();
        const { data: currentBlock } = await supabase
          .from('form_blocks')
          .select('order_index')
          .eq('id', blockId)
          .single();
        
        if (!currentBlock) {
          throw new Error('Block not found');
        }
        
        // Get the next block in order
        const { data: nextBlock } = await supabase
          .from('form_blocks')
          .select('*')
          .eq('form_id', formId)
          .gt('order_index', currentBlock.order_index)
          .order('order_index', { ascending: true })
          .limit(1);
        
        if (!nextBlock || nextBlock.length === 0) {
          // No more blocks, complete the form using the service client
          const serviceSupabase = createServiceClient();
          
          // Update the response status to completed
          const { error } = await serviceSupabase
            .from('form_responses')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', responseId);
            
          if (error) {
            console.error('Error completing form response:', error);
            throw error;
          }
          
          return NextResponse.json({
            completed: true,
            message: "Form completed"
          }, { status: 200 })
        }
        
        // Only set dynamicComplete to true when the conversation has actually reached
        // the maximum number of questions AND there's no next question
        // This prevents automatic advancement until the conversation is actually finished
        const hasReachedMaxQuestions = conversation.length >= (config?.max_questions || 1);
        
        // FIXED: We need to ensure we respect isComplete when it comes from the AI response service
        // shouldAdvance should be true if:
        // 1. We've reached max questions OR 
        // 2. We're explicitly told we're complete OR
        // 3. The block is not required and we want to skip it
        const isNotRequired = !isRequired;
        const shouldAdvance = hasReachedMaxQuestions || isComplete || (isNotRequired && answer === '');
        
        console.log('AI conversation status:', {
          conversationLength: conversation.length,
          maxQuestions: config?.max_questions || 1,
          hasNextQuestion: !!nextQuestion,
          hasReachedMaxQuestions,
          isComplete,
          isRequired,
          isNotRequired,
          answerIsEmpty: answer === '',
          shouldAdvance
        });
        
        return NextResponse.json({
          completed: false,
          nextBlock: nextBlock[0],
          dynamicComplete: shouldAdvance
        }, { status: 200 })
      }
      
      // Return the next question in the conversation
      return NextResponse.json({
        completed: false,
        conversation: result.conversation,
        nextQuestion: result.nextQuestion,
        isComplete: result.isComplete,
        dynamicComplete: false
      }, { status: 200 })
    }
    else {
      return NextResponse.json(
        { error: `Invalid block type: ${blockType}` },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error processing form response:", error)
    return NextResponse.json(
      { error: "Failed to process form response" },
      { status: 500 }
    )
  }
}
