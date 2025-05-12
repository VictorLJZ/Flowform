import { createClient } from '@/lib/supabase/client';
import { DbWorkspaceInvitation } from '@/types/workspace';

/**
 * Get all pending invitations for a user by their email address
 * 
 * @param email - The email address of the user
 * @returns Array of pending workspace invitations
 */
export async function getPendingInvitations(email: string): Promise<DbWorkspaceInvitation[]> {
  const supabase = createClient();
  
  // Simplified query to avoid foreign key relationship issues
  const { data, error } = await supabase
    .from('workspace_invitations')
    .select('*')
    .eq('email', email)
    .eq('status', 'pending')
    .gte('expires_at', new Date().toISOString()); // Only fetch non-expired invitations
    
  console.log(`[getPendingInvitations] Found ${data?.length || 0} pending invitations for ${email}`);
  
  if (error) {
    console.error('Error fetching pending invitations:', error);
    throw error;
  }
  
  return data || [];
}
