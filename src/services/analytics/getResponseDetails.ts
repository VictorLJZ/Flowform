import { createClient } from '@/lib/supabase/client'
import type { CompleteResponse } from '@/types/supabase-types'

/**
 * Fetches detailed data for a specific form response
 * 
 * @param responseId - The ID of the response to fetch details for
 * @returns Promise resolving to a complete response object
 */
export async function getResponseDetails(responseId: string): Promise<CompleteResponse> {
  if (!responseId) {
    throw new Error('Response ID is required')
  }

  const supabase = createClient()

  try {
    // Get the response
    const { data: response, error: responseError } = await supabase
      .from('form_responses')
      .select('*')
      .eq('id', responseId)
      .single()
    
    if (responseError) throw responseError
    if (!response) throw new Error('Response not found')
    
    // Get static block answers
    const { data: staticAnswers, error: staticError } = await supabase
      .from('static_block_answers')
      .select('*')
      .eq('response_id', responseId)
    
    if (staticError) throw staticError
    
    // Get dynamic block responses
    const { data: dynamicResponses, error: dynamicError } = await supabase
      .from('dynamic_block_responses')
      .select('*')
      .eq('response_id', responseId)
    
    if (dynamicError) throw dynamicError
    
    // Get the form data
    const { data: formData, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('form_id', response.form_id)
      .single()
    
    if (formError) throw formError
    
    return {
      ...response,
      static_answers: staticAnswers || [],
      dynamic_responses: dynamicResponses || [],
      form: formData
    } as CompleteResponse
  } catch (error: unknown) {
    console.error('Error fetching response details:', error)
    throw error
  }
}
