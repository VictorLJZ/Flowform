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
    // Add the workspace ID as a query parameter if not already in the URL
    const urlWithWorkspace = url.includes('workspace_id=') 
      ? url 
      : `${url}${url.includes('?') ? '&' : '?'}workspace_id=${workspaceId}`;
    
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
  // If no workspace ID, don't fetch
  const key = workspaceId ? path : null;
  
  // Create a workspace-specific fetcher
  const workspaceFetcher = useCallback(
    async (url: string): Promise<T> => {
      if (!workspaceId) throw new Error('No workspace ID');
      return createWorkspaceFetcher(workspaceId)<T>(url);
    },
    [workspaceId]
  );
  
  // Need to cast types to make TypeScript happy with our dynamic fetcher
  return useSWR<T>(key, key ? workspaceFetcher : null, { ...defaultConfig, ...config });
}
