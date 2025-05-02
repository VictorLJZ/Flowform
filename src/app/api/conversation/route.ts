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
    
    // Get block config for max questions
    const { data: config, error: configError } = await supabase
      .from('dynamic_block_configs')
      .select('*')
      .eq('block_id', blockId)
      .single()
      
    if (configError && configError.code !== 'PGRST116') {
      console.error('Error fetching config:', configError)
      return NextResponse.json({ success: false, error: configError.message }, { status: 500 })
    }
    
    const conversation = data?.conversation || []
    const isComplete = conversation.length >= (config?.max_questions || 5)
    
    return NextResponse.json({
      conversation,
      nextQuestion: data?.next_question || null,
      isComplete,
      maxQuestions: config?.max_questions || 5
    })
  } catch (error) {
    console.error('Unexpected error in conversation API:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
