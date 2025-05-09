"use client"

import { StateCreator } from 'zustand'
import { produce } from 'immer'
import type { FormBuilderState } from '@/types/store-types'
import type { FormMediaSlice } from '@/types/form-store-slices-types-media'
import { MediaAsset, mockMediaAssets } from '@/types/media-types'

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
        state.selectedMediaId = id;
      })
    ),
    
    getMediaAssetById: (id: string) => {
      return get().mediaAssets[id];
    },
    
    getMediaAssetByMediaId: (mediaId: string) => {
      const assets = Object.values(get().mediaAssets);
      return assets.find(asset => asset.mediaId === mediaId);
    },
    
    loadMediaAssets: async () => {
      // Set loading state
      set(produce((state) => {
        state.isLoadingMedia = true;
      }));
      
      try {
        // Call the API to get media assets from Cloudinary
        const response = await fetch('/api/media/list');
        
        if (!response.ok) {
          throw new Error('Failed to fetch media assets');
        }
        
        const mediaAssets: MediaAsset[] = await response.json();
        
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
    }
  };
};
