/**
 * Media Management Slice Type Definitions
 * 
 * These types extend the form builder store with media asset management functionality.
 */

import type { UiMediaAsset } from './media/UiMedia';

/**
 * Image Editor Transformations
 * Types for tracking image editor transformations
 */
export interface ImageEditorTransformations {
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  adjustments?: {
    rotate?: number;
    flip?: 'horizontal' | 'vertical' | 'both' | null;
    brightness?: number;
    contrast?: number;
    opacity?: number;
  };
  filter?: string | null;
}

/**
 * Image Editor State
 * Tracks the state and history of image editing
 */
export interface ImageEditorState {
  transformations: ImageEditorTransformations;
  original: UiMediaAsset;
  previewUrl?: string;
}

/**
 * Media Management Slice
 * Handles storing, retrieving, and managing media assets
 */
export interface FormMediaSlice {
  // State
  mediaAssets: Record<string, UiMediaAsset>;
  selectedMediaId: string | null; // Empty string ('') also used to indicate no selection
  isLoadingMedia: boolean;
  
  // Image Editor State
  editingMediaId: string | null;
  isEditing: boolean;
  editingHistory: Record<string, ImageEditorState>;
  
  // Actions
  addMediaAsset: (asset: UiMediaAsset) => void;
  updateMediaAsset: (id: string, updates: Partial<UiMediaAsset>) => void;
  removeMediaAsset: (id: string) => void;
  setSelectedMediaId: (id: string | null) => void;
  getMediaAssetById: (id: string) => UiMediaAsset | undefined;
  getMediaAssetByMediaId: (mediaId: string) => UiMediaAsset | undefined;
  loadMediaAssets: (workspaceId: string) => Promise<UiMediaAsset[]>;
  deleteMediaAsset: (mediaId: string, workspaceId: string) => Promise<boolean>;
  
  // Image Editor Actions
  startEditingMedia: (id: string) => void;
  cancelEditing: () => void;
  updateEditorTransformations: (transformations: Partial<ImageEditorTransformations>) => void;
  saveEditedMedia: (workspaceId: string) => Promise<boolean>;
  getEditorPreviewUrl: () => string | undefined;
}
