/**
 * Form Builder Store Slices
 * 
 * This file contains the type definitions for the slices of the form builder store.
 * Each slice represents a logical grouping of state and actions.
 */

import type { FormBlock } from './block-types';
import type { SlideLayout } from './layout-types';
import type { FormData } from './form-builder-types';
import type { Connection, ConditionRule } from './workflow-types';
import type { BlockPresentation, FormTheme } from './theme-types';

// Re-export types needed in other files
export type { Connection };

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
 * Manages connections between blocks and workflow UI state
 */
export interface FormWorkflowSlice {
  // Core data
  connections: Connection[];
  nodePositions: Record<string, { x: number; y: number }>;
  
  // UI state
  selectedElementId: string | null;
  isConnecting: boolean;
  sourceNodeId: string | null;
  targetNodeId: string | null;
  
  // ReactFlow state
  nodes: any[];
  edges: any[];
  
  // Selection actions
  selectElement: (elementId: string | null) => void;
  
  // Connection mode actions
  setConnectingMode: (isConnecting: boolean, sourceId?: string | null) => void;
  setIsConnecting: (isConnecting: boolean) => void;
  setSourceNodeId: (nodeId: string | null) => void;
  setTargetNodeId: (nodeId: string | null) => void;
  
  // Node position actions
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  updateNodePositions: (positions: Record<string, { x: number; y: number }>) => void;
  
  // ReactFlow actions
  setNodes: (nodes: any[]) => void;
  setEdges: (edges: any[]) => void;
  
  // Connection actions
  setConnections: (connections: Connection[]) => void;
  addConnection: (connection: Connection) => string; // Returns the new ID
  updateConnection: (connectionId: string, updates: Partial<Connection>) => void;
  removeConnection: (connectionId: string) => void;
  
  // Sync actions
  syncBlockOrderWithConnections: () => void; // Synchronizes block order with workflow connections
}

/**
 * Persistence Slice
 * Handles saving and loading forms
 */
export interface FormPersistenceSlice {
  // State
  isVersioned: boolean;
  
  // Actions
  saveForm: () => Promise<void>;
  loadForm: (formId: string) => Promise<void>;
  loadVersionedForm: (formId: string) => Promise<void>;
}
