// Import type definitions only for build time
import type { v2 as CloudinaryType } from 'cloudinary';

// Initialize Cloudinary with a dynamic import
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

// Create a single upload preset function for server-side use
export async function createUploadPreset() {
  try {
    // Get the cloudinary instance
    const cloudinary = await getCloudinary();
    
    // Check if preset already exists
    const presets = await cloudinary.api.upload_presets();
    const presetName = 'flowform_media_upload';
    
    const presetExists = presets.presets.some(
      (preset: Record<string, unknown>) => preset.name === presetName
    );
    
    if (!presetExists) {
      // Create the upload preset
      await cloudinary.api.create_upload_preset({
        name: presetName,
        unsigned: true,
        folder: 'flowform_media',
        allowed_formats: 'jpg,png,gif,webp,mp4,webm',
        transformation: { quality: 'auto' }
      });
      
      console.log(`Created Cloudinary upload preset: ${presetName}`);
      return presetName;
    } else {
      console.log(`Cloudinary upload preset already exists: ${presetName}`);
      return presetName;
    }
  } catch (error) {
    console.error('Error creating Cloudinary upload preset:', error);
    return null;
  }
}

// Helper function to generate Cloudinary URL
export function getCloudinaryUrl(publicId: string, options: {
  type?: 'image' | 'video';
  width?: number;
  height?: number;
  quality?: string;
  crop?: string;
} = {}) {
  const { type = 'image', width, height, quality = 'auto', crop = 'fill' } = options;
  
  let transformations = `q_${quality}`;
  
  if (width && height) {
    transformations += `,w_${width},h_${height},c_${crop}`;
  }
  
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${type}/upload/${transformations}/${publicId}`;
}

// Export the getCloudinary function
export { getCloudinary };
