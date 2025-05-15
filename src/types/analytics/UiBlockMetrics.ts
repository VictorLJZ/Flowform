/**
 * UI layer types for block-related analytics
 * 
 * Consolidated file containing all block-related UI types
 * All interfaces extend their API counterparts and add UI-specific display properties
 */

import { 
  ApiBlock, 
  ApiBlockMetrics, 
  ApiBlockMetricsData, 
  ApiDynamicBlockAnalytics 
} from './ApiBlockMetrics';

/**
 * Represents a block in the UI with display properties
 */
export interface UiBlock extends ApiBlock {
  // UI-specific computed properties
  blockTypeName: string; // Friendly display name for the block type
  truncatedTitle: string; // Truncated title for display purposes
  displayDescription: string; // Formatted description for display
}

/**
 * Extends API block metrics with UI-specific properties
 * Used in UI components for display
 */
export interface UiBlockMetrics extends ApiBlockMetrics {
  // UI-specific properties
  formattedDropOffRate: string;      // Formatted as percentage (e.g., "25%")
  formattedAverageTime: string;      // Formatted as time (e.g., "1m 30s")
  viewsSkipsRatio: number;           // Views to skips ratio
  dropOffPercentage: number;         // Drop-off as percentage (0-100)
  completionPercentage: number;      // Completion percentage (0-100)
  isHighDropOff: boolean;            // Flag for blocks with high drop-off
}

/**
 * UI layer representation of block metrics data with display properties
 */
export interface UiBlockMetricsData extends Omit<ApiBlockMetricsData, 'block'> {
  block?: UiBlock;
  
  // UI-specific computed properties
  formattedAvgTime: string; // e.g. "2m 30s"
  formattedCompletionRate: string; // e.g. "75%"
  completionColor: string; // Color representing completion rate (red, yellow, green)
  viewsLabel: string; // Pluralized label
}

/**
 * Legacy formatted block metrics type used in the analytics API routes
 * This is a UI-layer type that provides formatted metrics data for display
 * in dashboards and analytics views
 */
export interface FormattedBlockMetrics {
  id: string;
  title: string;
  blockTypeId: string;
  count: number;
  uniqueViews: number;
  avgTimeSpent: number;
  interactionCount: number;
  completionRate: number;
  dropOffRate: number;
  dropOffPercentage: string; // Formatted string for UI display (e.g., "-25%")
}

/**
 * UI layer representation of dynamic block analytics with display properties
 */
export interface UiDynamicBlockAnalytics extends ApiDynamicBlockAnalytics {
  // UI-specific computed properties
  formattedTimeToAnswer: string; // e.g. "2m 30s"
  formattedSentiment: string; // e.g. "Positive", "Neutral", "Negative"
  topicLabels: string[]; // Simplified list of topic names
  hasSentimentData: boolean; // Whether sentiment analysis is available
}