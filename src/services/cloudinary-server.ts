/**
 * Server-side Cloudinary utilities
 * IMPORTANT: This file should only be imported in server components or API routes
 */

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with credentials from environment variables
if (!cloudinary.config().cloud_name) {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Create upload preset if it doesn't exist
export async function createUploadPreset() {
  try {
    const presetName = 'flowform_media_upload';
    
    // First check if credentials are properly configured
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary API credentials are not properly configured');
      return 'flowform_media_upload'; // Return default name to avoid breaking the app
    }
    
    try {
      // Check if preset already exists
      const presets = await cloudinary.api.upload_presets();
      
      const presetExists = presets.presets.some(
        (preset: any) => preset.name === presetName
      );
      
      if (!presetExists) {
        // Create the upload preset
        await cloudinary.api.create_upload_preset({
          name: presetName,
          unsigned: true,
          folder: 'flowform_media',
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

export { cloudinary };
