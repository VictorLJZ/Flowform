import { create } from 'zustand';
import { FormBuilderState, FormBuilderStore } from '@/types/form-builder';

// Default form configuration values
const DEFAULT_CONFIG = {
  starterQuestion: '',
  instructions: '',
  temperature: 0.7,
  maxQuestions: 5
};

export const useFormBuilderStore = create<FormBuilderStore>((set, get) => ({
  // Initial state
  config: { ...DEFAULT_CONFIG },
  status: 'idle',
  error: null,
  formId: null,

  // Actions
  setConfig: (config) => set((state) => ({
    config: { ...state.config, ...config }
  })),

  resetConfig: () => set(() => ({
    config: { ...DEFAULT_CONFIG },
    status: 'idle',
    error: null,
    formId: null
  })),

  setStatus: (status) => set(() => ({ status })),

  setError: (error) => set(() => ({ error })),

  setFormId: (formId) => set(() => ({ formId })),

  createForm: async () => {
    const { config } = get();
    
    // Validate form configuration
    if (!config.starterQuestion.trim()) {
      set({ error: 'Please provide a starter question' });
      return;
    }

    if (!config.instructions.trim()) {
      set({ error: 'Please provide instructions for form generation' });
      return;
    }

    // Set loading state
    set({ status: 'loading', error: null });

    try {
      // Send request to the API
      const response = await fetch('/api/forms/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create form');
      }

      const data = await response.json();
      
      // Set success state with the new form ID
      set({ 
        status: 'success', 
        formId: data.formId,
        error: null 
      });
    } catch (error) {
      // Set error state
      set({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    }
  }
}));
