// src/types/error-types.ts
// Type definitions for error handling

/**
 * Supabase PostgrestError structure
 */
export type PostgrestError = {
    message: string;
    details: string;
    hint: string;
    code: string;
  };
  
  /**
   * API response error format
   */
  export type ApiError = {
    error: string;
    details?: unknown;
    code?: string;
  };
  
  /**
   * Function to check if an unknown error is a PostgrestError
   */
  export const isPostgrestError = (error: unknown): error is PostgrestError => {
    return (
      error !== null &&
      typeof error === 'object' &&
      'message' in error &&
      'details' in error &&
      'hint' in error &&
      'code' in error
    );
  };