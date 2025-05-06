/**
 * Form Builder Store Slices
 * 
 * This file contains the type definitions for the slices of the form builder store.
 * Each slice represents a logical grouping of state and actions.
 */

import type { FormBlock } from './block-types';
import type { SlideLayout } from './layout-types';
import type { FormData } from './form-builder-types';
import type { Connection } from './workflow-types';
import type { BlockPresentation, FormTheme } from './theme-types';

/**
 * Core Form Data Slice
 * Manages the basic form metadata and settings
 */
export interface FormCoreSlice {
  formData: FormData;
  isLoading: boolean;
  isSaving: boolean;
  mode: 'builder' | 'viewer';
  
  // Actions
  setFormData: (data: Partial<FormData>) => void;
  setMode: (mode: 'builder' | 'viewer') => void;
}

/**
 * Blocks Management Slice
 * Handles adding, updating, removing and reordering blocks
 */
export interface FormBlocksSlice {
  blocks: FormBlock[];
  currentBlockId: string | null;
  
  // Actions
  setBlocks: (blocks: FormBlock[]) => void;
  addBlock: (blockTypeId: string) => void;
  updateBlock: (blockId: string, updates: Partial<FormBlock>) => void;
  updateBlockSettings: (blockId: string, settings: Record<string, unknown>) => void;
  removeBlock: (blockId: string) => void;
  reorderBlocks: (startIndex: number, endIndex: number) => void;
  setCurrentBlockId: (blockId: string | null) => void;
  getCurrentBlock: () => FormBlock | null;
}

/**
 * Block Presentation Slice
 * Manages visual styling and layout of blocks
 */
export interface FormPresentationSlice {
  defaultBlockPresentation: BlockPresentation;
  
  // Actions
  updateBlockLayout: (blockId: string, layoutConfig: Partial<SlideLayout>) => void;
  getBlockPresentation: (blockId: string) => BlockPresentation;
  setBlockPresentation: (blockId: string, presentation: Partial<BlockPresentation>) => void;
  setFormTheme: (theme: Partial<FormTheme>) => void;
}

/**
 * UI State Slice
 * Manages UI-related state for the form builder
 */
export interface FormUISlice {
  sidebarOpen: boolean;
  blockSelectorOpen: boolean;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setBlockSelectorOpen: (open: boolean) => void;
}

/**
 * Workflow Slice
 * Manages connections between blocks
 */
export interface FormWorkflowSlice {
  connections: Connection[];
  
  // Actions
  setConnections: (connections: Connection[]) => void;
  addConnection: (connection: Connection) => void;
  updateConnection: (connectionId: string, updates: Partial<Connection>) => void;
  removeConnection: (connectionId: string) => void;
}

/**
 * Persistence Slice
 * Handles saving and loading forms
 */
export interface FormPersistenceSlice {
  // Actions
  saveForm: () => Promise<void>;
  loadForm: (formId: string) => Promise<void>;
}
