/**
 * Client-side Cloudinary utilities
 * This file contains only browser-safe methods for working with Cloudinary
 */

/**
 * Transforms a Cloudinary public ID into a delivery URL with transformations
 */
export function getCloudinaryUrl(publicId: string, options: {
  type?: 'image' | 'video';
  width?: number;
  height?: number;
  quality?: string;
  crop?: string;
} = {}) {
  if (!publicId) return '';
  
  // If it's already a full URL, return it
  if (publicId.startsWith('http')) return publicId;
  
  const { type = 'image', width, height, quality = 'auto', crop = 'fill' } = options;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    console.error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not defined');
    return '';
  }
  
  let transformations = `q_${quality}`;
  
  if (width && height) {
    transformations += `,w_${width},h_${height},c_${crop}`;
  }
  
  return `https://res.cloudinary.com/${cloudName}/${type}/upload/${transformations}/${publicId}`;
}

/**
 * Gets a thumbnail URL for a media asset
 */
export function getCloudinaryThumbnail(publicId: string, width = 200, height = 200) {
  return getCloudinaryUrl(publicId, {
    type: 'image',
    width,
    height,
    crop: 'fill',
    quality: 'auto'
  });
}
