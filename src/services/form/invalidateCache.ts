import { invalidateFormContextCache } from './getFormContext';

/**
 * Register cache invalidation for form-related services
 * This should be called whenever form data is modified
 * 
 * @param formId - The ID of the form to invalidate
 */
export function invalidateFormCache(formId: string): void {
  // Invalidate form context cache
  invalidateFormContextCache(formId);
  
  // Add other cache invalidations here as needed
}
