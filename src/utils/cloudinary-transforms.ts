/**
 * Cloudinary Transformation Utilities
 *
 * This file provides utility functions for working with Cloudinary transformations.
 */

import { ImageEditorTransformations } from '@/types/form-store-slices-types-media';

/**
 * Generates a Cloudinary transformation string from editor transformations
 * @param edits The image editor transformations to apply
 * @returns A Cloudinary transformation string, or empty string if no edits
 */
export function generateTransformations(edits: ImageEditorTransformations): string {
  if (!edits) {
    console.warn('No edits provided to generateTransformations');
    return '';
  }

  const parts: string[] = [];
  
  // Handle crop transformation
  if (edits.crop) {
    const {x, y, width, height} = edits.crop;
    parts.push(`c_crop,x_${Math.round(x)},y_${Math.round(y)},w_${Math.round(width)},h_${Math.round(height)}`);
  }
  
  // Handle adjustment transformations
  if (edits.adjustments) {
    const {brightness, contrast, rotate, flip, opacity} = edits.adjustments;
    
    if (brightness && brightness !== 0) {
      parts.push(`e_brightness:${brightness}`);
    }
    
    if (contrast && contrast !== 0) {
      parts.push(`e_contrast:${contrast}`);
    }
    
    if (rotate && rotate !== 0) {
      parts.push(`a_${rotate}`);
    }
    
    if (flip) {
      if (flip === 'horizontal') {
        parts.push('e_flip');
      } else if (flip === 'vertical') {
        parts.push('e_flop');
      } else if (flip === 'both') {
        // Add as separate transformations instead of comma-joined string
        parts.push('e_flip');
        parts.push('e_flop');
      }
    }
    
    if (opacity !== undefined && opacity !== 100) {
      parts.push(`o_${opacity}`);
    }
  }
  
  // Handle filter transformation
  if (edits.filter) {
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
