/**
 * PostgreSQL Compatibility Utilities
 * 
 * These utilities ensure proper data formatting for PostgreSQL RPC calls,
 * specifically addressing array dimension parsing errors that occur when
 * sending complex data structures to PostgreSQL functions.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { PostgreSQLEntity, PostgreSQLError, PostgreSQLRPCResponse } from '@/types/postgresql-types';
import { SafeRecord } from '@/types/util-types';

// For strongly-typed parameter access
interface FormDataParams {
  p_form_data?: {
    workspace_id?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Format data for PostgreSQL compatibility, handling empty arrays
 * and nested data structures properly
 * 
 * @param data Any data structure to be sent to PostgreSQL
 * @returns A PostgreSQL-compatible version of the data
 */
export function formatForPostgreSQL<T>(data: T): unknown {
  // Handle null/undefined
  if (data === null || data === undefined) {
    return null;
  }
  
  // Handle arrays (the primary cause of PostgreSQL dimension errors)
  if (Array.isArray(data)) {
    if (data.length === 0) {
      // Return an actual empty array - let the calling code handle PostgreSQL compatibility
      // This is more flexible than using a special marker string
      return [];
    }
    
    // For non-empty arrays, process each element
    return data.map(item => formatForPostgreSQL(item));
  }
  
  // Handle objects
  if (typeof data === 'object') {
    const result: SafeRecord = {};
    
    for (const [key, value] of Object.entries(data)) {
      result[key] = formatForPostgreSQL(value);
    }
    
    return result;
  }
  
  // Primitives can pass through unchanged
  return data;
}

/**
 * Execute a PostgreSQL RPC call with proper handling for array dimensions and data types
 * This wrapper ensures proper parameter formatting for PostgreSQL compatibility
 * 
 * @param supabase Supabase client
 * @param functionName Name of the PostgreSQL function to call
 * @param params Parameters to pass to the function
 * @returns Response data and error if any
 */
export async function executePostgreSQLRPC<T>(
  supabase: SupabaseClient,
  functionName: string,
  params: FormDataParams
): Promise<PostgreSQLRPCResponse<T>> {
  // Process parameters for PostgreSQL compatibility
  const processedParams: SafeRecord = {};
  
  console.log('🔍 RPC DIAGNOSTIC - Input params:', JSON.stringify(params));
  console.log('🔍 RPC DIAGNOSTIC - Input form_data workspace_id:', 
            params.p_form_data?.workspace_id,
            'type:', typeof params.p_form_data?.workspace_id);
  
  // Handle each parameter individually to ensure proper PostgreSQL compatibility
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value) && value.length === 0) {
      // Let PostgreSQL handle empty arrays directly - don't convert to string
      // This prevents the "[" must introduce explicitly-specified array dimensions error
      processedParams[key] = [];
    } else if (typeof value === 'object' && value !== null) {
      // Standard processing for all objects
      processedParams[key] = JSON.stringify(value);
      
      // Check if workspace_id was preserved after stringify (for diagnostic purposes)
      if (key === 'p_form_data') {
        const parsedBack = JSON.parse(processedParams[key] as string) as {workspace_id?: string};
        console.log('🔍 RPC DIAGNOSTIC - After stringify form_data workspace_id:', 
                  parsedBack.workspace_id, 'type:', typeof parsedBack.workspace_id);
      }
    } else {
      // Pass primitives as-is
      processedParams[key] = value;
    }
  }
  
  // Final debug of processed parameters before sending to PostgreSQL
  console.log('🔍 RPC DIAGNOSTIC - Final processed params:', processedParams);
  if (processedParams.p_form_data) {
    try {
      const parsedFormData = JSON.parse(processedParams.p_form_data as string) as {workspace_id?: string};
      console.log('🔍 RPC DIAGNOSTIC - Final parsed form_data workspace_id:', 
                parsedFormData.workspace_id, 'type:', typeof parsedFormData.workspace_id);
    } catch (e) {
      console.log('🔍 RPC DIAGNOSTIC - Error parsing form_data:', e);
    }
  }
  
  // Final debug of processed parameters before sending to PostgreSQL
  console.log('🔍 RPC DIAGNOSTIC - Final processed params:', processedParams);
  if (processedParams.p_form_data) {
    try {
      const parsedFormData = JSON.parse(processedParams.p_form_data as string) as {workspace_id?: string};
      console.log('🔍 RPC DIAGNOSTIC - Final parsed form_data workspace_id:', 
                parsedFormData.workspace_id, 'type:', typeof parsedFormData.workspace_id);
    } catch (e) {
      console.log('🔍 RPC DIAGNOSTIC - Error parsing form_data:', e);
    }
  }
  
  try {
    
    // Standard RPC call for other functions
    const { data, error } = await supabase.rpc(functionName, processedParams);
    return { data: data as T, error };
  } catch (error) {
    console.error(`Error executing PostgreSQL RPC function ${functionName}:`, error);
    const pgError: PostgreSQLError = {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'RPC_ERROR'
    };
    return { data: null, error: pgError };
  }
}

// CriticalFields interface replaced by PostgreSQLEntity in types/postgresql-types.ts

/**
 * Explicit field formatter for critical fields to prevent PostgreSQL type errors
 * Ensures workspace_id and other important fields are properly preserved
 * 
 * @param formData Form data with fields to preserve
 * @returns Form data with explicitly typed fields
 */
export function ensureCriticalFields<T extends PostgreSQLEntity>(formData: T): T & {title?: string; status?: string} {
  if (!formData) return formData;
  
  // Create a new object to avoid mutating the original
  const enhanced = { ...formData };
  
  // Ensure critical fields are explicitly preserved as strings
  if ('workspace_id' in formData) {
    enhanced.workspace_id = formData.workspace_id?.toString() || undefined;
  }
  
  if ('id' in formData) {
    enhanced.id = formData.id?.toString() || undefined;
  }
  
  if ('created_by' in formData) {
    enhanced.created_by = formData.created_by?.toString() || undefined;
  }
  
  // Provide defaults for optional fields
  if ('title' in formData) {
    // Use type assertion to safely access the title property
    const titleValue = (formData as unknown as { title?: string }).title;
    (enhanced as { title?: string }).title = titleValue || 'Untitled';
  }
  
  if ('status' in formData) {
    // Use type assertion to safely access the status property
    const statusValue = (formData as unknown as { status?: string }).status;
    (enhanced as { status?: string }).status = statusValue || 'draft';
  }

  return enhanced;
}
