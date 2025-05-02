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
    
    // Get mode from header or default to viewer mode
    const mode = request.headers.get('x-flowform-mode') || 'viewer'
    
    // Validate required fields
    if (!input.blockId || !input.formId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' }, 
        { status: 400 }
      )
    }
    
    // Process through the service with mode parameter
    const result = await saveDynamicBlockResponse({
      responseId: input.responseId,
      blockId: input.blockId,
      formId: input.formId,
      question: input.question,
      answer: input.answer,
      isStarterQuestion: input.isStarterQuestion,
      isComplete: input.isComplete, // Pass the isComplete flag from frontend
      mode: mode as 'builder' | 'viewer' // Pass mode from header
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
