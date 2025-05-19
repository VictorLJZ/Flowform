/**
 * SWR utility functions for data fetching
 * This module provides a centralized place for SWR configuration
 */

import useSWR, { SWRConfiguration } from 'swr';
import { useCallback } from 'react';

/**
 * Default SWR configuration
 */
export const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  refreshInterval: 0,
  shouldRetryOnError: true,
};

/**
 * Type-safe generic fetcher function
 */
export async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.message = `Status ${response.status}: ${await response.text()}`;
    throw error;
  }
  return response.json();
}

/**
 * Hook to fetch data with SWR
 */
export function useFetch<T>(key: string | null, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<T>(
    key,
    fetcher,
    { ...defaultConfig, ...config }
  );
  
  return {
    data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Create a paginated fetch hook
 */
export function usePaginatedFetch<T>(
  basePath: string,
  page: number,
  pageSize: number,
  filters?: Record<string, string | number | boolean>,
  config?: SWRConfiguration
) {
  // Construct the URL with pagination and optional filters
  const getUrl = useCallback(() => {
    if (!basePath) return null;
    
    const url = new URL(basePath, window.location.origin);
    url.searchParams.append('page', String(page));
    url.searchParams.append('pageSize', String(pageSize));
    
    // Add any filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }, [basePath, page, pageSize, filters]);
  
  return useFetch<T>(getUrl(), config);
}

/**
 * Create a workspace-specific fetcher function
 * @param workspaceId The workspace ID to include in requests
 */
export function createWorkspaceFetcher(workspaceId: string) {
  return async <T>(url: string): Promise<T> => {
    // Ensure the URL starts with /api/ if it's a relative path and doesn't already include /api/
    let apiUrl = url;
    if (!url.includes('/api/') && !url.startsWith('http')) {
      apiUrl = `/api/${url.startsWith('/') ? url.substring(1) : url}`;
    }
    
    // Add the workspace ID as a query parameter if not already in the URL
    const urlWithWorkspace = apiUrl.includes('workspace_id=') 
      ? apiUrl 
      : `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}workspace_id=${workspaceId}`;
    
    return fetcher<T>(urlWithWorkspace);
  };
}

/**
 * Hook to fetch workspace-specific data with SWR
 */
export function useWorkspaceSWR<T>(
  workspaceId: string | null | undefined,
  path: string,
  config?: SWRConfiguration
) {
  // Create a unique key that includes the workspaceId to force revalidation when workspace changes
  // This ensures data is always fresh when switching workspaces
  const key = workspaceId ? `${path}?workspace_id=${workspaceId}` : null;
  
  // Create a workspace-specific fetcher
  const workspaceFetcher = useCallback(
    async (): Promise<T> => {
      // Using hardcoded path instead of url parameter
      if (!workspaceId) throw new Error('No workspace ID');
      return createWorkspaceFetcher(workspaceId)<T>(path);
    },
    [workspaceId, path]
  );
  
  // Configure SWR with improved settings for workspace switching:
  // 1. Shorter dedupingInterval to prevent stale data between workspace switches
  // 2. revalidateOnMount to always fetch fresh data when component mounts or key changes
  const mergedConfig = {
    ...defaultConfig,
    ...config,
    dedupingInterval: 0, // Disable deduping to ensure fresh data on each workspace switch
    revalidateOnMount: true, // Always revalidate when the component mounts
  };
  
  // Need to cast types to make TypeScript happy with our dynamic fetcher
  return useSWR<T>(key, key ? workspaceFetcher : null, mergedConfig);
}
