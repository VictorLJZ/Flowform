/**
 * Media service functions
 * Contains client-side functions for interacting with media API endpoints
 */

/**
 * Deletes a media asset from Cloudinary
 * @param publicId The public ID of the media asset to delete
 * @returns Promise resolving to a boolean indicating success
 */
export async function deleteMediaAsset(publicId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/media/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
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
