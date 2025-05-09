import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create a single upload preset function for server-side use
export async function createUploadPreset() {
  try {
    // Check if preset already exists
    const presets = await cloudinary.api.upload_presets();
    const presetName = 'flowform_media_upload';
    
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

export { cloudinary };
