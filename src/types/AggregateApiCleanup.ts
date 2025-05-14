/**
 * This file collects type definitions extracted from API routes during cleanup
 * These types will be properly organized into the type system later
 *
 * ACTION PLAN FOR EXTRACTED TYPES:
 * 1. Create proper type files in the appropriate directories
 *    - DB types (snake_case) in /src/types/{domain}/Db{Type}.ts
 *    - API types (camelCase) in /src/types/{domain}/Api{Type}.ts
 * 2. Create transformation utilities
 *    - DbToApi{Type}.ts in /src/utils/type-utils/{domain}/
 *    - ApiToDb{Type}.ts in /src/utils/type-utils/{domain}/
 * 3. Update API routes to use the proper types and transformations
 */

import { ApiBlockMetrics } from '@/types/analytics';
import { RagStatus } from '@/types/chat-types';
import * as z from 'zod';
import { ApiFormView } from './analytics';

// From: src/app/api/analytics/block-metrics/[formId]/route.ts
// This has been replaced with DbBlockMetrics in the new type system
// Keeping this interface temporarily for backward compatibility
export interface BlockMetric {
  id?: string;
  block_id?: string;
  form_id?: string;
  views: number;
  submissions: number;
  skips: number;
  average_time_seconds: number;
  drop_off_count: number;
  drop_off_rate: number;
  created_at?: string;
  updated_at?: string;
}

// From: src/app/api/analytics/blocks/route.ts
// Should become DbBlockPerformance and ApiBlockPerformance
export interface BlockPerformance {
  block_id: string;
  form_id: string;
  block_type: string;
  block_subtype: string | null;
  completion_rate: number;
  average_time_spent: number;
  skip_rate: number;
  metrics: ApiBlockMetrics | null;
}

// From: src/app/api/analytics/chat/sessions/[sessionId]/route.ts
// Should become DbChatSessionUpdate and ApiChatSessionUpdate
export interface ChatSessionUpdateData {
  title?: string;
  last_message?: string;
}

// From: src/app/api/analytics/chat/sessions/route.ts
// Should become DbChatSession and ApiChatSession
export interface DbChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
}

// From: src/app/api/analytics/chat/sessions/route.ts
// Should become DbChatSessionCreate and ApiChatSessionCreate
export interface ChatSessionCreateData {
  form_id: string;
  user_id: string;
  title: string;
}

// From: src/app/api/analytics/chat/stream/route.ts
// Should become StreamEventTypes in chat-types.ts
export interface RagStreamEvent {
  type: 'rag_status' | 'rag_error' | 'rag_metrics';
  status?: RagStatus;
  error?: string;
  metrics?: {
    totalTime: number;
    resultsCount: number;
  };
}

// From: src/app/api/analytics/chat/route.ts
// Should become ChatResponseType in chat-types.ts
export interface ChatResponseWithState {
  sessionId: string;
  response: string;
  response_id?: string;
  usedRAG?: boolean;
}

// From: src/app/api/analytics/form/route.ts
// Should become FormAnalytics in analytics types
export interface FormAnalytics {
  form_id: string;
  total_views: number;
  total_completions: number;
  completion_rate: number;
  average_time_spent: number;
  metrics: Record<string, unknown> | null;
  views_over_time: { date: string; count: number }[];
}

// From: src/app/api/analytics/embeddings/process/route.ts
// Should become EmbeddingStatus in analytics-types
export interface EmbeddingStatus {
  total_responses: number;
  embedded_count: number;
  embedding_percentage: number;
}

// From: src/app/api/analytics/track/batch/route.ts
// Should become batch analytics related types
export interface BatchAnalyticsResult {
  processed: number;
  errors: number;
  details: Array<{ type: string; success: boolean; error?: string }>;
}

export interface BatchEventResponse {
  success: boolean;
  processed?: number;
  errors?: number;
  details?: Array<{ type: string; success: boolean; error?: string }>;
  error?: string;
}

// From: src/app/api/analytics/track/block-submit/route.ts
// Should become ApiBlockSubmitResponse
export interface BlockSubmitResponse {
  id: string;
  block_id: string;
  form_id: string;
  response_id: string;
  timestamp: string;
}

export interface BlockSubmitResponseData {
  id: string;
  block_id: string;
  form_id: string;
  response_id: string;
  timestamp: string;
}

// Types for form-view/route.ts
export const FormViewRequestBodySchema = z.object({
  formId: z.string().uuid(),
  visitorId: z.string(),
  isUnique: z.boolean().optional().default(false),
  deviceType: z.string().optional(),
  browser: z.string().optional(),
  source: z.string().optional(),
});

export type FormViewRequestBody = z.infer<typeof FormViewRequestBodySchema>;

// Note: FormViewData is now replaced by ApiFormView from analytics types
// This type is kept for backward compatibility
export interface FormViewData {
  id: string;
  form_id: string; // Keep snake_case for backward compatibility
  timestamp: string;
}

// Types for interaction/route.ts
export const InteractionMetadataSchema = z.object({
  visitor_id: z.string().optional(),
  duration_ms: z.number().optional().nullable(), // Matches p_duration_ms: metadata?.duration_ms || null
}).catchall(z.unknown()); // Allows other properties in metadata

export const InteractionRequestBodySchema = z.object({
  blockId: z.string().uuid({ message: "Invalid Block ID" }),
  formId: z.string().uuid({ message: "Invalid Form ID" }),
  responseId: z.string().uuid({ message: "Invalid Response ID" }).optional().nullable(), // Matches p_response_id: responseId || null
  eventType: z.string({ required_error: "Event Type is required" }),
  metadata: InteractionMetadataSchema.optional(),
});

export type InteractionRequestBody = z.infer<typeof InteractionRequestBodySchema>;

// Represents the actual data payload within a successful InteractionRpcResponse
export interface InteractionRpcRawData {
  interaction_id?: string; // Example, depends on actual RPC return
  timestamp?: string;      // Example, depends on actual RPC return
  [key: string]: unknown;  // Allow other properties returned by RPC
}

// Represents the full structure of 'rpcResult' from the track_block_interaction RPC call
export type InteractionRpcResponse =
  | ({ success: true } & InteractionRpcRawData)
  | { success: false; error: string; [key: string]: unknown };

// Types for view/route.ts
export const ViewRequestBodySchema = z.object({
  formId: z.string().uuid({ message: "Invalid Form ID" }),
  visitorId: z.string({ required_error: "Visitor ID is required" }),
  deviceType: z.string().optional(),
  browser: z.string().optional(),
  source: z.string().optional().nullable(),
  timestamp: z.string().datetime({ message: "Invalid timestamp" }).optional(), // Assuming ISO string, optional if DB defaults
  isUnique: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type ViewRequestBody = z.infer<typeof ViewRequestBodySchema>;

// Represents the data returned from a successful insert into form_views
export interface ViewResponseData {
  id: string; // Or number, depending on DB schema for form_views primary key
  form_id: string;
  visitor_id: string;
  device_type?: string | null;
  browser?: string | null;
  source?: string | null;
  timestamp: string; // Likely an ISO string from the DB
  is_unique?: boolean | null;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown; // Allow other properties returned by Supabase select
}

// Generic tracking response for all tracking routes
export type TrackingResponse =
  | { success: true; data: Record<string, unknown> | FormViewData | BatchAnalyticsResult | BlockSubmitResponseData | InteractionRpcResponse | ViewResponseData | ApiFormView }
  | { success: false; error: string; details?: unknown };

// More types will be added here as we analyze other API routes...
