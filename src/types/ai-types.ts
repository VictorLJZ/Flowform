// src/types/ai-types.ts
// Centralized type definitions for AI functionality

import { FormContextData } from '@/types/form-service-types';

/**
 * Response type for generate question function
 */
export interface GenerateQuestionResponse {
  success: boolean;
  data?: string;
  error?: string;
  responseId?: string;
}

/**
 * Define types for OpenAI Responses API parameters
 */
export type OpenAIMessage = {
  role: string;
  content: string;
};

/**
 * OpenAI Responses API request options
 * Based on March 11th 2025 Responses API specification
 */
export interface OpenAIResponsesOptions {
  model: string;
  input: OpenAIMessage[];
  temperature?: number;
  store?: boolean;
  previous_response_id?: string;
  tools?: Array<{
    type: 'function';
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
    strict?: boolean;
  }>;
}

/**
 * Parameters for conversation processing
 */
export type ProcessConversationParams = {
  prevQuestions: string[];
  prevAnswers: string[];
  instructions: string;
  temperature?: number;
  previousResponseId?: string;
  formContext?: FormContextData;
};
