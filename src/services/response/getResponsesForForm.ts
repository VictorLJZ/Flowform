import { createClient } from '@/lib/supabase/server';
import { DbFormResponse, DbStaticBlockAnswer, DbDynamicBlockResponse } from '@/types/response';

/**
 * Get all responses for a specific form
 * 
 * @param formId - The ID of the form
 * @param includeAnswers - Whether to include the detailed answers (defaults to false)
 * @param limit - Maximum number of responses to return
 * @param offset - Offset for pagination
 * @returns Array of form responses with optional answer details
 */
export async function getResponsesForForm(
  formId: string,
  includeAnswers: boolean = false,
  limit: number = 50,
  offset: number = 0
): Promise<{
  responses: DbFormResponse[];
  static_answers?: Record<string, DbStaticBlockAnswer[]>;
  dynamic_responses?: Record<string, DbDynamicBlockResponse[]>;
  total: number;
}> {
  const supabase = await createClient();

  // Get responses for this form
  const { data: responses, error: responseError, count } = await supabase
    .from('form_responses')
    .select('*', { count: 'exact' })
    .eq('form_id', formId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (responseError) {
    console.error('Error fetching form responses:', responseError);
    throw responseError;
  }

  if (!responses || responses.length === 0) {
    return { responses: [], total: 0 };
  }

  // If we don't need detailed answers, return just the responses
  if (!includeAnswers) {
    return { responses, total: count || responses.length };
  }

  // Get the response IDs for fetching answers
  const responseIds = responses.map(response => response.id);

  // Fetch static answers
  const { data: staticAnswers, error: staticError } = await supabase
    .from('static_block_answers')
    .select('*')
    .in('response_id', responseIds);

  if (staticError) {
    console.error('Error fetching static answers:', staticError);
    throw staticError;
  }

  // Fetch dynamic responses
  const { data: dynamicResponses, error: dynamicError } = await supabase
    .from('dynamic_block_responses')
    .select('*')
    .in('response_id', responseIds);

  if (dynamicError) {
    console.error('Error fetching dynamic responses:', dynamicError);
    throw dynamicError;
  }

  // Group answers by response ID for easier access
  const staticAnswersByResponse: Record<string, DbStaticBlockAnswer[]> = {};
  const dynamicResponsesByResponse: Record<string, DbDynamicBlockResponse[]> = {};

  // Group static answers
  if (staticAnswers) {
    for (const answer of staticAnswers) {
      if (!staticAnswersByResponse[answer.response_id]) {
        staticAnswersByResponse[answer.response_id] = [];
      }
      staticAnswersByResponse[answer.response_id].push(answer);
    }
  }

  // Group dynamic responses
  if (dynamicResponses) {
    for (const response of dynamicResponses) {
      if (!dynamicResponsesByResponse[response.response_id]) {
        dynamicResponsesByResponse[response.response_id] = [];
      }
      dynamicResponsesByResponse[response.response_id].push(response);
    }
  }

  return {
    responses,
    static_answers: staticAnswersByResponse,
    dynamic_responses: dynamicResponsesByResponse,
    total: count || responses.length
  };
}
