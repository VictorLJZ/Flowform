import type { FormBlock } from './block-types';
import type { SlideLayout } from './layout-types';
import type { FormData } from './form-builder-types';
import type { Connection } from './workflow-types';
import type {
  FormCoreSlice,
  FormBlocksSlice,
  FormPresentationSlice,
  FormUISlice,
  FormWorkflowSlice,
  FormPersistenceSlice
} from './form-store-slices';

/**
 * Analytics store state and actions
 */
export type AnalyticsState = {
  // Keep state related to non-fetching actions if needed
  isExporting: boolean;
  exportError: string | null;

  // Actions
  exportResponses: (formId: string, format: 'csv' | 'excel') => Promise<void>
}

/**
 * Sidebar store state and actions
 */
export type SidebarState = {
  isOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
}

/**
 * Workspace store state and actions
 */
export interface WorkspaceState {
  currentWorkspaceId: string | null;
  setCurrentWorkspaceId: (workspaceId: string | null) => void;
}

/**
 * Form builder store state and actions
 */
export interface FormBuilderState extends 
  FormCoreSlice,
  FormBlocksSlice,
  FormPresentationSlice,
  FormUISlice,
  FormWorkflowSlice,
  FormPersistenceSlice {
  // This interface combines all the slice interfaces
  // No additional properties needed here as everything is defined in the slices
}

// Selector functions
export const selectCurrentWorkspaceId = (state: WorkspaceState) => state.currentWorkspaceId;