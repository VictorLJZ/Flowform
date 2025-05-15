/**
 * API layer types for block-related analytics
 * 
 * Consolidated file containing all block-related API types
 * All properties use camelCase following API layer conventions
 */

/**
 * Represents a block as transferred between client and server
 */
export interface ApiBlock {
  id: string;
  title: string;
  description: string;
  blockTypeId: string;
}

/**
 * Represents block metrics data as transferred between client and server
 */
export interface ApiBlockMetrics {
  id: string;
  blockId: string;
  formId: string;
  views: number;
  skips: number;
  averageTimeSeconds?: number;
  dropOffCount: number;
  dropOffRate?: number;
  lastUpdated: string;
  submissions: number;
}

/**
 * Represents enhanced block metrics data with additional analytics fields
 */
export interface ApiBlockMetricsData {
  id: string;
  blockId: string;
  formId: string;
  block?: ApiBlock;
  viewsCount: number;
  uniqueViewsCount: number;
  avgTimeSpent: number;
  interactionCount: number;
  completionRate: number;
}

/**
 * Represents analytics for dynamic (AI-generated) blocks
 */
export interface ApiDynamicBlockAnalytics {
  id: string;
  dynamicResponseId: string;
  blockId: string;
  questionIndex: number;
  questionText: string;
  timeToAnswerSeconds: number | null;
  answerLength: number | null;
  sentimentScore: number | null;
  topics: { topic: string; confidence: number; relevance?: number }[] | null;
}

/**
 * Block performance analytics data - API layer type
 * Used in client-side services for block performance data
 */
export interface ApiBlockPerformance {
  blockId: string;
  formId: string;
  blockType: string;
  blockSubtype: string;
  completionRate: number;
  averageTimeSpent: number;
  skipRate: number;
  metrics: ApiBlockMetrics | null;
}