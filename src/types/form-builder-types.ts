import type { FormTheme } from './theme-types';
import type { SlideLayout } from './layout-types';
import type { FormBlock } from './block-types';

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

/**
 * Zustand store shape for the form builder
 */
export interface FormBuilderState {
  formData: FormData;
  blocks: FormBlock[];
  currentBlockId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  sidebarOpen: boolean;
  blockSelectorOpen: boolean;
  defaultBlockPresentation: import('./theme-types').BlockPresentation;
  mode: 'builder' | 'viewer';

  // actions
  setFormData: (data: Partial<FormData>) => void;
  setBlocks: (blocks: FormBlock[]) => void;
  addBlock: (blockTypeId: string) => void;
  updateBlock: (blockId: string, updates: Partial<FormBlock>) => void;
  updateBlockSettings: (blockId: string, settings: Record<string, unknown>) => void;
  updateBlockLayout: (blockId: string, layoutConfig: Partial<SlideLayout>) => void;
  removeBlock: (blockId: string) => void;
  reorderBlocks: (startIndex: number, endIndex: number) => void;
  setCurrentBlockId: (blockId: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setBlockSelectorOpen: (open: boolean) => void;
  getBlockPresentation: (blockId: string) => import('./theme-types').BlockPresentation;
  setBlockPresentation: (blockId: string, presentation: Partial<import('./theme-types').BlockPresentation>) => void;
  setFormTheme: (theme: Partial<import('./theme-types').FormTheme>) => void;
  setMode: (mode: 'builder' | 'viewer') => void;
  saveForm: () => Promise<void>;
  loadForm: (formId: string) => Promise<void>;
  getCurrentBlock: () => FormBlock | null;
}
