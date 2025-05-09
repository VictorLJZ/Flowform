import type { FormTheme } from './theme-types';
import type { Connection } from './workflow-types';

/**
 * Data representing the form metadata
 */
export interface CustomFormData {
  form_id: string;
  title: string;
  description?: string;
  workspace_id?: string;  // for Supabase
  created_by?: string;    // for Supabase
  status?: 'draft' | 'published' | 'archived';
  published_at?: string;  // ISO date string when form was published
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
    workflow?: {
      connections: Connection[];
    };
  };
  // WYSIWYG theme data
  theme?: FormTheme;
}