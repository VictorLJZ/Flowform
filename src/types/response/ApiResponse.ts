/**
 * API-level response types
 * 
 * These types represent the shape of response data as it flows through API requests and responses.
 * They use camelCase naming following JavaScript/TypeScript conventions.
 * 
 * Use these types for:
 * - API route handlers
 * - Request/response payloads
 * - Data transformation layer between database and UI
 */

import { DbResponseStatus } from './DbResponse';

/**
 * Response status type for API
 */
export type ApiResponseStatus = DbResponseStatus; // Keeping the same enum values

/**
 * Form response object in API format with camelCase properties
 */
export interface ApiFormResponse {
  id: string;
  formId: string;
  formVersionId?: string; // Optional
  respondentId: string;
  status: ApiResponseStatus;
  startedAt: string; // ISO date string
  completedAt?: string; // Optional
  metadata?: Record<string, unknown>; // Optional
}

/**
 * Static block answer in API format with camelCase properties
 */
export interface ApiStaticBlockAnswer {
  id: string;
  responseId: string;
  blockId: string;
  answer?: string; // Optional
  answeredAt: string; // ISO date string
}

/**
 * Dynamic block response in API format with camelCase properties
 */
export interface ApiDynamicBlockResponse {
  id: string;
  responseId: string;
  blockId: string;
  startedAt: string; // ISO date string
  updatedAt?: string; // Optional
  completedAt?: string; // Optional
  conversation: ApiQAPair[];
  nextQuestion?: string; // Optional
}

/**
 * Question-answer pair type for API
 * Note: This is different from the Chat with Data feature - this is specifically for form responses
 */
export interface ApiQAPair {
  type: 'question' | 'answer';
  content: string;
  timestamp: string; // ISO date string
  isStarter: boolean; // Whether this is a starter question/answer from the form configuration
}

/**
 * Input type for creating a new form response (API layer with camelCase)
 */
export interface ApiFormResponseInput {
  formId: string;
  formVersionId?: string;
  respondentId: string;
  metadata?: Record<string, unknown>;
}

/**
 * Input type for creating a static block answer (API layer with camelCase)
 */
export interface ApiStaticBlockAnswerInput {
  responseId: string;
  blockId: string;
  type: "answer", content: string;
}

/**
 * Input type for updating a form response (API layer with camelCase)
 */
export interface ApiFormResponseUpdateInput {
  status?: ApiResponseStatus;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}
