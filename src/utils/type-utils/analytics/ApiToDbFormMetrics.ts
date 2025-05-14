/**
 * API to Database Form Metrics Transformations
 * 
 * This file provides utility functions for transforming form metrics
 * from API layer to Database layer:
 * - Converts camelCase API fields to snake_case DB fields
 * - Converts undefined values to null for optional fields
 */

import { 
  ApiFormMetrics,
  ApiFormInteraction,
  ApiFormView
} from '@/types/analytics/ApiFormMetrics';

import { 
  DbFormMetrics,
  DbFormInteraction,
  DbFormView
} from '@/types/analytics/DbFormMetrics';

/**
 * Transforms an API layer form metrics object to a Database layer form metrics object
 * 
 * @param apiFormMetrics The API layer form metrics object
 * @returns A Database layer form metrics object
 */
export function apiToDbFormMetrics(apiFormMetrics: ApiFormMetrics): DbFormMetrics {
  return {
    form_id: apiFormMetrics.formId,
    total_views: apiFormMetrics.totalViews,
    unique_views: apiFormMetrics.uniqueViews,
    total_starts: apiFormMetrics.totalStarts,
    total_completions: apiFormMetrics.totalCompletions,
    completion_rate: apiFormMetrics.completionRate === undefined 
      ? null 
      : apiFormMetrics.completionRate,
    average_completion_time_seconds: apiFormMetrics.averageCompletionTimeSeconds === undefined 
      ? null 
      : apiFormMetrics.averageCompletionTimeSeconds,
    bounce_rate: apiFormMetrics.bounceRate === undefined 
      ? null 
      : apiFormMetrics.bounceRate,
    last_updated: apiFormMetrics.lastUpdated
  };
}

/**
 * Transforms an API layer form interaction object to a Database layer form interaction object
 * 
 * @param apiFormInteraction The API layer form interaction object
 * @returns A Database layer form interaction object
 */
export function apiToDbFormInteraction(apiFormInteraction: ApiFormInteraction): DbFormInteraction {
  return {
    id: apiFormInteraction.id,
    response_id: apiFormInteraction.responseId === undefined 
      ? null 
      : apiFormInteraction.responseId,
    block_id: apiFormInteraction.blockId === undefined 
      ? null 
      : apiFormInteraction.blockId,
    form_id: apiFormInteraction.formId === undefined 
      ? null 
      : apiFormInteraction.formId,
    interaction_type: apiFormInteraction.interactionType,
    timestamp: apiFormInteraction.timestamp,
    duration_ms: apiFormInteraction.durationMs === undefined 
      ? null 
      : apiFormInteraction.durationMs,
    metadata: apiFormInteraction.metadata === undefined 
      ? null 
      : apiFormInteraction.metadata
  };
}

/**
 * Transforms an API layer form view object to a Database layer form view object
 * 
 * @param apiFormView The API layer form view object
 * @returns A Database layer form view object
 */
export function apiToDbFormView(apiFormView: ApiFormView): DbFormView {
  return {
    id: apiFormView.id,
    form_id: apiFormView.formId,
    visitor_id: apiFormView.visitorId,
    source: apiFormView.source === undefined 
      ? null 
      : apiFormView.source,
    device_type: apiFormView.deviceType === undefined 
      ? null 
      : apiFormView.deviceType,
    browser: apiFormView.browser === undefined 
      ? null 
      : apiFormView.browser,
    timestamp: apiFormView.timestamp,
    is_unique: apiFormView.isUnique
  };
}

/**
 * Creates a Database layer form interaction object from API input data, suitable for inserts
 * 
 * @param data The API layer form interaction input data (without ID)
 * @returns A Database layer form interaction object suitable for database operations
 */
export function apiToDbFormInteractionForInsert(
  data: Omit<ApiFormInteraction, 'id' | 'timestamp'> & { timestamp?: string }
): Omit<DbFormInteraction, 'id'> {
  return {
    response_id: data.responseId === undefined ? null : data.responseId,
    block_id: data.blockId === undefined ? null : data.blockId,
    form_id: data.formId === undefined ? null : data.formId,
    interaction_type: data.interactionType,
    timestamp: data.timestamp || new Date().toISOString(),
    duration_ms: data.durationMs === undefined ? null : data.durationMs,
    metadata: data.metadata === undefined ? null : data.metadata
  };
}

/**
 * Creates a Database layer form view object from API input data, suitable for inserts
 * 
 * @param data The API layer form view input data (without ID)
 * @returns A Database layer form view object suitable for database operations
 */
export function apiToDbFormViewForInsert(
  data: Omit<ApiFormView, 'id' | 'timestamp'> & { timestamp?: string }
): Omit<DbFormView, 'id'> {
  return {
    form_id: data.formId,
    visitor_id: data.visitorId,
    source: data.source === undefined ? null : data.source,
    device_type: data.deviceType === undefined ? null : data.deviceType,
    browser: data.browser === undefined ? null : data.browser,
    timestamp: data.timestamp || new Date().toISOString(),
    is_unique: data.isUnique
  };
}

/**
 * Transforms an array of API layer form metrics objects to Database layer form metrics objects
 * 
 * @param apiFormMetrics Array of API layer form metrics objects
 * @returns Array of Database layer form metrics objects
 */
export function apiToDbFormMetricsArray(apiFormMetrics: ApiFormMetrics[]): DbFormMetrics[] {
  return apiFormMetrics.map(apiToDbFormMetrics);
}

/**
 * Transforms an array of API layer form interaction objects to Database layer form interaction objects
 * 
 * @param apiFormInteractions Array of API layer form interaction objects
 * @returns Array of Database layer form interaction objects
 */
export function apiToDbFormInteractionArray(apiFormInteractions: ApiFormInteraction[]): DbFormInteraction[] {
  return apiFormInteractions.map(apiToDbFormInteraction);
}

/**
 * Transforms an array of API layer form view objects to Database layer form view objects
 * 
 * @param apiFormViews Array of API layer form view objects
 * @returns Array of Database layer form view objects
 */
export function apiToDbFormViewArray(apiFormViews: ApiFormView[]): DbFormView[] {
  return apiFormViews.map(apiToDbFormView);
}
