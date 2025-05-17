import { DashboardData } from '@/types/dashboard-types';
import { useWorkspaceSWR } from './swr';

/**
 * Fetches dashboard data (stats, recent activity, recent forms) for a given workspace using SWR.
 *
 * @param workspaceId - The ID of the workspace. Can be undefined if no workspace is selected.
 * @returns An object containing the dashboard data, loading state, error state, and mutate function from SWR.
 */
export function useDashboardData(workspaceId?: string | null) {
  // Use the workspace-aware SWR hook directly
  const { 
    data, 
    error, 
    isLoading, 
    mutate
  } = useWorkspaceSWR<DashboardData>(
    workspaceId,
    'dashboard/data',
    {
      // Optional SWR configuration
      revalidateOnFocus: false, // Example: disable revalidation on window focus
    }
  );

  return {
    dashboardData: data, // Contains stats, recentActivity, recentForms
    isLoading,
    error,
    mutate, // Function to manually trigger revalidation
    workspaceId // Return the provided workspace ID for convenience
  };
}
