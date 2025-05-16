/**
 * Block Metrics API to DB Transformations
 * 
 * Consolidated utilities to transform all block-related API types to database format
 * - Converts camelCase API fields to snake_case DB fields
 * - Converts undefined values to null for optional fields
 */

import {
  ApiBlock,
  ApiBlockMetrics,
  ApiBlockMetricsData,
  ApiDynamicBlockAnalytics
} from '@/types/analytics/ApiBlockMetrics';

import {
  DbBlock,
  DbBlockMetrics,
  DbBlockMetricsData,
  DbDynamicBlockAnalytics
} from '@/types/analytics/DbBlockMetrics';

/**
 * Transforms an API block object to database format
 */
export function apiToDbBlock(api: ApiBlock): DbBlock {
  return {
    id: api.id,
    title: api.title,
    description: api.description,
    block_type_id: api.blockTypeId,
  };
}

/**
 * Transforms an API block metrics object to database format
 */
export function apiToDbBlockMetrics(api: ApiBlockMetrics): DbBlockMetrics {
  return {
    id: api.id,
    block_id: api.blockId,
    form_id: api.formId,
    views: api.views,
    skips: api.skips,
    average_time_seconds: api.averageTimeSeconds === undefined 
      ? null 
      : api.averageTimeSeconds,
    drop_off_count: api.dropOffCount,
    drop_off_rate: api.dropOffRate === undefined 
      ? null 
      : api.dropOffRate,
    last_updated: api.lastUpdated,
    submissions: api.submissions
  };
}

/**
 * Transforms an API block metrics data object to database format
 */
export function apiToDbBlockMetricsData(api: ApiBlockMetricsData): DbBlockMetricsData {
  return {
    id: api.id,
    block_id: api.blockId,
    form_id: api.formId,
    blocks: api.block ? apiToDbBlock(api.block) : undefined,
    views_count: api.viewsCount,
    unique_views_count: api.uniqueViewsCount,
    avg_time_spent: api.avgTimeSpent,
    interaction_count: api.interactionCount,
    completion_rate: api.completionRate,
  };
}

/**
 * Transforms an API dynamic block analytics object to database format
 */
export function apiToDbDynamicBlockAnalytics(
  api: ApiDynamicBlockAnalytics
): DbDynamicBlockAnalytics {
  return {
    id: api.id,
    dynamic_response_id: api.dynamicResponseId,
    block_id: api.blockId,
    question_index: api.questionIndex,
    question_text: api.questionText,
    time_to_answer_seconds: api.timeToAnswerSeconds,
    answer_length: api.answerLength,
    sentiment_score: api.sentimentScore,
    topics: api.topics,
  };
}

/**
 * Transforms API objects without ID fields (for upserts)
 */
export function apiToDbBlockMetricsForUpsert(
  api: Omit<ApiBlockMetrics, 'id'> & { id?: string }
): Omit<DbBlockMetrics, 'id'> & { id?: string } {
  return {
    ...(api.id ? { id: api.id } : {}),
    block_id: api.blockId,
    form_id: api.formId,
    views: api.views,
    skips: api.skips,
    average_time_seconds: api.averageTimeSeconds === undefined 
      ? null 
      : api.averageTimeSeconds,
    drop_off_count: api.dropOffCount,
    drop_off_rate: api.dropOffRate === undefined 
      ? null 
      : api.dropOffRate,
    last_updated: api.lastUpdated,
    submissions: api.submissions
  };
}

/**
 * Transforms arrays of API objects to database format
 */
export function apiToDbBlockArray(apiArray: ApiBlock[]): DbBlock[] {
  return apiArray.map(apiToDbBlock);
}

export function apiToDbBlockMetricsArray(apiArray: ApiBlockMetrics[]): DbBlockMetrics[] {
  return apiArray.map(apiToDbBlockMetrics);
}

export function apiToDbBlockMetricsDataArray(apiArray: ApiBlockMetricsData[]): DbBlockMetricsData[] {
  return apiArray.map(apiToDbBlockMetricsData);
}

export function apiToDbDynamicBlockAnalyticsArray(
  apiArray: ApiDynamicBlockAnalytics[]
): DbDynamicBlockAnalytics[] {
  return apiArray.map(apiToDbDynamicBlockAnalytics);
}
