import type { FormTheme } from './theme-types';

/**
 * Data representing the form metadata
 */
export interface FormData {
  form_id: string;
  title: string;
  description?: string;
  workspace_id?: string;  // for Supabase
  created_by?: string;    // for Supabase
  status?: 'draft' | 'published' | 'archived';
  settings: {
    showProgressBar: boolean;
    requireSignIn: boolean;
    theme: string;
    primaryColor: string;
    fontFamily: string;
    estimatedTime?: number;
    estimatedTimeUnit?: 'minutes' | 'hours';
    redirectUrl?: string;
    customCss?: string;
  };
  // WYSIWYG theme data
  theme?: FormTheme;
}