import { NextResponse } from 'next/server'
import { saveDynamicBlockResponse } from '@/services/form/saveDynamicBlockResponse'
import { SaveDynamicResponseInput } from '@/types/form-service-types'

// Extend the input type to include isComplete for demo mode
interface ExtendedInputType extends SaveDynamicResponseInput {
  isComplete?: boolean;
}

export async function POST(request: Request) {
  try {
    const input: ExtendedInputType = await request.json()
    
    // Validate required fields
    if (!input.blockId || !input.formId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' }, 
        { status: 400 }
      )
    }
    
    // For regular mode, process through the service
    const result = await saveDynamicBlockResponse({
      responseId: input.responseId,
      blockId: input.blockId,
      formId: input.formId,
      question: input.question,
      answer: input.answer,
      isStarterQuestion: input.isStarterQuestion,
      isComplete: input.isComplete // Pass the isComplete flag from frontend
    })
    
    if (!result.success) {
      console.error('Error saving dynamic block response:', result.error)
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }
    
    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Unexpected error in answer API:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
