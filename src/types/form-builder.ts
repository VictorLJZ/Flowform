import { FormGenerationConfig } from './form-generation';

export type FormBuilderStatus = 'idle' | 'loading' | 'success' | 'error';

export interface FormBuilderState {
  config: FormGenerationConfig;
  status: FormBuilderStatus;
  error: string | null;
  formId: string | null;
}

export interface FormBuilderActions {
  setConfig: (config: Partial<FormGenerationConfig>) => void;
  resetConfig: () => void;
  setStatus: (status: FormBuilderStatus) => void;
  setError: (error: string | null) => void;
  setFormId: (formId: string | null) => void;
  createForm: () => Promise<void>;
}

export type FormBuilderStore = FormBuilderState & FormBuilderActions;
