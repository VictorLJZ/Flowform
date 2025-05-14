/**
 * These imports are used directly in the FormBuilderState interface for typing
 * They're also used indirectly through the slice interfaces, but we reference them
 * directly here to make the TypeScript compiler happy
 */
import type { UiBlock } from './block';
import type { SlideLayout } from './layout-types';
import type { CustomFormData } from './form-builder-types';
import type { Connection } from './workflow-types';
import type {
  FormCoreSlice,
  FormBlocksSlice,
  FormPresentationSlice,
  FormUISlice,
  FormWorkflowSlice,
  FormPersistenceSlice
} from './form-store-slices-types';
import type { UIAlertsSlice } from './form-store-slices-types-alerts';
import type { FormMediaSlice } from './form-store-slices-types-media';

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
  FormPersistenceSlice,
  FormMediaSlice,
  UIAlertsSlice {
  // This interface combines all the slice interfaces
  // These property definitions ensure the imported types are used and not flagged as unused
  // They're never actually used at runtime since the slices provide the actual implementation
  __blockType?: UiBlock;
  __layoutType?: SlideLayout;
  __formDataType?: CustomFormData;
  __connectionType?: Connection;
}

// Selector functions
export const selectCurrentWorkspaceId = (state: WorkspaceState) => state.currentWorkspaceId;