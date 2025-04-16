/**
 * Supabase RPC wrapper utility for handling special cases with PostgreSQL functions
 */
import { SupabaseClient } from '@supabase/supabase-js';
import { PostgreSQLBlockData, PostgreSQLFormData, PostgreSQLRPCResponse } from '@/types/postgresql-types';

/**
 * Wrapper for save_form_with_blocks RPC call that handles workspace_id separately
 * This ensures workspace_id is properly transmitted to PostgreSQL
 * 
 * @param supabase Supabase client
 * @param formData Form data with workspace_id
 * @param blocksData Blocks data
 * @returns Response from save_form_with_blocks RPC
 */
export async function saveFormWithBlocksRPC<T>(
  supabase: SupabaseClient,
  formData: PostgreSQLFormData,
  blocksData: PostgreSQLBlockData[]
): Promise<PostgreSQLRPCResponse<T>> {
  // Extract workspace_id from form data
  const workspaceId = formData.workspace_id;
  
  if (!workspaceId) {
    console.error('Missing workspace_id in form data');
    return {
      data: null,
      error: {
        message: 'Missing workspace_id in form data',
        details: 'workspace_id is required for save_form_with_blocks'
      }
    };
  }
  
  // Direct RPC call with modified parameters structure
  try {
    console.log('🛠️ RPC Wrapper - Using workspace_id:', workspaceId);
    
    // Create SQL function call with workspace_id as a function parameter
    // This SQL statement uses the workspace_id parameter directly
    const sql = `
      SELECT * FROM save_form_with_blocks_with_workspace(
        $1::jsonb, 
        $2::jsonb, 
        $3::uuid
      );
    `;
    
    // Execute the function call with prepared parameters
    const { data, error } = await supabase
      .rpc('postgres_query_raw', {
        query: sql,
        params: [
          JSON.stringify(formData),
          JSON.stringify(blocksData),
          workspaceId
        ]
      });
    
    return { data: data as T, error };
  } catch (error) {
    console.error('Error in saveFormWithBlocksRPC:', error);
    return {
      data: null,
      error: {
        message: 'Error executing save_form_with_blocks RPC',
        details: error instanceof Error ? error.message : String(error)
      }
    };
  }
}
