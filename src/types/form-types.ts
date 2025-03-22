// Base form field types
export enum FieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  EMAIL = 'email',
  NUMBER = 'number',
  DATE = 'date',
  PHONE = 'phone',
  SELECT = 'select',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  FILE = 'file',
  RATING = 'rating',
  URL = 'url',
  SIGNATURE = 'signature',
  HEADER = 'header',
  PARAGRAPH = 'paragraph',
  DIVIDER = 'divider',
  PAGE_BREAK = 'page_break'
}

// Base form validation rules
export interface ValidationRule {
  type: string;
  value?: any;
  message: string;
}

// Base field configuration
export interface FieldConfig {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  defaultValue?: any;
  required?: boolean;
  visible?: boolean;
  validation?: ValidationRule[];
  className?: string;
  style?: Record<string, string>;
  // Additional properties based on field type
  options?: { label: string; value: string }[];
  multiple?: boolean;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  cols?: number;
  accept?: string;
  maxSize?: number;
  allowedFileTypes?: string[];
}

// Form section (for multi-page forms)
export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FieldConfig[];
  order: number;
}

// Form configuration
export interface FormConfig {
  id: string;
  title: string;
  description?: string;
  sections: FormSection[];
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published' | 'archived';
  settings: {
    showProgressBar?: boolean;
    submitButtonText?: string;
    successMessage?: string;
    redirectUrl?: string;
    allowSaveAndContinue?: boolean;
    emailNotifications?: {
      to: string[];
      subject?: string;
      includeFormData?: boolean;
    };
    theme?: {
      primaryColor?: string;
      backgroundColor?: string;
      textColor?: string;
      fontFamily?: string;
    };
  };
}

// Form submission
export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: Date;
  ip?: string;
  userAgent?: string;
  status: 'complete' | 'partial';
}

// Form analytics
export interface FormAnalytics {
  formId: string;
  views: number;
  starts: number;
  completions: number;
  abandons: number;
  conversionRate: number;
  averageCompletionTime: number;
  fieldAnalytics: Record<string, {
    interactionCount: number;
    timeSpent: number;
    errorCount: number;
  }>;
}
