/**
 * Cloudinary Transformation Utilities
 *
 * This file provides utility functions for working with Cloudinary transformations.
 */

import { ImageEditorTransformations } from '@/types/form-store-slices-types-media';

/**
 * Generates a Cloudinary transformation string from editor transformations
 * @param edits The image editor transformations to apply
 * @param exclude Optional array of transformation types to exclude
 * @returns A Cloudinary transformation string, or empty string if no edits
 */
export function generateTransformations(
  edits: ImageEditorTransformations,
  exclude: ('crop' | 'adjustments' | 'filter')[] = []
): string {
  if (!edits) {
    console.warn('No edits provided to generateTransformations');
    return '';
  }

  const parts: string[] = [];
  
  // Handle crop transformation (if not excluded)
  if (edits.crop && !exclude.includes('crop')) {
    const {x, y, width, height} = edits.crop;
    parts.push(`c_crop,x_${Math.round(x)},y_${Math.round(y)},w_${Math.round(width)},h_${Math.round(height)}`);
  }
  
  // Handle adjustment transformations (if not excluded)
  if (edits.adjustments && !exclude.includes('adjustments')) {
    const {brightness, contrast, rotate, flip, opacity} = edits.adjustments;
    
    if (brightness && brightness !== 0) {
      parts.push(`e_brightness:${brightness}`);
    }
    
    if (contrast && contrast !== 0) {
      parts.push(`e_contrast:${contrast}`);
    }
    
    // First, normalize angle to 0-359°
    let normalizedAngle = ((rotate || 0) % 360 + 360) % 360;
    // If angle is exactly 360, reset to 0 (they're equivalent)
    if (normalizedAngle === 360) normalizedAngle = 0;
    
    // Handle flip transformations based on current rotation angle
    const isAxisSwapped = normalizedAngle === 90 || normalizedAngle === 270;
    let flipString = '';
    
    // Since Cloudinary applies rotation first, we need to adjust which flip we apply
    // based on the current rotation angle to give the expected visual result
    if (flip) {
      if (flip === 'horizontal') {
        // At 90° or 270°, horizontal flip becomes vertical flip from user's perspective
        flipString = isAxisSwapped ? '.vflip' : '.hflip';
      } else if (flip === 'vertical') {
        // Similarly, vertical flip becomes horizontal flip at 90° or 270°
        flipString = isAxisSwapped ? '.hflip' : '.vflip';
      } else if (flip === 'both') {
        // Both flips remain the same regardless of rotation
        flipString = '.hflip.vflip';
      }
    }
    
    // For the final transformation string
    const angleParam = normalizedAngle;
    
    // Only add the transformation if rotation or flipping is needed
    if (angleParam !== 0 || flipString) {
      parts.push(`a_${angleParam}${flipString}`);
    }
    
    if (opacity !== undefined && opacity !== 100) {
      parts.push(`o_${opacity}`);
    }
  }
  
  // Handle filter transformation (if not excluded)
  if (edits.filter && !exclude.includes('filter')) {
    // Map filter presets to Cloudinary effects
    const filterMap: Record<string, string> = {
      'Duotone': 'e_gradient_fade',
      '1977': 'e_sepia:80',
      'Aden': 'e_sepia:30,e_brightness:10',
      'Brannan': 'e_sepia:50,e_contrast:50',
      'Brooklyn': 'e_brightness:10,e_sepia:30',
      'Clarendon': 'e_vibrance:20,e_contrast:20',
      'Gingham': 'e_brightness:5,e_saturation:-30',
      'Hudson': 'e_brightness:10,e_saturation:-10,e_contrast:10',
      'Inkwell': 'e_grayscale',
      'Valencia': 'e_brightness:10,e_sepia:25'
    };
    
    if (filterMap[edits.filter]) {
      parts.push(filterMap[edits.filter]);
    }
  }
  
  // Return empty string if no transformations, otherwise join them with commas
  return parts.length > 0 ? parts.join(',') : '';
}

/**
 * Generates a preview URL with transformations
 * 
 * @param originalUrl - Original Cloudinary URL
 * @param transformations - Transformation string
 * @returns Transformed URL
 */
export function getTransformedUrl(originalUrl: string, transformations: string): string {
  if (!transformations || !originalUrl) return originalUrl;
  
  // Split Cloudinary URL into base and resource parts
  const parts = originalUrl.split('/upload/');
  if (parts.length !== 2) return originalUrl;
  
  const [baseUrl, resourceId] = parts;
  
  return `${baseUrl}/upload/${transformations}/${resourceId}`;
}
