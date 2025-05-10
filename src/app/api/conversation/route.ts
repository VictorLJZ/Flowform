import { createClient } from '@/lib/supabase/client'
import { createPublicClient } from '@/lib/supabase/publicClient'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Get query params from URL
    const url = new URL(request.url)
    const responseId = url.searchParams.get('responseId')
    const blockId = url.searchParams.get('blockId')
    const mode = url.searchParams.get('mode') || 'viewer'
    
    if (!blockId) {
      return NextResponse.json(
        { success: false, error: 'Missing required block ID parameter' }, 
        { status: 400 }
      )
    }
    
    // Initialize Supabase client - use public client for viewer mode
    const supabase = mode === 'viewer' ? createPublicClient() : createClient()
    
    // Fetch the conversation
    const { data, error } = await supabase
      .from('dynamic_block_responses')
      .select('*')
      .eq('response_id', responseId)
      .eq('block_id', blockId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching conversation:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    
    // Get block data to find max questions from settings
    const { data: blockData, error: blockError } = await supabase
      .from('form_blocks')
      .select('*')
      .eq('id', blockId)
      .single()
      
    if (blockError) {
      console.error('Error fetching block data:', blockError)
      return NextResponse.json({ success: false, error: blockError.message }, { status: 500 })
    }
    
    const conversation = data?.conversation || []
    
    // Get maxQuestions from the block settings
    const maxQuestions = blockData?.settings?.maxQuestions || 5
    const hasReachedMaxQuestions = maxQuestions > 0 && conversation.length >= maxQuestions
    
    // ADDED: Detect if this is a new conversation that's just starting
    const conversationJustStarted = conversation.length === 0
    
    // Get the next question, but clear it if max questions reached
    let nextQuestion = data?.next_question || null
    if (hasReachedMaxQuestions && nextQuestion) {
      console.log(`Conversation has reached max questions (${maxQuestions}), clearing next question`)
      nextQuestion = null
    }
    
    // MODIFIED: Mark as complete if max questions reached, regardless of nextQuestion
    const isComplete = hasReachedMaxQuestions
    
    return NextResponse.json({
      conversation,
      nextQuestion: hasReachedMaxQuestions ? '' : nextQuestion,
      isComplete,
      maxQuestions,
      // ADDED: Flag to indicate a new conversation
      conversationJustStarted
    })
  } catch (error) {
    console.error('Error in conversation API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    )
  }
}
