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
  
  // Maximum number of retries
  const maxRetries = 2;
  // Track current attempt
  let attempt = 0;
  
  while (attempt <= maxRetries) {
    try {
      // Log the API request
      networkLog('Fetching user workspaces from API', {
        userId,
        timestamp: new Date().toISOString(),
        attempt: attempt + 1
      });
      
      // Make the API request with credentials to ensure cookies are sent
      const response = await fetch(`/api/workspaces?userId=${encodeURIComponent(userId)}`, {
        credentials: 'include', // Include cookies for authentication
        cache: 'no-cache', // Disable cache to ensure fresh data
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      // Check if the response was successful
      if (!response.ok) {
        // Special handling for auth issues
        if (response.status === 401 || response.status === 403) {
          // If this is not our last attempt, try again
          if (attempt < maxRetries) {
    
            attempt++;
            // Wait before retrying to allow potential session refresh
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          }
        }
        
        // For other errors or final attempt, parse and throw
        let errorData: ApiErrorResponse;
        try {
          errorData = await response.json() as ApiErrorResponse;
        } catch {
          errorData = { error: `API returned status ${response.status}` };
        }
        throw new Error(errorData.error || errorData.message || `API returned status ${response.status}`);
      }
      
      // Parse the response data
      const workspaces = await response.json() as Workspace[];
      
      // Log success
      
      // Return workspaces or empty array
      return workspaces || [];
    } catch (error) {
      // If this is our last attempt, re-throw the error
      if (attempt === maxRetries) {
        // Log any unexpected errors with proper type handling

        throw error;
      }
      
      // Otherwise increment and retry

      attempt++;
      // Add a small delay before retrying
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // This shouldn't be reached, but TypeScript requires a return
  return [];
}
