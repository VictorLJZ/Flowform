import { createClient } from '@/lib/supabase/client';
import { WorkspaceInvitation } from '@/types/supabase-types';

/**
 * Get all invitations sent from a specific workspace
 * 
 * @param workspaceId - The ID of the workspace
 * @returns Array of workspace invitations sent from the workspace
 */
export async function getSentInvitations(workspaceId: string): Promise<WorkspaceInvitation[]> {
  console.log('[getSentInvitations] Starting with workspaceId:', workspaceId);
  const supabase = createClient();
  
  try {
    // First check if the table exists by getting the table definition
    const { data: tableInfo, error: tableError } = await supabase
      .from('workspace_invitations')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('[getSentInvitations] Table check error:', JSON.stringify(tableError));
      console.error('[getSentInvitations] Table error code:', tableError.code);
      console.error('[getSentInvitations] Table error details:', tableError.details);
      console.error('[getSentInvitations] Table error hint:', tableError.hint);
      throw new Error(`Table check failed: ${tableError.message}`);
    }
    
    console.log('[getSentInvitations] Table exists, proceeding with query');
    
    // Proceed with the main query - simplified to avoid join issues
    const { data, error } = await supabase
      .from('workspace_invitations')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('invited_at', { ascending: false });
      
    console.log('[getSentInvitations] Query executed without joins');
    
    if (error) {
      console.error('[getSentInvitations] Query error:', JSON.stringify(error));
      console.error('[getSentInvitations] Error code:', error.code);
      console.error('[getSentInvitations] Error details:', error.details);
      console.error('[getSentInvitations] Error hint:', error.hint);
      throw error;
    }
    
    console.log(`[getSentInvitations] Success, retrieved ${data?.length || 0} invitations`);
    return data || [];
    
  } catch (error) {
    console.error('[getSentInvitations] Unexpected error:', error);
    if (error instanceof Error) {
      console.error('[getSentInvitations] Error message:', error.message);
      console.error('[getSentInvitations] Error stack:', error.stack);
    }
    throw error;
  }
}
