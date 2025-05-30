/**
 * Client-side media service functions
 */
import { ApiMediaAsset } from '@/types/media/ApiMedia';
import { UiMediaAsset } from '@/types/media/UiMedia';
import { apiToUiMediaAsset } from '@/utils/type-utils/media';

/**
 * Deletes a media asset from Cloudinary
 * @param publicId The Cloudinary public ID of the media asset to delete
 * @param workspaceId The workspace ID that owns the media asset
 * @returns Promise resolving to a boolean indicating success
 */
export async function deleteMediaAsset(publicId: string, workspaceId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/media/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId, workspaceId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete media asset');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting media asset:', error);
    return false;
  }
}

/**
 * Fetches Cloudinary configuration for a specific workspace
 * @param workspaceId The workspace ID to get configuration for
 * @returns Promise resolving to the Cloudinary configuration
 */
export async function getCloudinaryConfig(workspaceId: string) {
  try {
    const response = await fetch(`/api/media/cloudinary-config?workspaceId=${encodeURIComponent(workspaceId)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch Cloudinary configuration');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Cloudinary config:', error);
    return null;
  }
}

/**
 * Fetches media assets for a specific workspace
 * @param workspaceId The workspace ID to get media assets for
 * @returns Promise resolving to an array of MediaAsset objects
 */
export async function fetchWorkspaceMediaAssets(workspaceId: string): Promise<ApiMediaAsset[]> {
  try {
    const response = await fetch(`/api/media/list?workspaceId=${encodeURIComponent(workspaceId)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch media assets');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching workspace media assets:', error);
    return [];
  }
}

/**
 * Saves edited media with transformations
 * @param mediaId The media ID of the asset to edit
 * @param workspaceId The workspace ID that owns the media asset
 * @param transformations The Cloudinary transformation string
 * @returns Promise resolving to the updated UiMediaAsset or null if failed
 */
export async function saveEditedMedia(
  mediaId: string,
  workspaceId: string,
  transformations: string
): Promise<UiMediaAsset | null> {
  try {
    const response = await fetch('/api/media/transform', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mediaId, workspaceId, transformations }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save edited media');
    }
    
    const apiMediaAsset = await response.json();
    return apiToUiMediaAsset(apiMediaAsset);
  } catch (error) {
    console.error('Error saving edited media:', error);
    return null;
  }
}
