// src/hooks/useDashboardData.ts
import useSWR from 'swr'
import { fetchDashboardData } from '@/services/dashboard/fetchers'
import { DashboardData } from '@/types/dashboard-types'

/**
 * Fetches dashboard data (stats, recent activity, recent forms) for a given workspace using SWR.
 *
 * @param workspaceId - The ID of the workspace. Can be undefined if no workspace is selected.
 * @returns An object containing the dashboard data, loading state, error state, and mutate function from SWR.
 */
export function useDashboardData(workspaceId?: string) {
  // The key includes the workspaceId. If workspaceId is undefined, SWR won't fetch.
  const key = workspaceId ? ['dashboardData', workspaceId] : null;

  // Define the fetcher function for SWR. It receives the key as an argument.
  // We extract the workspaceId from the key.
  const swrFetcher = async ([, id]: [string, string]): Promise<DashboardData> => {
    // Check again inside fetcher, though key check should prevent this call if id is undefined
    if (!id) {
        throw new Error("Workspace ID is required for fetching dashboard data.");
    }
    return fetchDashboardData(id);
  };

  const { data, error, isLoading, mutate } = useSWR<DashboardData, Error>(
      key,
      swrFetcher,
      {
        // Optional SWR configuration
        // revalidateOnFocus: false, // Example: disable revalidation on window focus
      }
  );

  return {
    dashboardData: data, // Contains stats, recentActivity, recentForms
    isLoading,
    error,
    mutate, // Function to manually trigger revalidation
  };
}
