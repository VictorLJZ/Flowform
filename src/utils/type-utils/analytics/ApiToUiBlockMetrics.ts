/**
 * Block Metrics API to UI Transformations
 * 
 * Consolidated utilities to transform all block-related API types to UI format
 * - Adds computed properties for UI display
 * - Formats values for better user readability
 */

import {
  ApiBlock,
  ApiBlockMetrics,
  ApiBlockMetricsData,
  ApiDynamicBlockAnalytics
} from '@/types/analytics/ApiBlockMetrics';

import {
  UiBlock,
  UiBlockMetrics,
  UiBlockMetricsData,
  UiDynamicBlockAnalytics
} from '@/types/analytics/UiBlockMetrics';

// Common formatting utility functions

/**
 * Formats a number as a percentage string
 */
function formatPercentage(value?: number | null): string {
  if (value === undefined || value === null) {
    return '0%';
  }
  return `${Math.round(value * 100)}%`;
}

/**
 * Formats seconds into a human-readable time string
 */
function formatTime(seconds?: number | null): string {
  if (seconds === undefined || seconds === null) {
    return '0s';
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Get an appropriate color based on a completion rate value
 */
function getCompletionRateColor(rate: number): string {
  if (rate >= 0.75) return 'green';
  if (rate >= 0.5) return 'yellow';
  return 'red';
}

/**
 * Formats a sentiment score into a readable label
 */
function formatSentiment(score: number | null): string {
  if (score === null || score === undefined) return 'N/A';
  
  if (score > 0.3) return 'Positive';
  if (score < -0.3) return 'Negative';
  return 'Neutral';
}

// Block transformations

/**
 * Transforms an API block to UI format
 */
export function apiToUiBlock(api: ApiBlock): UiBlock {
  // Map of block type IDs to human-readable names
  const blockTypeNames: Record<string, string> = {
    'text': 'Text Input',
    'choice': 'Multiple Choice',
    'email': 'Email Field',
    'number': 'Number Input',
    'date': 'Date Picker',
    'file': 'File Upload',
    'phone': 'Phone Number',
    'address': 'Address Field',
    'rating': 'Rating Scale',
    'signature': 'Signature',
    'heading': 'Heading',
    'paragraph': 'Paragraph Text',
    'image': 'Image',
    'divider': 'Divider',
  };
  
  // Get the block type name, or use the ID if not found
  const blockTypeName = blockTypeNames[api.blockTypeId] || api.blockTypeId;
  
  // Truncate title if it's too long (over 30 characters)
  const truncatedTitle = api.title.length > 30 
    ? `${api.title.substring(0, 27)}...` 
    : api.title;
  
  // Format description or provide a default
  const displayDescription = api.description || 'No description provided';
  
  return {
    ...api,
    blockTypeName,
    truncatedTitle,
    displayDescription,
  };
}

/**
 * Transforms an API block metrics object to UI format
 */
export function apiToUiBlockMetrics(api: ApiBlockMetrics): UiBlockMetrics {
  // Calculate drop-off percentage (0-100)
  const dropOffPercentage = api.dropOffRate !== undefined 
    ? api.dropOffRate * 100 
    : 0;
  
  // Calculate completion percentage
  const completionPercentage = api.views > 0 
    ? (api.submissions / api.views) * 100 
    : 0;
  
  // Calculate views to skips ratio
  const viewsSkipsRatio = api.skips > 0 
    ? api.views / api.skips 
    : api.views;
  
  // Determine if this block has a high drop-off rate
  const isHighDropOff = dropOffPercentage > 25; // 25% is considered high drop-off
  
  return {
    ...api,
    formattedDropOffRate: formatPercentage(api.dropOffRate),
    formattedAverageTime: formatTime(api.averageTimeSeconds),
    viewsSkipsRatio,
    dropOffPercentage,
    completionPercentage,
    isHighDropOff
  };
}

/**
 * Transforms an API block metrics data object to UI format
 */
export function apiToUiBlockMetricsData(
  api: ApiBlockMetricsData
): UiBlockMetricsData {
  // Format the completion rate as a percentage
  const formattedCompletionRate = formatPercentage(api.completionRate);
  
  // Format the average time spent
  const formattedAvgTime = formatTime(api.avgTimeSpent);
  
  // Determine color based on completion rate
  const completionColor = getCompletionRateColor(api.completionRate);
  
  // Create a views label with pluralization
  const viewsLabel = api.viewsCount === 1 ? '1 view' : `${api.viewsCount} views`;
  
  return {
    ...api,
    block: api.block ? apiToUiBlock(api.block) : undefined,
    formattedAvgTime,
    formattedCompletionRate,
    completionColor,
    viewsLabel,
  };
}

/**
 * Transforms an API dynamic block analytics object to UI format
 */
export function apiToUiDynamicBlockAnalytics(
  api: ApiDynamicBlockAnalytics
): UiDynamicBlockAnalytics {
  return {
    ...api,
    formattedTimeToAnswer: formatTime(api.timeToAnswerSeconds),
    formattedSentiment: formatSentiment(api.sentimentScore),
    topicLabels: api.topics?.map(t => t.topic) || [],
    hasSentimentData: api.sentimentScore !== null && api.sentimentScore !== undefined
  };
}

// Array transformations

/**
 * Transforms arrays of API objects to UI format
 */
export function apiToUiBlockArray(apiArray: ApiBlock[]): UiBlock[] {
  return apiArray.map(apiToUiBlock);
}

export function apiToUiBlockMetricsArray(apiArray: ApiBlockMetrics[]): UiBlockMetrics[] {
  return apiArray.map(apiToUiBlockMetrics);
}

export function apiToUiBlockMetricsDataArray(apiArray: ApiBlockMetricsData[]): UiBlockMetricsData[] {
  return apiArray.map(apiToUiBlockMetricsData);
}

export function apiToUiDynamicBlockAnalyticsArray(apiArray: ApiDynamicBlockAnalytics[]): UiDynamicBlockAnalytics[] {
  return apiArray.map(apiToUiDynamicBlockAnalytics);
}
