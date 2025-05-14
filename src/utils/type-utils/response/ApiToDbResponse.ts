/**
 * API to Database Response Transformations
 * 
 * This file provides utility functions for transforming response-related types
 * from API layer to Database (Db) layer:
 * - Converts camelCase API fields to snake_case DB fields
 * - Maintains the same semantic structure
 * - Converts undefined values to null where appropriate
 */

import { 
  ApiFormResponse,
  ApiStaticBlockAnswer,
  ApiDynamicBlockResponse,
  ApiQAPair
} from '@/types/response';

import { 
  DbFormResponse, 
  DbStaticBlockAnswer, 
  DbDynamicBlockResponse,
  DbQAPair,
  DbResponseStatus
} from '@/types/response';

/**
 * Transform an API form response object to DB format
 * 
 * @param apiResponse - API form response object
 * @returns Database-formatted form response object
 */
export function apiToDbFormResponse(apiResponse: ApiFormResponse): DbFormResponse {
  return {
    id: apiResponse.id,
    form_id: apiResponse.formId,
    form_version_id: apiResponse.formVersionId ?? null,
    respondent_id: apiResponse.respondentId,
    status: apiResponse.status as DbResponseStatus,
    started_at: apiResponse.startedAt,
    completed_at: apiResponse.completedAt ?? null,
    metadata: apiResponse.metadata ?? null
  };
}

/**
 * Transform an API form response input (for creation) to DB format
 * 
 * @param apiInput - API form response input object
 * @returns Database-formatted form response object (partial)
 */
export function apiToDbFormResponseInput(apiInput: Omit<ApiFormResponse, 'id' | 'startedAt' | 'completedAt'>): Omit<DbFormResponse, 'id' | 'started_at' | 'completed_at'> {
  return {
    form_id: apiInput.formId,
    form_version_id: apiInput.formVersionId ?? null,
    respondent_id: apiInput.respondentId,
    status: apiInput.status as DbResponseStatus,
    metadata: apiInput.metadata ?? null
  };
}

/**
 * Transform an API static block answer to DB format
 * 
 * @param apiAnswer - API static block answer object
 * @returns Database-formatted static block answer
 */
export function apiToDbStaticBlockAnswer(apiAnswer: ApiStaticBlockAnswer): DbStaticBlockAnswer {
  return {
    id: apiAnswer.id,
    response_id: apiAnswer.responseId,
    block_id: apiAnswer.blockId,
    answer: apiAnswer.answer ?? null,
    answered_at: apiAnswer.answeredAt
  };
}

/**
 * Transform an API static block answer input (for creation) to DB format
 * 
 * @param apiInput - API static block answer input
 * @returns Database-formatted static block answer (partial)
 */
export function apiToDbStaticBlockAnswerInput(apiInput: Omit<ApiStaticBlockAnswer, 'id' | 'answeredAt'>): Omit<DbStaticBlockAnswer, 'id' | 'answered_at'> {
  return {
    response_id: apiInput.responseId,
    block_id: apiInput.blockId,
    answer: apiInput.answer ?? null
  };
}

/**
 * Transform an API QA pair to DB format
 * 
 * @param apiPair - API QA pair object
 * @returns Database-formatted QA pair
 */
export function apiToDbQAPair(apiPair: ApiQAPair): DbQAPair {
  return {
    type: apiPair.type,
    content: apiPair.content,
    timestamp: apiPair.timestamp,
    is_starter: apiPair.isStarter
  };
}

/**
 * Transform API QA pairs to DB format
 * 
 * @param apiPairs - Array of API QA pair objects
 * @returns Array of database-formatted QA pairs
 */
export function apiToDbQAPairs(apiPairs: ApiQAPair[]): DbQAPair[] {
  return apiPairs.map(apiToDbQAPair);
}

/**
 * Transform an API dynamic block response to DB format
 * 
 * @param apiDynamicResponse - API dynamic block response object
 * @returns Database-formatted dynamic block response
 */
export function apiToDbDynamicBlockResponse(apiDynamicResponse: ApiDynamicBlockResponse): DbDynamicBlockResponse {
  return {
    id: apiDynamicResponse.id,
    response_id: apiDynamicResponse.responseId,
    block_id: apiDynamicResponse.blockId,
    started_at: apiDynamicResponse.startedAt,
    updated_at: apiDynamicResponse.updatedAt ?? null,
    completed_at: apiDynamicResponse.completedAt ?? null,
    conversation: apiToDbQAPairs(apiDynamicResponse.conversation),
    next_question: apiDynamicResponse.nextQuestion ?? null
  };
}

/**
 * Transform an API dynamic block response input (for creation) to DB format
 * 
 * @param apiInput - API dynamic block response input
 * @returns Database-formatted dynamic block response (partial)
 */
export function apiToDbDynamicBlockResponseInput(apiInput: Omit<ApiDynamicBlockResponse, 'id' | 'startedAt' | 'updatedAt' | 'completedAt'>): Omit<DbDynamicBlockResponse, 'id' | 'started_at' | 'updated_at' | 'completed_at'> {
  return {
    response_id: apiInput.responseId,
    block_id: apiInput.blockId,
    conversation: apiToDbQAPairs(apiInput.conversation),
    next_question: apiInput.nextQuestion ?? null
  };
}
