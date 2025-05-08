import { NextResponse } from 'next/server'
import { saveDynamicBlockResponse } from '@/services/form/saveDynamicBlockResponse'
import { SaveDynamicResponseInput } from '@/types/form-service-types'

// Extend the input type to include isComplete for demo mode
interface ExtendedInputType extends SaveDynamicResponseInput {
  isComplete?: boolean;
  questionIndex?: number;
}

export async function POST(request: Request) {
  try {
    // Generate request ID for tracking
    const requestId = Math.random().toString(36).substring(2, 9);
    console.log(`[${requestId}] Processing /api/conversation/answer request`);
    
    // Parse JSON request body
    let input: ExtendedInputType;
    try {
      input = await request.json();
      console.log(`[${requestId}] Request payload received:`, {
        responseId: input.responseId,
        blockId: input.blockId,
        formId: input.formId,
        answer: typeof input.answer === 'string' ? 
          (input.answer.length > 20 ? input.answer.substring(0, 20) + '...' : input.answer) : 
          'NON-STRING',
      });
    } catch (e) {
      console.error(`[${requestId}] Failed to parse request JSON:`, e);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid request format' 
      }, { status: 400 });
    }
    
    // Validate required fields
    const requiredFields = ['responseId', 'blockId', 'formId', 'answer'];
    const missingFields = requiredFields.filter(field => !input[field as keyof ExtendedInputType]);
    
    if (missingFields.length > 0) {
      console.error(`[${requestId}] Missing required fields:`, missingFields);
      return NextResponse.json({ 
        success: false, 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // Call the service with detailed error handling
    const result = await saveDynamicBlockResponse(input);
    console.log(`[${requestId}] Successfully processed answer:`, {
      success: result.success,
      hasData: !!result.data,
      hasConversation: result.data && 'conversation' in result.data,
      conversationLength: result.data?.conversation?.length
    });
    
    return NextResponse.json(result);
  } catch (error) {
    // Capture detailed error information
    console.error('Error in /api/conversation/answer:', error);
    
    // Provide a helpful error response with as much detail as possible
    let errorMessage = 'Unknown server error';
    let errorDetails = {};
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };
    }
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      details: errorDetails
    }, { status: 500 });
  }
}
