import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

type Form = {
  id: string
  title: string
  starter_question: string
  instructions: string
  temperature: number
  max_questions: number
  created_at: string
  updated_at: string
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
        .eq('id', id)
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
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      set({ 
        forms: get().forms.map(form => form.id === id ? data : form),
        currentForm: get().currentForm?.id === id ? data : get().currentForm,
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
        .eq('id', id)
      
      if (error) throw error
      
      set({ 
        forms: get().forms.filter(form => form.id !== id),
        currentForm: get().currentForm?.id === id ? null : get().currentForm,
        isLoading: false 
      })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  setCurrentForm: (form) => {
    set({ currentForm: form })
  }
}))
