import { createClient } from '@/lib/supabase/client';
import type { Workspace } from '@/types/supabase-types';

/**
 * Get a single workspace by ID - client-side implementation
 * 
 * @param workspaceId - ID of the workspace
 * @returns The workspace or null if not found
 */
export async function getWorkspaceClient(workspaceId: string): Promise<Workspace | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single();
  if (error) throw error;
  return data;
}
