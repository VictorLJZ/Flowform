/**
 * Media Management Slice Type Definitions
 * 
 * These types extend the form builder store with media asset management functionality.
 */

import type { MediaAsset } from './media-types';

/**
 * Media Management Slice
 * Handles storing, retrieving, and managing media assets
 */
export interface FormMediaSlice {
  // State
  mediaAssets: Record<string, MediaAsset>;
  selectedMediaId: string | null;
  isLoadingMedia: boolean;
  
  // Actions
  addMediaAsset: (asset: MediaAsset) => void;
  updateMediaAsset: (id: string, updates: Partial<MediaAsset>) => void;
  removeMediaAsset: (id: string) => void;
  setSelectedMediaId: (id: string | null) => void;
  getMediaAssetById: (id: string) => MediaAsset | undefined;
  getMediaAssetByMediaId: (mediaId: string) => MediaAsset | undefined;
  loadMediaAssets: (workspaceId: string) => Promise<MediaAsset[]>;
  deleteMediaAsset: (mediaId: string, workspaceId: string) => Promise<boolean>;
}
