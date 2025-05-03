import type { FormBlock } from './block-types';
import type { SlideLayout } from './layout-types';
import type { FormData } from './form-builder-types';
import type { Connection } from './workflow-types';

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
export interface FormBuilderState {
  formData: FormData;
  blocks: FormBlock[];
  connections: Connection[];
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
  setConnections: (connections: Connection[]) => void;
  addConnection: (connection: Connection) => void;
  updateConnection: (connectionId: string, updates: Partial<Connection>) => void;
  removeConnection: (connectionId: string) => void;
}

// Selector functions
export const selectCurrentWorkspaceId = (state: WorkspaceState) => state.currentWorkspaceId;