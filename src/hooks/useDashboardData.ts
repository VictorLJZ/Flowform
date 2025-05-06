import { DashboardData } from '@/types/dashboard-types';
import { fetchDashboardData } from '@/services/dashboard/fetchers';
import { useWorkspaceSWR, createWorkspaceFetcher } from './swr';

/**
 * Fetches dashboard data (stats, recent activity, recent forms) for a given workspace using SWR.
 *
 * @param workspaceId - The ID of the workspace. Can be undefined if no workspace is selected.
 * @returns An object containing the dashboard data, loading state, error state, and mutate function from SWR.
 */
export function useDashboardData(workspaceId?: string | null) {
  // Create a workspace-aware fetcher that passes the ID to the underlying service
  const dashboardFetcher = createWorkspaceFetcher(
    (wsId: string): Promise<DashboardData> => fetchDashboardData(wsId)
  );

  // Use the workspace-aware SWR hook
  const { 
    data, 
    error, 
    isLoading, 
    mutate,
    workspaceId: activeWorkspaceId 
  } = useWorkspaceSWR<DashboardData, Error>(
    'dashboardData',
    dashboardFetcher,
    {
      // Optional SWR configuration
      revalidateOnFocus: false, // Example: disable revalidation on window focus
    },
    workspaceId // Pass the explicit workspace ID if provided
  );

  return {
    dashboardData: data, // Contains stats, recentActivity, recentForms
    isLoading,
    error,
    mutate, // Function to manually trigger revalidation
    workspaceId: activeWorkspaceId // Also return the active workspace ID for convenience
  };
}
