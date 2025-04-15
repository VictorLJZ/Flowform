import { create } from 'zustand'
// Import individual services directly instead of from the index to avoid AI dependencies
import { createForm as createFormService } from '@/services/form/createForm'
import { getFormWithBlocks } from '@/services/form/getFormWithBlocks'
import { updateForm as updateFormService } from '@/services/form/updateForm'
import { deleteForm as deleteFormService } from '@/services/form/deleteForm'
// Temporarily skip invalidateFormCache to avoid the AI dependency chain
// import { invalidateFormCache } from '@/services/form/invalidateCache'
import { createClient } from '@/lib/supabase/client'
import { Form, CompleteForm } from '@/types/supabase-types'

type FormState = {
  forms: Form[]
  currentForm: CompleteForm | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchForms: () => Promise<void>
  fetchFormById: (id: string) => Promise<void>
  createForm: (form: Parameters<typeof createFormService>[0]) => Promise<void>
  updateForm: (id: string, form: Partial<Form>) => Promise<void>
  deleteForm: (id: string) => Promise<void>
  publishForm: (id: string) => Promise<boolean>
  setCurrentForm: (form: CompleteForm | null) => void
}

export const useFormStore = create<FormState>((set, get) => ({
  forms: [],
  currentForm: null,
  isLoading: false,
  error: null,
  
  fetchForms: async () => {
    set({ isLoading: true, error: null })
    const supabase = createClient()
    
    try {
      // Since there's no getForms service yet, we'll use a direct Supabase call
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
    set({ isLoading: true, error: null })
    
    try {
      const form = await getFormWithBlocks(id)
      
      if (!form) {
        throw new Error('Form not found')
      }
      
      set({ currentForm: form, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  createForm: async (formData) => {
    set({ isLoading: true, error: null })
    
    try {
      const newForm = await createFormService(formData)
      
      // Update the local state with the new form
      set({ 
        forms: [newForm, ...get().forms],
        currentForm: { ...newForm, blocks: [] }, // Initialize with empty blocks array
        isLoading: false 
      })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  updateForm: async (id, formUpdates) => {
    set({ isLoading: true, error: null })
    
    try {
      const updatedForm = await updateFormService(id, formUpdates)
      
      // If successful, update the local state
      set({ 
        forms: get().forms.map(form => 
          form.form_id === id ? updatedForm : form
        ),
        isLoading: false 
      })

      // If the current form is the one being updated, refresh it with blocks
      if (get().currentForm?.form_id === id) {
        const completeForm = await getFormWithBlocks(id)
        set({ currentForm: completeForm })
      }
      
      // Temporarily skipping cache invalidation to avoid AI dependency
      // invalidateFormCache(id)
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  deleteForm: async (id) => {
    set({ isLoading: true, error: null })
    
    try {
      await deleteFormService(id)
      
      // Update the local state by removing the deleted form
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
    set({ isLoading: true, error: null })
    
    try {
      // Update the form status to published by using the updateForm service
      const updatedForm = await updateFormService(id, {
        status: 'published',
        published_at: new Date().toISOString()
      })
      
      // Update store state with the published form
      set({ 
        forms: get().forms.map(form => form.form_id === id ? updatedForm : form),
        isLoading: false 
      })
      
      // If the current form is the one being published, refresh it with blocks
      if (get().currentForm?.form_id === id) {
        const completeForm = await getFormWithBlocks(id)
        set({ currentForm: completeForm })
      }
      
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
