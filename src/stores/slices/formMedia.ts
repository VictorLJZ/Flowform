"use client"

import { StateCreator } from 'zustand'
import { produce } from 'immer'
import type { FormBuilderState } from '@/types/store-types'
import type { FormMediaSlice } from '@/types/form-store-slices-types-media'
import { MediaAsset, mockMediaAssets } from '@/types/media-types'
import { deleteMediaAsset as deleteMediaFromCloudinary, fetchWorkspaceMediaAssets } from '@/services/media-service'

export const createFormMediaSlice: StateCreator<
  FormBuilderState,
  [],
  [],
  FormMediaSlice
> = (set, get) => {
  // Convert mock assets array to a record for initial state
  const initialMediaAssets: Record<string, MediaAsset> = {};
  mockMediaAssets.forEach(asset => {
    initialMediaAssets[asset.id] = asset;
  });

  return {
    // Initial state
    mediaAssets: initialMediaAssets,
    selectedMediaId: null,
    isLoadingMedia: false,
    
    // Actions
    addMediaAsset: (asset: MediaAsset) => set(
      produce((state) => {
        state.mediaAssets[asset.id] = asset;
      })
    ),
    
    updateMediaAsset: (id: string, updates: Partial<MediaAsset>) => set(
      produce((state) => {
        if (state.mediaAssets[id]) {
          state.mediaAssets[id] = { ...state.mediaAssets[id], ...updates };
        }
      })
    ),
    
    removeMediaAsset: (id: string) => set(
      produce((state) => {
        delete state.mediaAssets[id];
        // If the deleted asset was selected, clear selection
        if (state.selectedMediaId === id) {
          state.selectedMediaId = null;
        }
      })
    ),
    
    setSelectedMediaId: (id: string | null) => set(
      produce((state) => {
        // Handle empty string as null to maintain consistent state representation
        state.selectedMediaId = id === '' ? null : id;
      })
    ),
    
    getMediaAssetById: (id: string) => {
      return get().mediaAssets[id];
    },
    
    getMediaAssetByMediaId: (mediaId: string) => {
      const assets = Object.values(get().mediaAssets);
      return assets.find(asset => asset.mediaId === mediaId);
    },
    
    loadMediaAssets: async (workspaceId: string) => {
      // Validate workspaceId
      if (!workspaceId) {
        console.error('Workspace ID is required to load media assets');
        return [];
      }
      
      // Set loading state
      set(produce((state) => {
        state.isLoadingMedia = true;
      }));
      
      try {
        // Call the API to get media assets from Cloudinary for the workspace
        const mediaAssets = await fetchWorkspaceMediaAssets(workspaceId);
        
        // Add all media assets to the store
        set(produce((state) => {
          // Create a new record to replace existing assets
          const newMediaAssets: Record<string, MediaAsset> = {};
          
          // Add each media asset to the new record
          mediaAssets.forEach(asset => {
            newMediaAssets[asset.id] = asset;
          });
          
          // Replace the media assets with the new ones
          state.mediaAssets = newMediaAssets;
          state.isLoadingMedia = false;
        }));
        
        return mediaAssets;
      } catch (error) {
        console.error('Error loading media assets:', error);
        
        // Reset loading state on error
        set(produce((state) => {
          state.isLoadingMedia = false;
        }));
        
        return [];
      }
    },
    
    deleteMediaAsset: async (mediaId: string, workspaceId: string) => {
      // Validate workspaceId
      if (!workspaceId) {
        console.error('Workspace ID is required to delete media assets');
        return false;
      }
      
      const asset = get().getMediaAssetByMediaId(mediaId);
      
      if (!asset) {
        console.error('Media asset not found:', mediaId);
        return false;
      }
      
      // First, remove from the store
      set(
        produce((state) => {
          delete state.mediaAssets[asset.id];
          // If the deleted asset was selected, clear selection
          if (state.selectedMediaId === mediaId) {
            state.selectedMediaId = null;
          }
        })
      );
      
      // Then, delete from Cloudinary
      try {
        const success = await deleteMediaFromCloudinary(mediaId, workspaceId);
        return success;
      } catch (error) {
        console.error('Error deleting media asset:', error);
        return false;
      }
    }
  };
};
