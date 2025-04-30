import { Workspace } from '@/types/supabase-types';
import { networkLog } from '@/lib/debug-logger';
import { ApiErrorResponse } from '@/types/workspace-types';

/**
 * Get all workspaces where the user is a member - Client-side implementation
 * Uses the API route to fetch workspaces data
 * 
 * @param userId - The ID of the user
 * @returns An array of workspaces
 */
export async function getUserWorkspacesClient(userId: string): Promise<Workspace[]> {
  console.log('[getUserWorkspacesClient] Starting with userId:', userId);
  
  try {
    // Log the API request
    networkLog('Fetching user workspaces from API', {
      userId,
      timestamp: new Date().toISOString()
    });
    
    // Make the API request
    const response = await fetch(`/api/workspaces?userId=${encodeURIComponent(userId)}`);
    
    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json() as ApiErrorResponse;
      throw new Error(errorData.error || errorData.message || `API returned status ${response.status}`);
    }
    
    // Parse the response data
    const workspaces = await response.json() as Workspace[];
    
    // Log success
    console.log('[getUserWorkspacesClient] Successfully fetched workspaces:', {
      count: workspaces?.length || 0,
      names: workspaces?.map((w: Workspace) => w.name) || []
    });
    
    // Return workspaces or empty array
    return workspaces || [];
  } catch (error) {
    // Log any unexpected errors with proper type handling
    console.error('[getUserWorkspacesClient] ERROR in workspace fetch:', 
      error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}
