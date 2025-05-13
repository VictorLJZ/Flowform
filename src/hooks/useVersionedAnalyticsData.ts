import useSWR from 'swr';
import { getVersionedFormResponses, getFormVersions } from '@/services/analytics/getVersionedFormResponses';
import { VersionedResponse } from '@/types/form-version-types';
import { DbFormVersion } from '@/types/form';

// Define types for combined data
interface VersionedFormData {
  responses: VersionedResponse[];
  totalCount: number;
  versions: DbFormVersion[];
  currentVersion: DbFormVersion | null;
}

/**
 * Custom hook to fetch versioned form responses and form versions using SWR
 * 
 * @param formId Form ID to fetch responses for
 * @param limit Maximum number of responses to fetch
 * @param offset Pagination offset
 * @returns Object containing responses, versions, loading state, and error
 */
export function useVersionedFormResponses(
  formId: string | undefined,
  limit: number = 50,
  offset: number = 0
) {
  // Create a cache key that includes all parameters
  const key = formId ? ['versionedFormResponses', formId, limit, offset] : null;
  
  // Define the SWR fetcher function
  const fetcher = async ([, id, lmt, off]: [string, string, number, number]): Promise<VersionedFormData> => {
    console.log(`[useVersionedFormResponses] Fetching data for form: ${id}, limit: ${lmt}, offset: ${off}`);
    
    // Fetch both form versions and responses in parallel
    const [responsesResult, versionsResult] = await Promise.all([
      getVersionedFormResponses(id, lmt, off),
      getFormVersions(id)
    ]);
    
    // Return combined data
    return {
      responses: responsesResult.responses, 
      totalCount: responsesResult.totalCount,
      versions: versionsResult.versions,
      currentVersion: versionsResult.currentVersion
    };
  };
  
  // Use SWR to fetch data
  const { data, error, isLoading, mutate } = useSWR<VersionedFormData>(key, fetcher, {
    revalidateOnFocus: false, // Prevent unnecessary refetches on window focus
    dedupingInterval: 10000, // Cache results for 10 seconds
    onError: (err) => {
      console.error('Error fetching versioned form data:', err);
    }
  });
  
  // Return formatted data with fallbacks for undefined values
  return {
    responses: data?.responses ?? [],
    totalCount: data?.totalCount ?? 0,
    versions: data?.versions ?? [],
    currentVersion: data?.currentVersion ?? null,
    loading: isLoading,
    error,
    refresh: mutate // Provide a way to manually refresh the data
  };
}
