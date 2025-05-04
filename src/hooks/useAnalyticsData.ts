import useSWR from 'swr';
import {
  fetchFormResponses,
  fetchSingleFormResponse,
} from '@/services/analytics/fetchers';
import { CompleteResponse } from '@/types/supabase-types';

/**
 * SWR hook to fetch all complete form responses for a given form ID.
 * 
 * Note: This hook doesn't need to use the workspace-aware SWR utilities
 * since forms and responses are already scoped to workspaces at the database level,
 * and we're fetching by form ID directly.
 * 
 * @param formId The ID of the form. Pass null or undefined to prevent fetching.
 * @returns SWR response object containing data (CompleteResponse[]), error, and isLoading state.
 */
export const useFormResponses = (formId: string | null | undefined) => {
  // Define the SWR key. If formId is null/undefined, the key will be null, preventing fetch.
  const key = formId ? ['formResponses', formId] : null;

  const fetcher = async ([, id]: [string, string]): Promise<CompleteResponse[]> => {
    console.log(`[useFormResponses] Fetching responses for form: ${id}`);
    return await fetchFormResponses(id);
  };

  const { data, error, isLoading, mutate } = useSWR<CompleteResponse[], Error>(
    key,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000, // Deduplicate requests within 5 seconds
      onError: (err) => {
        console.error(`[useFormResponses] Error fetching responses for form ${formId}:`, err);
      }
    }
  );

  return {
    responses: data ?? [], // Return empty array instead of undefined
    error,
    isLoading,
    mutate,
  };
};

/**
 * SWR hook to fetch a single complete form response by its ID.
 * 
 * @param responseId The ID of the response. Pass null or undefined to prevent fetching.
 * @returns SWR response object containing data (CompleteResponse | null), error, and isLoading state.
 */
export const useFormResponse = (responseId: string | null | undefined) => {
  // Define the SWR key. If responseId is null/undefined, the key will be null.
  const key = responseId ? ['formResponse', responseId] : null;

  const fetcher = async ([, id]: [string, string]): Promise<CompleteResponse | null> => {
    console.log(`[useFormResponse] Fetching response: ${id}`);
    return await fetchSingleFormResponse(id);
  };

  const { data, error, isLoading, mutate } = useSWR<CompleteResponse | null, Error>(
    key,
    fetcher,
    {
      revalidateOnFocus: true,
      onError: (err) => {
        console.error(`[useFormResponse] Error fetching response ${responseId}:`, err);
      }
    }
  );

  return {
    response: data,
    error,
    isLoading,
    mutate,
  };
};
