/**
 * API to UI Form Metrics Transformations
 * 
 * This file provides utility functions for transforming form metrics
 * from API layer to UI layer:
 * - Adds computed properties for UI display
 * - Formats values for better user readability
 */

import { 
  ApiFormMetrics,
  ApiFormInteraction,
  ApiFormView
} from '@/types/analytics/ApiFormMetrics';

import { 
  UiFormMetrics,
  UiFormInteraction,
  UiFormView
} from '@/types/analytics/UiFormMetrics';

/**
 * Formats a number as a percentage string
 * @param value Decimal value (0-1) to format
 * @returns Formatted percentage string (e.g., "25%")
 */
function formatPercentage(value?: number): string {
  if (value === undefined || value === null) {
    return '0%';
  }
  return `${Math.round(value * 100)}%`;
}

/**
 * Formats seconds into a human-readable time string
 * @param seconds Time in seconds
 * @returns Formatted time string (e.g., "1m 30s")
 */
function formatTime(seconds?: number): string {
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
 * Formats a timestamp into a human-readable date and time
 * @param timestamp ISO timestamp string
 * @returns Formatted date and time string
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Formats a timestamp into a human-readable date
 * @param timestamp ISO timestamp string
 * @returns Formatted date string
 */
function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Gets the appropriate icon for a device type
 * @param deviceType The device type string
 * @returns Icon identifier for the device
 */
function getDeviceIcon(deviceType?: string): string {
  if (!deviceType) return 'device-unknown';
  
  const device = deviceType.toLowerCase();
  if (device.includes('mobile')) return 'device-mobile';
  if (device.includes('tablet')) return 'device-tablet';
  if (device.includes('desktop')) return 'device-desktop';
  return 'device-unknown';
}

/**
 * Gets the appropriate icon for a browser
 * @param browser The browser string
 * @returns Icon identifier for the browser
 */
function getBrowserIcon(browser?: string): string {
  if (!browser) return 'browser-unknown';
  
  const browserName = browser.toLowerCase();
  if (browserName.includes('chrome')) return 'browser-chrome';
  if (browserName.includes('firefox')) return 'browser-firefox';
  if (browserName.includes('safari')) return 'browser-safari';
  if (browserName.includes('edge')) return 'browser-edge';
  return 'browser-unknown';
}

/**
 * Gets user-friendly source name and icon
 * @param source The source string
 * @returns Source display info
 */
function getSourceInfo(source?: string): { display: string, icon?: string } {
  if (!source) return { display: 'Direct' };
  
  const sourceLower = source.toLowerCase();
  if (sourceLower.includes('google')) return { display: 'Google', icon: 'source-google' };
  if (sourceLower.includes('facebook')) return { display: 'Facebook', icon: 'source-facebook' };
  if (sourceLower.includes('twitter')) return { display: 'Twitter', icon: 'source-twitter' };
  if (sourceLower.includes('linkedin')) return { display: 'LinkedIn', icon: 'source-linkedin' };
  if (sourceLower.includes('instagram')) return { display: 'Instagram', icon: 'source-instagram' };
  
  // Try to extract domain from URL
  try {
    const url = new URL(source);
    return { display: url.hostname, icon: 'source-web' };
  } catch {
    // Not a URL, return as is
    return { display: source };
  }
}

/**
 * Gets user-friendly interaction type and color code
 * @param interactionType The interaction type string
 * @returns Interaction display info
 */
function getInteractionInfo(interactionType: string): { display: string, color: string } {
  const type = interactionType.toLowerCase();
  
  if (type.includes('view')) return { display: 'View', color: 'blue' };
  if (type.includes('start')) return { display: 'Start', color: 'green' };
  if (type.includes('submit')) return { display: 'Submit', color: 'green' };
  if (type.includes('skip')) return { display: 'Skip', color: 'yellow' };
  if (type.includes('abandon')) return { display: 'Abandon', color: 'red' };
  if (type.includes('complete')) return { display: 'Complete', color: 'purple' };
  
  return { display: interactionType, color: 'gray' };
}

/**
 * Transforms an API layer form metrics object to a UI layer form metrics object
 * 
 * @param apiFormMetrics The API layer form metrics object
 * @returns A UI layer form metrics object with additional UI-specific properties
 */
export function apiToUiFormMetrics(apiFormMetrics: ApiFormMetrics): UiFormMetrics {
  // Calculate conversion rate (unique views to completions)
  const conversionRate = apiFormMetrics.uniqueViews > 0 
    ? apiFormMetrics.totalCompletions / apiFormMetrics.uniqueViews 
    : 0;
  
  // Calculate health score (0-100) based on completion and bounce rates
  const completionRateWeight = 0.6;
  const bounceRateWeight = 0.4;
  const completionRateScore = (apiFormMetrics.completionRate || 0) * 100;
  const bounceRateScore = 100 - ((apiFormMetrics.bounceRate || 0) * 100);
  
  const healthScore = (completionRateScore * completionRateWeight) + 
                      (bounceRateScore * bounceRateWeight);
  
  return {
    // Pass through all API properties
    ...apiFormMetrics,
    
    // Add UI-specific properties
    formattedCompletionRate: formatPercentage(apiFormMetrics.completionRate),
    formattedBounceRate: formatPercentage(apiFormMetrics.bounceRate),
    formattedAverageCompletionTime: formatTime(apiFormMetrics.averageCompletionTimeSeconds),
    conversionRate,
    formattedConversionRate: formatPercentage(conversionRate),
    healthScore: Math.round(healthScore),
    formattedLastUpdated: formatDate(apiFormMetrics.lastUpdated)
  };
}

/**
 * Transforms an API layer form interaction object to a UI layer form interaction object
 * 
 * @param apiFormInteraction The API layer form interaction object
 * @returns A UI layer form interaction object with additional UI-specific properties
 */
export function apiToUiFormInteraction(apiFormInteraction: ApiFormInteraction): UiFormInteraction {
  const interactionInfo = getInteractionInfo(apiFormInteraction.interactionType);
  
  return {
    // Pass through all API properties
    ...apiFormInteraction,
    
    // Add UI-specific properties
    formattedTimestamp: formatTimestamp(apiFormInteraction.timestamp),
    formattedDuration: apiFormInteraction.durationMs 
      ? `${Math.round(apiFormInteraction.durationMs / 1000)}s` 
      : 'N/A',
    interactionTypeDisplay: interactionInfo.display,
    colorCode: interactionInfo.color
  };
}

/**
 * Transforms an API layer form view object to a UI layer form view object
 * 
 * @param apiFormView The API layer form view object
 * @returns A UI layer form view object with additional UI-specific properties
 */
export function apiToUiFormView(apiFormView: ApiFormView): UiFormView {
  const sourceInfo = getSourceInfo(apiFormView.source);
  
  return {
    // Pass through all API properties
    ...apiFormView,
    
    // Add UI-specific properties
    formattedTimestamp: formatTimestamp(apiFormView.timestamp),
    deviceIcon: getDeviceIcon(apiFormView.deviceType),
    browserIcon: getBrowserIcon(apiFormView.browser),
    sourceDisplay: sourceInfo.display,
    sourceIcon: sourceInfo.icon
  };
}

/**
 * Transforms an array of API layer form metrics objects to UI layer form metrics objects
 * 
 * @param apiFormMetrics Array of API layer form metrics objects
 * @returns Array of UI layer form metrics objects
 */
export function apiToUiFormMetricsArray(apiFormMetrics: ApiFormMetrics[]): UiFormMetrics[] {
  return apiFormMetrics.map(apiToUiFormMetrics);
}

/**
 * Transforms an array of API layer form interaction objects to UI layer form interaction objects
 * 
 * @param apiFormInteractions Array of API layer form interaction objects
 * @returns Array of UI layer form interaction objects
 */
export function apiToUiFormInteractionArray(apiFormInteractions: ApiFormInteraction[]): UiFormInteraction[] {
  return apiFormInteractions.map(apiToUiFormInteraction);
}

/**
 * Transforms an array of API layer form view objects to UI layer form view objects
 * 
 * @param apiFormViews Array of API layer form view objects
 * @returns Array of UI layer form view objects
 */
export function apiToUiFormViewArray(apiFormViews: ApiFormView[]): UiFormView[] {
  return apiFormViews.map(apiToUiFormView);
}
