import { createClient } from '@/lib/supabase/client'
import type { CompleteResponse } from '@/types/supabase-types'

/**
 * Fetches all responses for a specific form
 * 
 * @param formId - The ID of the form to fetch responses for
 * @returns Promise resolving to an array of complete form responses
 */
export async function getFormResponses(formId: string): Promise<CompleteResponse[]> {
  if (!formId) {
    throw new Error('Form ID is required')
  }

  const supabase = createClient()

  try {
    // Step 1: Fetch all form responses for this form
    const { data: responseData, error: responseError } = await supabase
      .from('form_responses')
      .select('*')
      .eq('form_id', formId)
      .order('created_at', { ascending: false })
    
    if (responseError) throw responseError
    
    if (!responseData || responseData.length === 0) {
      return []
    }
    
    // Step 2: For each response, fetch its static answers and dynamic responses
    const completeResponses = await Promise.all(
      responseData.map(async (response) => {
        // Get static block answers
        const { data: staticAnswers, error: staticError } = await supabase
          .from('static_block_answers')
          .select('*')
          .eq('response_id', response.id)
        
        if (staticError) throw staticError
        
        // Get dynamic block responses
        const { data: dynamicResponses, error: dynamicError } = await supabase
          .from('dynamic_block_responses')
          .select('*')
          .eq('response_id', response.id)
        
        if (dynamicError) throw dynamicError
        
        // Get the form data
        const { data: formData, error: formError } = await supabase
          .from('forms')
          .select('*')
          .eq('form_id', formId)
          .single()
        
        if (formError) throw formError
        
        // Construct the complete response
        return {
          ...response,
          static_answers: staticAnswers || [],
          dynamic_responses: dynamicResponses || [],
          form: formData
        } as CompleteResponse
      })
    )
    
    return completeResponses
  } catch (error: unknown) {
    console.error('Error fetching form responses:', error)
    throw error
  }
}
