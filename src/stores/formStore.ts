import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

type Form = {
  form_id: string
  title: string
  starter_question: string
  instructions: string
  temperature: number
  max_questions: number
  created_at: string
  updated_at: string
  status: 'draft' | 'published' | 'archived'
  published_at?: string
  workspace_id: string
  created_by: string
}

type FormState = {
  forms: Form[]
  currentForm: Form | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchForms: () => Promise<void>
  fetchFormById: (id: string) => Promise<void>
  createForm: (form: Omit<Form, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateForm: (id: string, form: Partial<Form>) => Promise<void>
  deleteForm: (id: string) => Promise<void>
  publishForm: (id: string) => Promise<boolean>
  setCurrentForm: (form: Form | null) => void
}

export const useFormStore = create<FormState>((set, get) => ({
  forms: [],
  currentForm: null,
  isLoading: false,
  error: null,
  
  fetchForms: async () => {
    const supabase = createClient()
    set({ isLoading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      set({ forms: data || [], isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  fetchFormById: async (id) => {
    const supabase = createClient()
    set({ isLoading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('form_id', id)
        .single()
      
      if (error) throw error
      
      set({ currentForm: data, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  createForm: async (form) => {
    const supabase = createClient()
    set({ isLoading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('forms')
        .insert([form])
        .select()
      
      if (error) throw error
      
      set({ 
        forms: [data[0], ...get().forms],
        currentForm: data[0],
        isLoading: false 
      })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  updateForm: async (id, formUpdates) => {
    const supabase = createClient()
    set({ isLoading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('forms')
        .update(formUpdates)
        .eq('form_id', id)
        .select()
        .single()
      
      if (error) throw error
      
      set({ 
        forms: get().forms.map(form => form.form_id === id ? data : form),
        currentForm: get().currentForm?.form_id === id ? data : get().currentForm,
        isLoading: false 
      })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  deleteForm: async (id) => {
    const supabase = createClient()
    set({ isLoading: true, error: null })
    
    try {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('form_id', id)
      
      if (error) throw error
      
      set({ 
        forms: get().forms.filter(form => form.form_id !== id),
        currentForm: get().currentForm?.form_id === id ? null : get().currentForm,
        isLoading: false 
      })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  publishForm: async (id) => {
    const supabase = createClient()
    set({ isLoading: true, error: null })
    
    try {
      // Update the form status to published and set published_at timestamp
      const { data, error } = await supabase
        .from('forms')
        .update({
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('form_id', id)
        .select()
        .single()
      
      if (error) throw error
      
      // Update store state with the published form
      set({ 
        forms: get().forms.map(form => form.form_id === id ? data : form),
        currentForm: get().currentForm?.form_id === id ? data : get().currentForm,
        isLoading: false 
      })
      
      return true
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      return false
    }
  },
  
  setCurrentForm: (form) => {
    set({ currentForm: form })
  }
}))
