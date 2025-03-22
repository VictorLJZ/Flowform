import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  value?: any;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  createdAt: Date;
  updatedAt: Date;
}

interface FormState {
  forms: Form[];
  currentForm: Form | null;
  isLoading: boolean;
  error: string | null;
}

interface FormActions {
  setForms: (forms: Form[]) => void;
  setCurrentForm: (form: Form | null) => void;
  addForm: (form: Form) => void;
  updateForm: (id: string, updates: Partial<Form>) => void;
  deleteForm: (id: string) => void;
  addField: (formId: string, field: FormField) => void;
  updateField: (formId: string, fieldId: string, updates: Partial<FormField>) => void;
  deleteField: (formId: string, fieldId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFormStore = create<FormState & FormActions>()(
  devtools(
    persist(
      (set) => ({
        forms: [],
        currentForm: null,
        isLoading: false,
        error: null,
        
        setForms: (forms) => set({ forms }),
        
        setCurrentForm: (form) => set({ currentForm: form }),
        
        addForm: (form) => set((state) => ({ 
          forms: [...state.forms, form] 
        })),
        
        updateForm: (id, updates) => set((state) => ({
          forms: state.forms.map((form) => 
            form.id === id 
              ? { ...form, ...updates, updatedAt: new Date() } 
              : form
          ),
          currentForm: state.currentForm?.id === id 
            ? { ...state.currentForm, ...updates, updatedAt: new Date() } 
            : state.currentForm
        })),
        
        deleteForm: (id) => set((state) => ({
          forms: state.forms.filter((form) => form.id !== id),
          currentForm: state.currentForm?.id === id ? null : state.currentForm
        })),
        
        addField: (formId, field) => set((state) => ({
          forms: state.forms.map((form) => 
            form.id === formId 
              ? { 
                  ...form, 
                  fields: [...form.fields, field],
                  updatedAt: new Date()
                } 
              : form
          ),
          currentForm: state.currentForm?.id === formId 
            ? { 
                ...state.currentForm, 
                fields: [...state.currentForm.fields, field],
                updatedAt: new Date()
              } 
            : state.currentForm
        })),
        
        updateField: (formId, fieldId, updates) => set((state) => ({
          forms: state.forms.map((form) => 
            form.id === formId 
              ? { 
                  ...form, 
                  fields: form.fields.map((field) => 
                    field.id === fieldId 
                      ? { ...field, ...updates } 
                      : field
                  ),
                  updatedAt: new Date()
                } 
              : form
          ),
          currentForm: state.currentForm?.id === formId 
            ? { 
                ...state.currentForm, 
                fields: state.currentForm.fields.map((field) => 
                  field.id === fieldId 
                    ? { ...field, ...updates } 
                    : field
                ),
                updatedAt: new Date()
              } 
            : state.currentForm
        })),
        
        deleteField: (formId, fieldId) => set((state) => ({
          forms: state.forms.map((form) => 
            form.id === formId 
              ? { 
                  ...form, 
                  fields: form.fields.filter((field) => field.id !== fieldId),
                  updatedAt: new Date()
                } 
              : form
          ),
          currentForm: state.currentForm?.id === formId 
            ? { 
                ...state.currentForm, 
                fields: state.currentForm.fields.filter((field) => field.id !== fieldId),
                updatedAt: new Date()
              } 
            : state.currentForm
        })),
        
        setLoading: (isLoading) => set({ isLoading }),
        
        setError: (error) => set({ error })
      }),
      {
        name: 'flow-form-storage',
      }
    )
  )
)
