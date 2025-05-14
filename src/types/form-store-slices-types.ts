/**
 * Form Builder Store Slices
 * 
 * This file contains the type definitions for the slices of the form builder store.
 * Each slice represents a logical grouping of state and actions.
 */

import type { UiBlock } from './block';
import type { SlideLayout } from './layout-types';
import type { CustomFormData } from './form-builder-types';
import type { Connection } from './workflow-types';
import type { JsonObject } from './common-types';
import type { BlockPresentation, FormTheme } from './theme-types';
import type { Node, Edge } from 'reactflow';

// Re-export types needed in other files
export type { Connection };

/**
 * Core Form Data Slice
 * Manages the basic form metadata and settings
 */
export interface FormCoreSlice {
  formData: CustomFormData;
  isLoading: boolean;
  isSaving: boolean;
  mode: 'builder' | 'viewer';
  
  // Actions
  setFormData: (data: Partial<CustomFormData>) => void;
  setMode: (mode: 'builder' | 'viewer') => void;
}

/**
 * Blocks Management Slice
 * Handles adding, updating, removing and reordering blocks
 */
export interface FormBlocksSlice {
  blocks: UiBlock[];
  currentBlockId: string | null;
  
  // Actions
  setBlocks: (blocks: UiBlock[]) => void;
  addBlock: (blockTypeId: string) => void;
  updateBlock: (blockId: string, updates: Partial<UiBlock>) => void;
  updateBlockSettings: (blockId: string, settings: Record<string, unknown>) => void;
  removeBlock: (blockId: string) => void;
  reorderBlocks: (startIndex: number, endIndex: number) => void;
  setCurrentBlockId: (blockId: string | null) => void;
  getCurrentBlock: () => UiBlock | null;
}

/**
 * Block Presentation Slice
 * Manages visual styling and layout of blocks
 */
export interface FormPresentationSlice {
  defaultBlockPresentation: BlockPresentation;
  
  // Actions
  updateBlockLayout: (blockId: string, layoutConfig: Partial<SlideLayout>, viewportMode?: 'desktop' | 'mobile') => void;
  getBlockPresentation: (blockId: string) => BlockPresentation;
  setBlockPresentation: (blockId: string, presentation: Partial<BlockPresentation>) => void;
  setFormTheme: (theme: Partial<FormTheme>) => void;
  getEffectiveLayout: (blockId: string, viewportMode: 'desktop' | 'mobile') => SlideLayout | undefined;
}

/**
 * UI State Slice
 * Manages UI-related state for the form builder
 */
export interface FormUISlice {
  sidebarOpen: boolean;
  blockSelectorOpen: boolean;
  viewportMode: 'desktop' | 'mobile';
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setBlockSelectorOpen: (open: boolean) => void;
  setViewportMode: (mode: 'desktop' | 'mobile') => void;
}

/**
 * Workflow Slice
 * Manages connections between blocks and workflow UI state
 */
export interface FormWorkflowSlice {
  // Core data
  connections: Connection[];
  nodePositions: Record<string, { x: number; y: number }>;
  cyclicConnections: Record<string, boolean>; // Tracks connections that form infinite loops
  
  // UI state
  selectedElementId: string | null;
  isConnecting: boolean;
  sourceNodeId: string | null;
  targetNodeId: string | null;
  
  // ReactFlow state
  nodes: Node[];
  edges: Edge[];
  
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
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  
  // Connection actions
  setConnections: (connections: Connection[]) => void;
  addConnection: (connection: Connection) => string; // Returns the new ID
  updateConnection: (connectionId: string, updates: Partial<Connection>) => void;
  updateConnectionTarget: (connectionId: string, newTargetId: string) => boolean; // Returns success status
  removeConnection: (connectionId: string) => void;
  
  // Block observation methods
  onBlockAdded: (blockId: string) => void; // Called when a block is added to notify workflow system
  onBlockRemoved: (blockId: string) => void; // Called when a block is removed to clean up connections
  onBlocksReordered: (movedBlockId: string) => void; // Called when blocks are reordered with ID of moved block
  validateConnections: () => boolean; // Validates connections against blocks, returns true if all valid
  detectWorkflowCycles: () => void; // Detects cycles (infinite loops) in the workflow graph
  
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
  // Main orchestration function that saves everything
  saveForm: () => Promise<void>;
  
  // Individual save functions for different concerns
  saveFormAndBlocks: () => Promise<{ result: JsonObject, isExistingForm: boolean } | null>;
  saveWorkflowEdges: (formId: string) => Promise<boolean>;
  saveDynamicBlockConfigs: (result: JsonObject) => Promise<void>;
  
  // Load functions
  loadForm: (formId: string) => Promise<void>;
  loadVersionedForm: (formId: string) => Promise<void>;
}
