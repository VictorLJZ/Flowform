import { SaveFormInput, SaveFormOutput } from '@/types/form-service-types';
import type { FormBlock as FrontendFormBlock } from '@/types/block-types';
import { FormVersion } from '@/types/form-version-types';
import { saveFormWithBlocks } from './saveFormWithBlocks';

// Function implementations have been moved to dedicated service files
// according to single responsibility principle

/**
 * Save a form with versioning support
 * Unlike older implementations, this no longer creates versions during autosave
 * Versions are ONLY created when explicitly publishing the form
 * 
 * @param formData Form data to save
 * @param blocks Form blocks to save
 * @returns Object containing saved form, blocks, success status
 */
export async function saveFormWithVersioning(
  formData: SaveFormInput, 
  blocks: FrontendFormBlock[]
): Promise<SaveFormOutput & { version?: FormVersion | null }> {
  try {
    // Simply save the form and blocks without creating versions
    // Versioning is now handled exclusively in publishFormWithFormBuilderStore.ts
    const result = await saveFormWithBlocks(formData, blocks);
    
    if (!result.success) {
      throw new Error('Failed to save form');
    }
    
    // Return the result without any version information
    // This ensures autosaves only update the database and don't create versions
    
    return result;
  } catch (error) {
    console.error('Failed to save form with versioning:', error);
    throw error;
  }
}
