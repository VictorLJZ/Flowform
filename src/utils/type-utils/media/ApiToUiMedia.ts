/**
 * API to UI Media Transformations
 * 
 * This file provides utility functions for transforming media-related types
 * from API layer to UI layer:
 * - Adds UI-specific computed properties
 * - Formats data for display
 */

import { 
  ApiMediaAsset,
  ApiMediaTag,
  ApiMediaUsage
} from '@/types/media/ApiMedia';

import {
  UiMediaAsset,
  UiMediaTag,
  UiMediaUsage
} from '@/types/media/UiMedia';

/**
 * Format file size to human-readable string
 * 
 * @param bytes - Size in bytes
 * @returns Formatted size string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}

/**
 * Format dimensions to string
 * 
 * @param width - Width in pixels
 * @param height - Height in pixels
 * @returns Formatted dimensions string (e.g., "1920 x 1080")
 */
export function formatDimensions(width?: number, height?: number): string | undefined {
  if (width && height) {
    return `${width} × ${height}`;
  }
  return undefined;
}

/**
 * Format duration to human-readable string
 * 
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "2:30")
 */
export function formatDuration(seconds?: number): string | undefined {
  if (!seconds) return undefined;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

/**
 * Format date string
 * 
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Convert an API media asset to UI format
 * 
 * @param apiAsset - API media asset object
 * @returns UI-formatted media asset object
 */
export function apiToUiMediaAsset(apiAsset: ApiMediaAsset): UiMediaAsset {
  return {
    ...apiAsset,
    displayName: apiAsset.filename,
    formattedSize: formatFileSize(apiAsset.bytes),
    formattedDimensions: formatDimensions(apiAsset.width, apiAsset.height),
    formattedDuration: formatDuration(apiAsset.duration),
    formattedDate: formatDate(apiAsset.createdAt),
    // Generate thumbnail URL based on asset type
    thumbnail: apiAsset.type?.startsWith('image') && apiAsset.secureUrl && apiAsset.secureUrl.includes('/upload/') 
      ? `${apiAsset.secureUrl.split('/upload/')[0]}/upload/c_thumb,w_200,g_face/${apiAsset.secureUrl.split('/upload/')[1]}`
      : apiAsset.secureUrl || undefined
  };
}

/**
 * Convert an API media tag to UI format
 * 
 * @param apiTag - API media tag object
 * @param count - Optional count of assets using this tag
 * @returns UI-formatted media tag object
 */
export function apiToUiMediaTag(apiTag: ApiMediaTag, count?: number): UiMediaTag {
  return {
    ...apiTag,
    count,
    isSelected: false,
    // Generate a consistent color based on tag name
    color: `hsl(${Math.abs(apiTag.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 360}, 70%, 60%)`
  };
}

/**
 * Convert an API media usage stats to UI format
 * 
 * @param apiUsage - API media usage object
 * @param quotaBytes - Optional total quota in bytes for calculating percentage
 * @returns UI-formatted media usage object
 */
export function apiToUiMediaUsage(apiUsage: ApiMediaUsage, quotaBytes?: number): UiMediaUsage {
  const totalBytes = apiUsage.totalBytes || 0;
  return {
    ...apiUsage,
    formattedTotalSize: formatFileSize(totalBytes),
    percentageUsed: quotaBytes ? (totalBytes / quotaBytes) * 100 : undefined,
    formattedLastUpdated: formatDate(apiUsage.lastUpdated)
  };
}

/**
 * Convert multiple API media assets to UI format
 * 
 * @param apiAssets - Array of API media asset objects
 * @returns Array of UI-formatted media asset objects
 */
export function apiToUiMediaAssets(apiAssets: ApiMediaAsset[]): UiMediaAsset[] {
  return apiAssets.map(apiToUiMediaAsset);
}

/**
 * Convert multiple API media tags to UI format
 * 
 * @param apiTags - Array of API media tag objects
 * @param assetCounts - Optional map of tag counts by tag id
 * @returns Array of UI-formatted media tag objects
 */
export function apiToUiMediaTags(
  apiTags: ApiMediaTag[], 
  assetCounts?: Record<string, number>
): UiMediaTag[] {
  return apiTags.map(tag => apiToUiMediaTag(tag, assetCounts?.[tag.id]));
}
