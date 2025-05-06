// src/types/workspace-swr-types.ts
// Centralized type definitions for workspace SWR hooks

/**
 * SWR response types for workspace data fetching
 */
export type SWRWorkspaceResponse<T> = {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isValidating: boolean;
  mutate: () => void;
};

/**
 * SWR error response that extends the standard Error interface
 */
export interface SWRErrorResponse extends Error {
  status?: number;
  details?: unknown;
}

/**
 * Type guard to check if an error is a SWRErrorResponse
 */
export function isSWRErrorResponse(error: unknown): error is SWRErrorResponse {
  return (
    error instanceof Error && 
    (typeof (error as SWRErrorResponse).status === 'number' || 
     (error as SWRErrorResponse).details !== undefined)
  );
}

/**
 * SWR response with pagination
 */
export type SWRPaginatedResponse<T> = SWRWorkspaceResponse<{
  items: T[];
  hasMore: boolean;
  nextCursor?: string;
}>;

/**
 * SWR metadata for response
 */
export type SWRResponseMetadata = {
  pagination?: {
    cursor?: string;
    limit?: number;
  };
  filters?: Record<string, string | number | boolean>;
};

/**
 * Cache key generator type
 */
export type SWRCacheKeyGenerator = (...args: string[]) => string[];
