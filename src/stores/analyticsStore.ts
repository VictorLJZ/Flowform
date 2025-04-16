import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { 
  CompleteResponse
} from '@/types/supabase-types'

type AnalyticsState = {
  responses: CompleteResponse[]
  currentResponse: CompleteResponse | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchResponses: (formId: string) => Promise<void>
  fetchResponseById: (responseId: string) => Promise<void>
  exportResponses: (formId: string, format: 'csv' | 'excel') => Promise<void>
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  responses: [],
  currentResponse: null,
  isLoading: false,
  error: null,
  
  fetchResponses: async (formId) => {
    set({ isLoading: true, error: null })
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
        set({ responses: [], isLoading: false })
        return
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
      
      set({ responses: completeResponses, isLoading: false })
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Error fetching responses',
        isLoading: false
      })
    }
  },
  
  fetchResponseById: async (responseId) => {
    set({ isLoading: true, error: null })
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
      
      const completeResponse = {
        ...response,
        static_answers: staticAnswers || [],
        dynamic_responses: dynamicResponses || [],
        form: formData
      } as CompleteResponse
      
      set({ currentResponse: completeResponse, isLoading: false })
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Error fetching responses',
        isLoading: false
      })
    }
  },
  
  exportResponses: async (formId, format) => {
    // This will be implemented in future iterations
    set({ isLoading: true, error: null })
    
    try {
      // For now, just fetch the responses
      await get().fetchResponses(formId)
      
      // Here we would implement the export functionality
      // For now, just a placeholder
      console.log(`Exporting responses in ${format} format`)
      
      set({ isLoading: false })
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Error fetching responses',
        isLoading: false
      })
    }
  }
}))
