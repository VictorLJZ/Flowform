/**
 * Database to API Response Transformations
 * 
 * This file provides utility functions for transforming response-related types
 * from Database (Db) layer to API layer:
 * - Converts snake_case DB fields to camelCase API fields
 * - Maintains the same semantic structure
 * - Converts null values to undefined where appropriate
 */

import { 
  DbFormResponse, 
  DbStaticBlockAnswer, 
  DbDynamicBlockResponse,
  DbQAPair
} from '@/types/response';

import { 
  ApiFormResponse,
  ApiStaticBlockAnswer,
  ApiDynamicBlockResponse,
  ApiQAPair,
  ApiResponseStatus
} from '@/types/response';

/**
 * Transform a DB form response object to API format
 * 
 * @param dbResponse - Database form response object
 * @returns API-formatted form response object
 */
export function dbToApiFormResponse(dbResponse: DbFormResponse): ApiFormResponse {
  return {
    id: dbResponse.id,
    formId: dbResponse.form_id,
    // Convert null to undefined for optional fields
    formVersionId: dbResponse.form_version_id ?? undefined,
    respondentId: dbResponse.respondent_id,
    status: dbResponse.status as ApiResponseStatus,
    startedAt: dbResponse.started_at,
    completedAt: dbResponse.completed_at ?? undefined,
    metadata: dbResponse.metadata ?? undefined
  };
}

/**
 * Transform an array of DB form responses to API format
 * 
 * @param dbResponses - Array of database form response objects
 * @returns Array of API-formatted form response objects
 */
export function dbToApiFormResponses(dbResponses: DbFormResponse[]): ApiFormResponse[] {
  return dbResponses.map(dbToApiFormResponse);
}

/**
 * Transform a DB static block answer to API format
 * 
 * @param dbAnswer - Database static block answer object
 * @returns API-formatted static block answer
 */
export function dbToApiStaticBlockAnswer(dbAnswer: DbStaticBlockAnswer): ApiStaticBlockAnswer {
  return {
    id: dbAnswer.id,
    responseId: dbAnswer.response_id,
    blockId: dbAnswer.block_id,
    answer: dbAnswer.answer ?? undefined,
    answeredAt: dbAnswer.answered_at
  };
}

/**
 * Transform an array of DB static block answers to API format
 * 
 * @param dbAnswers - Array of database static block answer objects
 * @returns Array of API-formatted static block answers
 */
export function dbToApiStaticBlockAnswers(dbAnswers: DbStaticBlockAnswer[]): ApiStaticBlockAnswer[] {
  return dbAnswers.map(dbToApiStaticBlockAnswer);
}

/**
 * Transform a DB question-answer pair to API format
 * 
 * @param dbPair - Database question-answer pair object
 * @returns API-formatted question-answer pair
 */
export function dbToApiQAPair(dbPair: DbQAPair): ApiQAPair {
  return {
    type: dbPair.type,
    content: dbPair.content,
    timestamp: dbPair.timestamp,
    isStarter: dbPair.is_starter
  };
}

/**
 * Transform DB question-answer pairs to API format
 * 
 * @param dbPairs - Array of database question-answer pair objects
 * @returns Array of API-formatted question-answer pairs
 */
export function dbToApiQAPairs(dbPairs: DbQAPair[]): ApiQAPair[] {
  return dbPairs.map(dbToApiQAPair);
}

/**
 * Transform a DB dynamic block response to API format
 * 
 * @param dbDynamicResponse - Database dynamic block response object
 * @returns API-formatted dynamic block response
 */
export function dbToApiDynamicBlockResponse(dbDynamicResponse: DbDynamicBlockResponse): ApiDynamicBlockResponse {
  // Since the conversation field is stored as a Record in DB but we want typed array in API
  // we need to ensure proper conversion
  const conversation = Array.isArray(dbDynamicResponse.conversation) 
    ? dbDynamicResponse.conversation as unknown as DbQAPair[] 
    : [];

  return {
    id: dbDynamicResponse.id,
    responseId: dbDynamicResponse.response_id,
    blockId: dbDynamicResponse.block_id,
    startedAt: dbDynamicResponse.started_at,
    updatedAt: dbDynamicResponse.updated_at ?? undefined,
    completedAt: dbDynamicResponse.completed_at ?? undefined,
    conversation: dbToApiQAPairs(conversation),
    nextQuestion: dbDynamicResponse.next_question ?? undefined
  };
}

/**
 * Transform DB dynamic block responses to API format
 * 
 * @param dbDynamicResponses - Array of database dynamic block response objects
 * @returns Array of API-formatted dynamic block responses
 */
export function dbToApiDynamicBlockResponses(dbDynamicResponses: DbDynamicBlockResponse[]): ApiDynamicBlockResponse[] {
  return dbDynamicResponses.map(dbToApiDynamicBlockResponse);
}
