// src/services/analytics/fetchers.ts
import { createClient, SupabaseClient } from '@/lib/supabase/client';
import { CompleteResponse, FormResponse, StaticBlockAnswer, DynamicBlockResponse } from '@/types/supabase-types';
import { DbForm } from '@/types/form';

// Helper to fetch related data for a single response object
const fetchRelatedDataForResponse = async (
  response: FormResponse,
  supabase: SupabaseClient
): Promise<Omit<CompleteResponse, keyof FormResponse>> => {
  const responseId = response.id;
  const formId = response.form_id;

  // Get static block answers
  const { data: staticAnswers, error: staticError } = await supabase
    .from('static_block_answers')
    .select('*')
    .eq('response_id', responseId);
  if (staticError) throw staticError;

  // Get dynamic block responses
  const { data: dynamicResponses, error: dynamicError } = await supabase
    .from('dynamic_block_responses')
    .select('*')
    .eq('response_id', responseId);
  if (dynamicError) throw dynamicError;

  // Get the specific form data associated with this response
  // The forms table uses form_id as its primary key (not the standard 'id')
  const { data: formData, error: formError } = await supabase
    .from('forms')
    .select('*')
    .eq('form_id', formId)
    .single();

  // Handle form fetching errors
  if (formError) {
    // If the error indicates the form wasn't found for this response's form_id, treat it as a data integrity issue.
    if (formError.code === 'PGRST116') {
      console.error(`Form data not found for form_id ${formId} referenced by response ${responseId}`);
      throw new Error(`Associated form data not found for response ${responseId}.`);
    }
    // Otherwise, re-throw the original error.
    throw formError;
  }

  // If form data is null after a successful query (shouldn't happen with .single() unless form_id was invalid),
  // throw an error as CompleteResponse expects a valid Form object.
  if (!formData) {
    throw new Error(`Failed to fetch form data for form_id ${formId}.`);
  }

  return {
    static_answers: (staticAnswers as StaticBlockAnswer[] | null) || [],
    dynamic_responses: (dynamicResponses as DynamicBlockResponse[] | null) || [],
    form: formData as DbForm, // Assert as DbForm, error is thrown if null
  };
};

/**
 * Fetches all complete form responses for a given form ID, including related data.
 * @param formId The ID of the form.
 * @returns An array of CompleteResponse objects.
 */
export const fetchFormResponses = async (formId: string): Promise<CompleteResponse[]> => {
  if (!formId) return [];

  const supabase = createClient();

  // Step 1: Fetch all base form responses for this form
  const { data: responseData, error: responseError } = await supabase
    .from('form_responses')
    .select('*')
    .eq('form_id', formId)
    .order('started_at', { ascending: false });

  if (responseError) throw responseError;
  if (!responseData || responseData.length === 0) {
    return [];
  }

  // Step 2: Fetch related data for each response
  const completeResponses = await Promise.all(
    (responseData as FormResponse[]).map(async (response) => {
      const relatedData = await fetchRelatedDataForResponse(response, supabase);
      return {
        ...response,
        ...relatedData,
      } as CompleteResponse;
    })
  );

  return completeResponses;
};

/**
 * Fetches a single complete form response by its ID, including related data.
 * @param responseId The ID of the response.
 * @returns A CompleteResponse object or null if not found.
 */
export const fetchSingleFormResponse = async (responseId: string): Promise<CompleteResponse | null> => {
  if (!responseId) return null;

  const supabase = createClient();

  // Get the base response
  const { data: response, error: responseError } = await supabase
    .from('form_responses')
    .select('*')
    .eq('id', responseId)
    .single();

  if (responseError) {
    // If error is 'PGRST116', it means no rows found, which is expected.
    if (responseError.code === 'PGRST116') {
      return null;
    }
    // Otherwise, re-throw the error
    throw responseError;
  }
  if (!response) return null; // Should be redundant due to error handling, but good practice

  // Fetch related data
  const relatedData = await fetchRelatedDataForResponse(response as FormResponse, supabase);

  const completeResponse = {
    ...response,
    ...relatedData,
  } as CompleteResponse;

  return completeResponse;
};
