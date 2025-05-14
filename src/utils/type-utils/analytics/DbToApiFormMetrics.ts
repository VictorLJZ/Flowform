/**
 * Database to API Form Metrics Transformations
 * 
 * This file provides utility functions for transforming form metrics
 * from Database (Db) layer to API layer:
 * - Converts snake_case DB fields to camelCase API fields
 * - Converts null values to undefined for optional fields
 */

import { 
  DbFormMetrics,
  DbFormInteraction,
  DbFormView
} from '@/types/analytics/DbFormMetrics';

import { 
  ApiFormMetrics,
  ApiFormInteraction,
  ApiFormView
} from '@/types/analytics/ApiFormMetrics';

/**
 * Transforms a Database layer form metrics object to an API layer form metrics object
 * 
 * @param dbFormMetrics The database layer form metrics object
 * @returns An API layer form metrics object
 */
export function dbToApiFormMetrics(dbFormMetrics: DbFormMetrics): ApiFormMetrics {
  return {
    formId: dbFormMetrics.form_id,
    totalViews: dbFormMetrics.total_views,
    uniqueViews: dbFormMetrics.unique_views,
    totalStarts: dbFormMetrics.total_starts,
    totalCompletions: dbFormMetrics.total_completions,
    completionRate: dbFormMetrics.completion_rate === null 
      ? undefined 
      : dbFormMetrics.completion_rate,
    averageCompletionTimeSeconds: dbFormMetrics.average_completion_time_seconds === null 
      ? undefined 
      : dbFormMetrics.average_completion_time_seconds,
    bounceRate: dbFormMetrics.bounce_rate === null 
      ? undefined 
      : dbFormMetrics.bounce_rate,
    lastUpdated: dbFormMetrics.last_updated
  };
}

/**
 * Transforms a Database layer form interaction object to an API layer form interaction object
 * 
 * @param dbFormInteraction The database layer form interaction object
 * @returns An API layer form interaction object
 */
export function dbToApiFormInteraction(dbFormInteraction: DbFormInteraction): ApiFormInteraction {
  return {
    id: dbFormInteraction.id,
    responseId: dbFormInteraction.response_id === null 
      ? undefined 
      : dbFormInteraction.response_id,
    blockId: dbFormInteraction.block_id === null 
      ? undefined 
      : dbFormInteraction.block_id,
    formId: dbFormInteraction.form_id === null 
      ? undefined 
      : dbFormInteraction.form_id,
    interactionType: dbFormInteraction.interaction_type,
    timestamp: dbFormInteraction.timestamp,
    durationMs: dbFormInteraction.duration_ms === null 
      ? undefined 
      : dbFormInteraction.duration_ms,
    metadata: dbFormInteraction.metadata === null 
      ? undefined 
      : dbFormInteraction.metadata
  };
}

/**
 * Transforms a Database layer form view object to an API layer form view object
 * 
 * @param dbFormView The database layer form view object
 * @returns An API layer form view object
 */
export function dbToApiFormView(dbFormView: DbFormView): ApiFormView {
  return {
    id: dbFormView.id,
    formId: dbFormView.form_id,
    visitorId: dbFormView.visitor_id,
    source: dbFormView.source === null 
      ? undefined 
      : dbFormView.source,
    deviceType: dbFormView.device_type === null 
      ? undefined 
      : dbFormView.device_type,
    browser: dbFormView.browser === null 
      ? undefined 
      : dbFormView.browser,
    timestamp: dbFormView.timestamp,
    isUnique: dbFormView.is_unique
  };
}

/**
 * Transforms an array of Database layer form metrics objects to API layer form metrics objects
 * 
 * @param dbFormMetrics Array of database layer form metrics objects
 * @returns Array of API layer form metrics objects
 */
export function dbToApiFormMetricsArray(dbFormMetrics: DbFormMetrics[]): ApiFormMetrics[] {
  return dbFormMetrics.map(dbToApiFormMetrics);
}

/**
 * Transforms an array of Database layer form interaction objects to API layer form interaction objects
 * 
 * @param dbFormInteractions Array of database layer form interaction objects
 * @returns Array of API layer form interaction objects
 */
export function dbToApiFormInteractionArray(dbFormInteractions: DbFormInteraction[]): ApiFormInteraction[] {
  return dbFormInteractions.map(dbToApiFormInteraction);
}

/**
 * Transforms an array of Database layer form view objects to API layer form view objects
 * 
 * @param dbFormViews Array of database layer form view objects
 * @returns Array of API layer form view objects
 */
export function dbToApiFormViewArray(dbFormViews: DbFormView[]): ApiFormView[] {
  return dbFormViews.map(dbToApiFormView);
}
