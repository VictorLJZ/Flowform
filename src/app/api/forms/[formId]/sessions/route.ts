import { NextRequest, NextResponse } from "next/server"
import { startFormResponse } from "@/services/response/startFormResponse"
import { saveStaticAnswer } from "@/services/response/saveStaticAnswer"
import { saveDynamicResponse } from "@/services/response/saveDynamicResponse"
import { completeResponse } from "@/services/response/completeResponse"
import { createClient } from "@/lib/supabase/client"

export async function POST(
  request: NextRequest,
  context: { params: { formId: string } }
) {
  try {
    const params = await context.params;
    const { formId } = params
    
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
    
    // Initialize a form response session
    const { response, starterQuestion } = await startFormResponse(formId, metadata);
    
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

export async function PUT(
  request: NextRequest,
  context: { params: { formId: string } }
) {
  try {
    const params = await context.params;
    const { formId } = params
    
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
      // For static blocks, simply save the answer
      if (!answer) {
        return NextResponse.json(
          { error: "Answer is required for static blocks" },
          { status: 400 }
        )
      }
      
      await saveStaticAnswer(responseId, blockId, answer);
      
      // Get the next block in sequence
      const supabase = createClient();
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
        await completeResponse(responseId);
        
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
      if (!currentQuestion || !answer) {
        return NextResponse.json(
          { error: "Current question and answer are required for dynamic blocks" },
          { status: 400 }
        )
      }
      
      const isFirstQuestion = body.isFirstQuestion === true;
      
      // Process the dynamic response
      const result = await saveDynamicResponse(
        responseId,
        blockId,
        currentQuestion,
        answer,
        isFirstQuestion
      );
      
      if (result.isComplete) {
        // Get the next block in sequence
        const supabase = createClient();
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
          await completeResponse(responseId);
          
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
      
      // Return the next question in the conversation
      return NextResponse.json({
        completed: false,
        conversation: result.conversation,
        nextQuestion: result.nextQuestion,
        isComplete: result.isComplete
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
