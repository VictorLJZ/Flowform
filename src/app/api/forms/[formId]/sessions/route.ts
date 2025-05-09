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
  // Generate request ID for tracing
  const requestId = Math.random().toString(36).substring(2, 9);
  
  // Extract formId from URL
  const formId = request.nextUrl.pathname.split('/')[3]; // Get formId from /api/forms/[formId]/sessions
  
  console.log(`[${requestId}] Processing form session PUT request for formId: ${formId}`);
  
  try {
    if (!formId) {
      console.error(`[${requestId}] Missing form ID in request`);
      return NextResponse.json(
        { error: "Form ID is required" },
        { status: 400 }
      )
    }
    
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
      console.log(`[${requestId}] Request body received:`, {
        responseId: body.responseId,
        blockId: body.blockId,
        blockType: body.blockType,
        hasAnswer: !!body.answer
      });
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse request JSON:`, parseError);
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }
    
    const { responseId, blockId, blockType, answer, currentQuestion } = body;
    
    // Validate required fields
    if (!responseId || !blockId || !blockType) {
      console.error(`[${requestId}] Missing required fields in request body:`, {
        hasResponseId: !!responseId,
        hasBlockId: !!blockId,
        hasBlockType: !!blockType
      });
      return NextResponse.json(
        { error: "Response ID, block ID, and block type are required" },
        { status: 400 }
      )
    }
    
    // Create Supabase service client
    const supabase = createServiceClient();
    
    // Process the answer based on block type
    if (blockType === 'static') {
      // DEBUG LOGGING: Track static block answer on the server side
      console.log(`[${requestId}][DEBUG] Processing static block answer:`, {
        responseId,
        blockId,
        answerType: typeof answer,
        isArray: Array.isArray(answer),
        answerValuePreview: JSON.stringify(answer).substring(0, 100) + '...'
      });
      // For static blocks, optionally save the answer based on the 'required' flag
      // Use the service client for public form submissions
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
        // Handle different answer data types by converting to proper string format
        let formattedAnswer: string;
        if (typeof answer === 'string') {
          formattedAnswer = answer;
        } else if (typeof answer === 'number') {
          formattedAnswer = answer.toString();
        } else if (Array.isArray(answer)) {
          // If it's an array, stringify it to preserve structure
          formattedAnswer = JSON.stringify(answer);
        } else if (answer === null || answer === undefined) {
          formattedAnswer = '';
        } else {
          // If it's an object or any other type, stringify it
          formattedAnswer = JSON.stringify(answer);
        }
        
        console.log(`[${requestId}] Formatted static answer for saving:`, {
          originalType: typeof answer,
          isArray: Array.isArray(answer),
          formattedAnswer: formattedAnswer.substring(0, 100) + (formattedAnswer.length > 100 ? '...' : '')
        });
        
        const payload = {
          response_id: responseId,
          block_id: blockId,
          answer: formattedAnswer,
          answered_at: new Date().toISOString()
        };
        
        // Log the exact payload we're about to save to the database
        console.log(`[${requestId}][DEBUG] About to save static answer to database:`, {
          payload,
          answerType: typeof payload.answer,
          answerLength: payload.answer.length
        });

        const { data: existingAnswer, error: fetchError } = await serviceSupabase
          .from('static_block_answers')
          .select('*')
          .eq('response_id', responseId)
          .eq('block_id', blockId)
          .maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found, which is fine
          console.error(`[${requestId}][DEBUG] Error checking existing answer:`, fetchError);
        } else {
          console.log(`[${requestId}][DEBUG] Existing answer check:`, {
            exists: !!existingAnswer,
            existingId: existingAnswer?.id,
            existingAnswer: existingAnswer?.answer?.substring(0, 50) + '...'
          });
        }

        // Try to use upsert with returning to get the saved record
        const { data: savedRecord, error } = await serviceSupabase
          .from('static_block_answers')
          .upsert(payload, { onConflict: 'response_id,block_id' })
          .select()
          .single();
          
        if (error) {
          console.error(`[${requestId}][DEBUG] Error saving static answer:`, error);
          throw error;
        }

        // Log the successful save
        console.log(`[${requestId}][DEBUG] Successfully saved static answer:`, {
          savedRecordId: savedRecord?.id,
          savedAnswer: savedRecord?.answer?.substring(0, 50) + '...'
        });
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
    } else if (blockType === 'dynamic' || blockType === 'ai_conversation') {
      console.log(`[${requestId}] Processing dynamic or AI conversation block`);
      
      try {
        // For dynamic blocks, pass to saveDynamicBlockResponse
        // Get the existing conversation
        const { data: existingData, error: existingError } = await supabase
          .from('dynamic_block_responses')
          .select('conversation, next_question')
          .eq('response_id', responseId)
          .eq('block_id', blockId)
          .maybeSingle();
        
        if (existingError && existingError.code !== 'PGRST116') {
          console.error(`[${requestId}] Error fetching existing conversation:`, existingError);
          return NextResponse.json(
            { error: `Database error: ${existingError.message}` },
            { status: 500 }
          );
        }
        
        // Get the current question index from the request or default to the end
        // const questionIndex = body.questionIndex ?? (existingData?.conversation?.length || 0); // Not currently used
        
        const conversation: QAPair[] = existingData?.conversation || [];
        
        // Add the new answer to the conversation
        if (body.isStarterQuestion) {
          console.log(`[${requestId}] Processing starter question answer`);
          conversation.push({
            question: currentQuestion || "What's your answer?",
            answer: answer as string,
            timestamp: new Date().toISOString(),
            is_starter: true
          });
        } else {
          console.log(`[${requestId}] Processing follow-up question answer`);
          conversation.push({
            question: currentQuestion || (existingData?.next_question || 'Follow-up question'),
            answer: answer as string,
            timestamp: new Date().toISOString(),
            is_starter: false
          });
        }
        
        // Get form context
        const { data: blocks } = await supabase
          .from('form_blocks')
          .select('*')
          .eq('form_id', formId)
          .order('order_index');
        
        const formContext = {
          formId,
          formTitle: 'Form',
          staticQuestions: blocks?.filter(b => b.type === 'static').map(b => ({
            id: b.id,
            title: b.title,
            description: b.description,
            type: 'static',
            subtype: b.subtype
          })) || [],
          dynamicBlocks: []
        };
        
        // Get next question using AI service
        let nextQuestion = '';
        const isComplete = body.isComplete || false;
        
        if (!isComplete) {
          try {
            // Get the questions and answers arrays
            const prevQuestions = conversation.map(qa => qa.question);
            const prevAnswers = conversation.map(qa => qa.answer);
            
            // Use your AI service to generate the next question
            const response = await fetch(`${request.nextUrl.origin}/api/ai/generate-question`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prevQuestions,
                prevAnswers,
                formContext,
                temperature: 0.7
              })
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || `API returned status ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
              nextQuestion = result.data;
              console.log(`[${requestId}] Generated next question (length: ${nextQuestion.length})`);
            } else {
              console.warn(`[${requestId}] Failed to generate next question:`, result.error);
              nextQuestion = "I'm having trouble thinking of a follow-up question. Could you tell me more about that?";
            }
          } catch (aiError) {
            console.error(`[${requestId}] Error generating next question:`, aiError);
            nextQuestion = "I'm having trouble thinking of a follow-up question. Could you tell me more about that?";
          }
        }
        
        // Save the conversation to the database
        const { error: saveError } = await supabase
          .from('dynamic_block_responses')
          .upsert({
            response_id: responseId,
            block_id: blockId,
            conversation,
            next_question: nextQuestion,
            completed_at: isComplete ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          }, { onConflict: 'response_id,block_id' });
        
        if (saveError) {
          console.error(`[${requestId}] Error saving conversation:`, saveError);
          return NextResponse.json(
            { error: `Failed to save conversation: ${saveError.message}` },
            { status: 500 }
          );
        }
        
        return NextResponse.json({
          conversation,
          nextQuestion,
          isComplete
        }, { status: 200 });
      } catch (dynamicError) {
        console.error(`[${requestId}] Unexpected error processing dynamic block:`, dynamicError);
        return NextResponse.json(
          { error: `Server error: ${dynamicError instanceof Error ? dynamicError.message : 'Unknown error'}` },
          { status: 500 }
        );
      }
    } else {
      console.error(`[${requestId}] Unknown block type: ${blockType}`);
      return NextResponse.json(
        { error: `Unknown block type: ${blockType}` },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing form session:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}
