// src/hooks/useAnalyticsData.ts
import useSWR from 'swr';
import {
  fetchFormResponses,
  fetchSingleFormResponse,
} from '@/services/analytics/fetchers';
import { CompleteResponse } from '@/types/supabase-types';

/**
 * SWR hook to fetch all complete form responses for a given form ID.
 * @param formId The ID of the form. Pass null or undefined to prevent fetching.
 * @returns SWR response object containing data (CompleteResponse[]), error, and isLoading state.
 */
export const useFormResponses = (formId: string | null | undefined) => {
  // Define the SWR key. If formId is null/undefined, the key will be null, preventing fetch.
  const key = formId ? ['formResponses', formId] : null;

  const { data, error, isLoading, mutate } = useSWR<CompleteResponse[], Error>(
    key,
    // SWR passes the key array as arguments to the fetcher
    // We only need the formId (second element)
    () => fetchFormResponses(formId!)
  );

  return {
    responses: data,
    error,
    isLoading,
    mutate, // Expose mutate for potential manual revalidation or updates
  };
};

/**
 * SWR hook to fetch a single complete form response by its ID.
 * @param responseId The ID of the response. Pass null or undefined to prevent fetching.
 * @returns SWR response object containing data (CompleteResponse | null), error, and isLoading state.
 */
export const useFormResponse = (responseId: string | null | undefined) => {
  // Define the SWR key. If responseId is null/undefined, the key will be null.
  const key = responseId ? ['formResponse', responseId] : null;

  const { data, error, isLoading, mutate } = useSWR<CompleteResponse | null, Error>(
    key,
    // Fetcher only needs the responseId
    () => fetchSingleFormResponse(responseId!)
  );

  return {
    response: data,
    error,
    isLoading,
    mutate, // Expose mutate
  };
};
