/**
 * Server-side Cloudinary utilities
 * IMPORTANT: This file should only be imported in server components or API routes
 */

// Use dynamic import for better compatibility with Next.js
import type { v2 as CloudinaryType } from 'cloudinary';

// Initialize Cloudinary with a dynamic import
// This avoids the 'Module not found' error during build time
let cloudinaryModule: { v2: typeof CloudinaryType } | null = null;

// Helper function to initialize and get the cloudinary instance
async function getCloudinary(): Promise<typeof CloudinaryType> {
  if (!cloudinaryModule) {
    try {
      // Dynamic import happens at runtime, not build time
      cloudinaryModule = await import('cloudinary');
    } catch (error) {
      console.error('Failed to load Cloudinary module:', error);
      throw new Error('Failed to initialize Cloudinary');
    }
  }

  const cloudinary = cloudinaryModule.v2;
  
  // Configure if not already configured
  if (!cloudinary.config().cloud_name) {
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
  
  return cloudinary;
}

// Create upload preset if it doesn't exist
export async function createUploadPreset(workspaceId?: string) {
  try {
    // Create a workspace-specific preset name if workspaceId is provided
    const presetName = workspaceId
      ? `flowform_media_${workspaceId.substring(0, 8)}`
      : 'flowform_media_upload';
    
    // First check if credentials are properly configured
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary API credentials are not properly configured');
      return 'flowform_media_upload'; // Return default name to avoid breaking the app
    }
    
    try {
      // Get the initialized cloudinary instance
      const cloudinary = await getCloudinary();
      
      // Check if preset already exists
      const presets = await cloudinary.api.upload_presets();
      
      const presetExists = presets.presets.some(
        (preset: Record<string, unknown>) => preset.name === presetName
      );
      
      if (!presetExists) {
        // Create the upload preset
        await cloudinary.api.create_upload_preset({
          name: presetName,
          unsigned: true,
          folder: workspaceId ? `flowform_media/${workspaceId}` : 'flowform_media',
          allowed_formats: 'jpg,png,gif,webp,mp4,webm',
          transformation: { quality: 'auto' },
          // Add more settings to make uploads more user-friendly
          use_filename: true,
          unique_filename: true,
          overwrite: false,
          resource_type: 'auto'
        });
        
        console.log(`Created Cloudinary upload preset: ${presetName}`);
      } else {
        console.log(`Cloudinary upload preset already exists: ${presetName}`);
      }
    } catch (apiError) {
      console.error('Error accessing Cloudinary API:', apiError);
      // Return the preset name anyway to keep app working
    }
    
    return presetName;
  } catch (error) {
    console.error('Error in createUploadPreset:', error);
    return 'flowform_media_upload'; // Return default name to avoid breaking the app
  }
}

// List media assets
export async function listMediaAssets() {
  try {
    // Get the initialized cloudinary instance
    const cloudinary = await getCloudinary();
    
    // Fetch media assets from Cloudinary
    const result = await cloudinary.search
      .expression('folder:flowform_media')
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();
      
    return result.resources;
  } catch (error) {
    console.error('Error listing media assets:', error);
    return [];
  }
}

// List media assets for a specific workspace
export async function listWorkspaceMediaAssets(workspaceId: string) {
  try {
    if (!workspaceId) {
      console.error('Workspace ID is required');
      return [];
    }
    
    // Get the initialized cloudinary instance
    const cloudinary = await getCloudinary();
    
    // Fetch media assets from the workspace-specific folder
    const result = await cloudinary.search
      .expression(`folder:flowform_media/${workspaceId}`)
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();
      
    return result.resources;
  } catch (error) {
    console.error(`Error listing media assets for workspace ${workspaceId}:`, error);
    return [];
  }
}

// Export the getCloudinary function instead of the cloudinary instance
export { getCloudinary };
