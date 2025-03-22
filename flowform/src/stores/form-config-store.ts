import { create } from 'zustand';
import { FormConfig } from '@/types/form';
import { createForm, updateForm, deleteForm, getForms, getForm } from '@/lib/supabase';

interface FormConfigState {
  forms: FormConfig[];
  currentForm: FormConfig | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchForms: (userId: string) => Promise<void>;
  fetchForm: (formId: string) => Promise<void>;
  saveForm: (form: Omit<FormConfig, 'id' | 'createdAt' | 'updatedAt'>) => Promise<FormConfig>;
  updateCurrentForm: (formId: string, updates: Partial<FormConfig>) => Promise<void>;
  deleteCurrentForm: (formId: string) => Promise<void>;
  setCurrentForm: (form: FormConfig | null) => void;
  resetState: () => void;
}

export const useFormConfigStore = create<FormConfigState>((set, get) => ({
  forms: [],
  currentForm: null,
  isLoading: false,
  error: null,
  
  fetchForms: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const forms = await getForms(userId);
      set({ forms, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  fetchForm: async (formId: string) => {
    set({ isLoading: true, error: null });
    try {
      const form = await getForm(formId);
      set({ currentForm: form, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  saveForm: async (form) => {
    set({ isLoading: true, error: null });
    try {
      const savedForm = await createForm({
        user_id: form.userId,
        title: form.title,
        starter_question: form.starterQuestion,
        instructions: form.instructions,
        temperature: form.temperature,
        max_questions: form.maxQuestions
      });
      
      // Convert from database format to our app format
      const formattedForm: FormConfig = {
        id: savedForm.id,
        userId: savedForm.user_id,
        title: savedForm.title,
        starterQuestion: savedForm.starter_question,
        instructions: savedForm.instructions,
        temperature: savedForm.temperature,
        maxQuestions: savedForm.max_questions,
        createdAt: savedForm.created_at,
        updatedAt: savedForm.updated_at
      };
      
      set(state => ({ 
        forms: [...state.forms, formattedForm],
        currentForm: formattedForm,
        isLoading: false 
      }));
      
      return formattedForm;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  updateCurrentForm: async (formId: string, updates: Partial<FormConfig>) => {
    set({ isLoading: true, error: null });
    try {
      // Convert from our app format to database format
      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.starterQuestion) dbUpdates.starter_question = updates.starterQuestion;
      if (updates.instructions) dbUpdates.instructions = updates.instructions;
      if (updates.temperature !== undefined) dbUpdates.temperature = updates.temperature;
      if (updates.maxQuestions !== undefined) dbUpdates.max_questions = updates.maxQuestions;
      
      const updatedForm = await updateForm(formId, dbUpdates);
      
      // Convert from database format to our app format
      const formattedForm: FormConfig = {
        id: updatedForm.id,
        userId: updatedForm.user_id,
        title: updatedForm.title,
        starterQuestion: updatedForm.starter_question,
        instructions: updatedForm.instructions,
        temperature: updatedForm.temperature,
        maxQuestions: updatedForm.max_questions,
        createdAt: updatedForm.created_at,
        updatedAt: updatedForm.updated_at
      };
      
      set(state => ({
        forms: state.forms.map(f => f.id === formId ? formattedForm : f),
        currentForm: formattedForm,
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  deleteCurrentForm: async (formId: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteForm(formId);
      set(state => ({
        forms: state.forms.filter(f => f.id !== formId),
        currentForm: null,
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  setCurrentForm: (form) => {
    set({ currentForm: form });
  },
  
  resetState: () => {
    set({
      forms: [],
      currentForm: null,
      isLoading: false,
      error: null
    });
  }
}));
