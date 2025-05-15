/**
 * Utility for loading media assets in the public form viewer
 */
import { useFormBuilderStore } from '@/stores/formBuilderStore';
import { UiBlock } from '@/types/block';
import { ApiMediaAsset } from '@/types/media/ApiMedia';
import { UiMediaAsset } from '@/types/media/UiMedia';
import { SlideLayout } from '@/types/layout-types';

/**
 * Extracts all media IDs used in form blocks layouts
 */
export function extractMediaIds(blocks: UiBlock[]): string[] {
  const mediaIds: string[] = [];
  
  blocks.forEach(block => {
    // Check if the block has layout settings
    if (block.settings?.layout) {
      const layout = block.settings.layout as SlideLayout;
      
      // If the layout has a mediaId, add it to the list
      if ('mediaId' in layout && layout.mediaId) {
        mediaIds.push(layout.mediaId);
      }
    }
  });
  
  // Return unique media IDs
  return [...new Set(mediaIds)];
}

/**
 * Converts a Cloudinary public ID to a MediaAsset object
 */
export function cloudinaryPublicIdToMediaAsset(publicId: string, workspaceId?: string): ApiMediaAsset {
  // Extract the file name for display purposes (last part of the path)
  const fileName = publicId.split('/').pop() || publicId;
  
  // Determine media type based on file extension
  const isVideo = /\.(mp4|webm|mov|avi)$/i.test(fileName);
  const type = isVideo ? 'video' : 'image';
  
  // Create an ApiMediaAsset object
  return {
    id: publicId, // Use publicId as the ID
    mediaId: publicId,
    userId: 'system', // System user for form media
    workspaceId: workspaceId || 'system', // Default to system workspace if not provided
    filename: fileName,
    url: `https://res.cloudinary.com/your-cloud-name/image/upload/${publicId}`,
    secureUrl: `https://res.cloudinary.com/your-cloud-name/image/upload/${publicId}`,
    type: type,
    format: fileName.split('.').pop() || '',
    bytes: 0, // Unknown size
    resourceType: type,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Loads media assets for a form and adds them to the form builder store
 */
export async function loadFormMedia(blocks: UiBlock[], workspaceId?: string): Promise<void> {
  // Get all media IDs used in the form
  const mediaIds = extractMediaIds(blocks);
  
  if (mediaIds.length === 0) {
    return; // No media to load
  }
  
  // Get the store functions
  const { addMediaAsset } = useFormBuilderStore.getState();
  
  // Add each media asset to the store
  mediaIds.forEach(mediaId => {
    // Skip if mediaId is invalid
    if (!mediaId) return;
    
    // Create an ApiMediaAsset object from the public ID
    const apiMediaAsset = cloudinaryPublicIdToMediaAsset(mediaId, workspaceId);
    
    // Convert to UiMediaAsset
    const uiMediaAsset: UiMediaAsset = {
      ...apiMediaAsset,
      displayName: apiMediaAsset.filename,
      formattedSize: '0 KB',
      formattedDate: new Date(apiMediaAsset.createdAt).toLocaleDateString(),
      isSelected: false,
      isHovered: false,
      isProcessing: false,
      thumbnail: apiMediaAsset.url,
    };
    
    // Add the asset to the store
    addMediaAsset(uiMediaAsset);
  });
  
  console.log(`[loadFormMedia] Loaded ${mediaIds.length} media assets for form viewer`);
}
