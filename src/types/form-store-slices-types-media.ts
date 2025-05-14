/**
 * Media Management Slice Type Definitions
 * 
 * These types extend the form builder store with media asset management functionality.
 */

import type { UiMediaAsset } from './media/UiMedia';

/**
 * Media Management Slice
 * Handles storing, retrieving, and managing media assets
 */
export interface FormMediaSlice {
  // State
  mediaAssets: Record<string, UiMediaAsset>;
  selectedMediaId: string | null; // Empty string ('') also used to indicate no selection
  isLoadingMedia: boolean;
  
  // Actions
  addMediaAsset: (asset: UiMediaAsset) => void;
  updateMediaAsset: (id: string, updates: Partial<UiMediaAsset>) => void;
  removeMediaAsset: (id: string) => void;
  setSelectedMediaId: (id: string | null) => void;
  getMediaAssetById: (id: string) => UiMediaAsset | undefined;
  getMediaAssetByMediaId: (mediaId: string) => UiMediaAsset | undefined;
  loadMediaAssets: (workspaceId: string) => Promise<UiMediaAsset[]>;
  deleteMediaAsset: (mediaId: string, workspaceId: string) => Promise<boolean>;
}
