/**
 * Block Metrics DB to API Transformations
 * 
 * Consolidated utilities to transform all block-related database types to API format
 */

import {
  DbBlock,
  DbBlockMetrics,
  DbBlockMetricsData,
  DbDynamicBlockAnalytics
} from '@/types/analytics/DbBlockMetrics';

import {
  ApiBlock,
  ApiBlockMetrics,
  ApiBlockMetricsData,
  ApiDynamicBlockAnalytics
} from '@/types/analytics/ApiBlockMetrics';

/**
 * Transforms a database block object to API format
 */
export function dbToApiBlock(db: DbBlock): ApiBlock {
  return {
    id: db.id,
    title: db.title,
    description: db.description,
    blockTypeId: db.block_type_id,
  };
}

/**
 * Transforms a database block metrics object to API format
 */
export function dbToApiBlockMetrics(db: DbBlockMetrics): ApiBlockMetrics {
  return {
    id: db.id,
    blockId: db.block_id,
    formId: db.form_id,
    views: db.views,
    skips: db.skips,
    averageTimeSeconds: db.average_time_seconds === null ? undefined : db.average_time_seconds,
    dropOffCount: db.drop_off_count,
    dropOffRate: db.drop_off_rate === null ? undefined : db.drop_off_rate,
    lastUpdated: db.last_updated,
    submissions: db.submissions,
  };
}

/**
 * Transforms a database block metrics data object to API format
 */
export function dbToApiBlockMetricsData(
  db: DbBlockMetricsData
): ApiBlockMetricsData {
  return {
    id: db.id,
    blockId: db.block_id,
    formId: db.form_id,
    block: db.blocks ? dbToApiBlock(db.blocks) : undefined,
    viewsCount: db.views_count,
    uniqueViewsCount: db.unique_views_count,
    avgTimeSpent: db.avg_time_spent,
    interactionCount: db.interaction_count,
    completionRate: db.completion_rate,
  };
}

/**
 * Transforms a database dynamic block analytics object to API format
 */
export function dbToApiDynamicBlockAnalytics(
  db: DbDynamicBlockAnalytics
): ApiDynamicBlockAnalytics {
  return {
    id: db.id,
    dynamicResponseId: db.dynamic_response_id,
    blockId: db.block_id,
    questionIndex: db.question_index,
    questionText: db.question_text,
    timeToAnswerSeconds: db.time_to_answer_seconds,
    answerLength: db.answer_length,
    sentimentScore: db.sentiment_score,
    topics: db.topics,
  };
}

/**
 * Transforms arrays of database objects to API format
 */
export function dbToApiBlockArray(dbArray: DbBlock[]): ApiBlock[] {
  return dbArray.map(dbToApiBlock);
}

export function dbToApiBlockMetricsArray(dbArray: DbBlockMetrics[]): ApiBlockMetrics[] {
  return dbArray.map(dbToApiBlockMetrics);
}

export function dbToApiBlockMetricsDataArray(dbArray: DbBlockMetricsData[]): ApiBlockMetricsData[] {
  return dbArray.map(dbToApiBlockMetricsData);
}

export function dbToApiDynamicBlockAnalyticsArray(dbArray: DbDynamicBlockAnalytics[]): ApiDynamicBlockAnalytics[] {
  return dbArray.map(dbToApiDynamicBlockAnalytics);
}
