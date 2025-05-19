"use client"

import { StateCreator } from 'zustand'
import { produce } from 'immer'
import type { FormBuilderState } from '@/types/store-types'
import type { FormMediaSlice, ImageEditorTransformations, ImageEditorState } from '@/types/form-store-slices-types-media'
import { UiMediaAsset } from '@/types/media/UiMedia'
import { 
  deleteMediaAsset as deleteMediaFromCloudinary, 
  fetchWorkspaceMediaAssets,
  saveEditedMedia as saveEditedMediaService 
} from '@/services/media-service'
import { apiToUiMediaAssets } from '@/utils/type-utils/media'
import { generateTransformations } from '../../utils/cloudinary-transforms'

export const createFormMediaSlice: StateCreator<
  FormBuilderState,
  [],
  [],
  FormMediaSlice
> = (set, get) => {
  // Initialize with empty media assets record
  const initialMediaAssets: Record<string, UiMediaAsset> = {};

  return {
    // Initial state
    mediaAssets: initialMediaAssets,
    selectedMediaId: null,
    isLoadingMedia: false,
    
    // Image Editor State
    editingMediaId: null,
    isEditing: false,
    editingHistory: {},
    
    // Actions
    addMediaAsset: (asset: UiMediaAsset) => set(
      produce((state) => {
        state.mediaAssets[asset.id] = asset;
      })
    ),
    
    updateMediaAsset: (id: string, updates: Partial<UiMediaAsset>) => set(
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
        const apiMediaAssets = await fetchWorkspaceMediaAssets(workspaceId);
        
        // Convert API assets to UI assets
        const uiMediaAssets = apiToUiMediaAssets(apiMediaAssets);
        
        // Add all media assets to the store
        set(produce((state) => {
          // Create a new record to replace existing assets
          const newMediaAssets: Record<string, UiMediaAsset> = {};
          
          // Add each media asset to the new record
          uiMediaAssets.forEach(asset => {
            newMediaAssets[asset.id] = asset;
          });
          
          // Replace the media assets with the new ones
          state.mediaAssets = newMediaAssets;
          state.isLoadingMedia = false;
        }));
        
        return uiMediaAssets;
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
    },
    // Image Editor Actions
    startEditingMedia: (id: string) => set(
      produce((state) => {
        const asset = state.mediaAssets[id];
        if (!asset) return;
        
        state.editingMediaId = id;
        state.isEditing = true;
        
        // Initialize history if not exists
        if (!state.editingHistory[id]) {
          state.editingHistory[id] = {
            transformations: {},
            original: asset,
            previewUrl: asset.url
          };
        }
      })
    ),
    
    cancelEditing: () => set(
      produce((state) => {
        state.editingMediaId = null;
        state.isEditing = false;
      })
    ),
    
    updateEditorTransformations: (transformations: Partial<ImageEditorTransformations>) => set(
      produce((state) => {
        const { editingMediaId } = state;
        if (!editingMediaId) return;
        
        // Update transformations
        state.editingHistory[editingMediaId].transformations = {
          ...state.editingHistory[editingMediaId].transformations,
          ...transformations
        };
        
        // Generate preview URL
        const asset = state.mediaAssets[editingMediaId];
        const transforms = state.editingHistory[editingMediaId].transformations;
        
        if (asset) {
          const transformString = generateTransformations(transforms);
          if (!transformString) {
            state.editingHistory[editingMediaId].previewUrl = asset.url;
            return;
          }
          
          // Parse the Cloudinary URL to insert transformations
          const baseUrl = asset.url.split('/upload/')[0];
          const publicId = asset.url.split('/upload/')[1];
          
          if (baseUrl && publicId) {
            // The correct format for Cloudinary transformations is:
            // https://res.cloudinary.com/cloud-name/image/upload/transformation_params/public_id
            state.editingHistory[editingMediaId].previewUrl = 
              `${baseUrl}/upload/${transformString ? transformString + '/' : ''}${publicId}`;
              
            // Force update the preview by adding a timestamp parameter
            state.editingHistory[editingMediaId].previewUrl += 
              (state.editingHistory[editingMediaId].previewUrl.includes('?') ? '&' : '?') + 
              '_t=' + Date.now();
          }
        }
      })
    ),
    
    /**
     * Generates a preview URL for the current image with transformations applied
     * @returns The preview URL or null if no image is being edited
     */
    getEditorPreviewUrl: () => {
      const { editingMediaId, editingHistory } = get();
      
      if (!editingMediaId || !editingHistory[editingMediaId]) {
        return undefined;
      }
      
      return editingHistory[editingMediaId]?.previewUrl || undefined;
    },
    
    /**
     * Generates a preview URL for the crop tab that includes all transformations except cropping
     * This prevents circular dependencies between preview and crop
     * @returns The non-crop preview URL or null if no image is being edited
     */
    getNonCropPreviewUrl: () => {
      const { editingMediaId, mediaAssets, editingHistory } = get();
      
      if (!editingMediaId || !mediaAssets[editingMediaId]) {
        return null;
      }
      
      const asset = mediaAssets[editingMediaId];
      const transforms = editingHistory[editingMediaId]?.transformations;
      
      if (!transforms) {
        return asset.url;
      }
      
      // Generate transformation string WITHOUT crop transformations
      const transformString = generateTransformations(transforms, ['crop']);
      
      if (!transformString) {
        return asset.url;
      }
      
      // Parse the Cloudinary URL
      const baseUrl = asset.url.split('/upload/')[0];
      const publicId = asset.url.split('/upload/')[1];
      
      if (!baseUrl || !publicId) {
        return asset.url;
      }
      
      // Build the URL with transformations and cache busting
      const previewUrl = `${baseUrl}/upload/${transformString ? transformString + '/' : ''}${publicId}`;
      const cacheBuster = `_t=${Date.now()}`;
      
      return previewUrl + (previewUrl.includes('?') ? '&' : '?') + cacheBuster;
    },

    /**
     * Generates a preview URL for the adjustments tab that properly applies
     * transformations in the correct order (crop first, then adjustments)
     * @returns The adjustments preview URL or null if no image is being edited
     */
    getAdjustmentsPreviewUrl: () => {
      const { editingMediaId, mediaAssets, editingHistory } = get();
      
      if (!editingMediaId || !mediaAssets[editingMediaId]) {
        return null;
      }
      
      const asset = mediaAssets[editingMediaId];
      const transforms = editingHistory[editingMediaId]?.transformations;
      
      if (!transforms) {
        return asset.url;
      }
      
      // First apply only the crop transformation
      const cropOnlyTransforms = { ...transforms, adjustments: undefined, filter: undefined };
      const cropString = generateTransformations(cropOnlyTransforms);
      
      // Then apply only the adjustments without crop
      const adjustmentsOnly = { ...transforms, crop: undefined };
      const adjustmentsString = generateTransformations(adjustmentsOnly, ['crop']);
      
      // Parse the Cloudinary URL
      const baseUrl = asset.url.split('/upload/')[0];
      const publicId = asset.url.split('/upload/')[1];
      
      if (!baseUrl || !publicId) {
        return asset.url;
      }
      
      // Build the URL with transformations in proper order and cache busting
      // This ensures cropString is applied first, then adjustmentsString
      const transformParts = [];
      if (cropString) transformParts.push(cropString);
      if (adjustmentsString) transformParts.push(adjustmentsString);
      
      const transformString = transformParts.join('/');
      const previewUrl = `${baseUrl}/upload/${transformString ? transformString + '/' : ''}${publicId}`;
      const cacheBuster = `_t=${Date.now()}`;
      
      return previewUrl + (previewUrl.includes('?') ? '&' : '?') + cacheBuster;
    },
    
    /**
     * Save the edited media to Cloudinary
     * @param workspaceId The workspace ID where the media belongs
     * @returns Promise resolving to success status
     */
    saveEditedMedia: async (workspaceId: string) => {
      const { editingMediaId, editingHistory, mediaAssets } = get();
      
      if (!editingMediaId || !editingHistory[editingMediaId] || !workspaceId) {
        return false;
      }
      
      const asset = mediaAssets[editingMediaId];
      const transforms = editingHistory[editingMediaId].transformations;
      const transformString = generateTransformations(transforms);
      
      if (!asset || !transformString) {
        return false;
      }
      
      try {
        // Call service to save edited media
        const result = await saveEditedMediaService(asset.mediaId, workspaceId, transformString);
        
        if (result) {
          // Update the media asset in the store
          set(
            produce((state) => {
              // Add the edited media as a new asset
              state.mediaAssets[result.id] = result;
              
              // Clean up editing state
              state.editingMediaId = null;
              state.isEditing = false;
              delete state.editingHistory[editingMediaId];
            })
          );
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error saving edited media:', error);
        return false;
      }
    }
  };
};
