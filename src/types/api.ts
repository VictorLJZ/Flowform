/**
 * API request and response types
 */

import { FormConfig, FormSession, Interaction } from './form';
import { User } from './user';
import { ChatMessage, RAGResult } from './analytics';

// Common API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Form API
export interface CreateFormRequest {
  title: string;
  starterQuestion: string;
  instructions: string;
  temperature: number;
  maxQuestions: number;
}

export interface UpdateFormRequest {
  title?: string;
  starterQuestion?: string;
  instructions?: string;
  temperature?: number;
  maxQuestions?: number;
}

export interface FormResponse {
  form: FormConfig;
}

export interface FormsListResponse {
  forms: FormConfig[];
}

// Form Response API
export interface StartFormSessionRequest {
  formId: string;
}

export interface StartFormSessionResponse {
  session: FormSession;
}

export interface SubmitResponseRequest {
  sessionId: string;
  answer: string;
}

export interface SubmitResponseResponse {
  nextQuestion?: string;
  isComplete: boolean;
  questionIndex: number;
}

// AI API
export interface GenerateQuestionRequest {
  formId: string;
  previousQuestions: string[];
  previousAnswers: string[];
}

export interface GenerateQuestionResponse {
  question: string;
}

// RAG API
export interface AnalyzeFormRequest {
  formId: string;
  query: string;
  previousResponseId?: string; // For OpenAI Responses API state management
}

export interface AnalyzeFormResponse {
  answer: string;
  relevantResponses: RAGResult[];
  message: ChatMessage;
  previousResponseId: string; // For OpenAI Responses API state management
}

// OpenAI Responses API Types
export type MessageRole = 'user' | 'assistant' | 'developer'; // Note: 'developer' instead of 'system'

export interface Message {
  role: MessageRole;
  content: string;
}

export interface FunctionCallOutput {
  type: 'function_call_output';
  call_id: string;
  output: string;
}

export interface ToolDefinition {
  type: 'function';
  name: string;
  description: string;
  parameters: Record<string, any>;
  strict: boolean;
}

export interface ResponsesAPIRequest {
  model: string;
  input: (Message | FunctionCallOutput)[];
  temperature?: number;
  tools?: ToolDefinition[];
  previous_response_id?: string;
  store?: boolean;
}

export interface ResponsesAPIResponse {
  id: string;
  output_text: string;
  model: string;
  tool_calls?: ToolCall[];
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}
