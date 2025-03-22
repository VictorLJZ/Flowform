/**
 * Utility functions for formatting dates, times, and other data
 */

/**
 * Format a date to ISO 8601 format (YYYY-MM-DD)
 * 
 * @param date - The date to format
 * @returns The formatted date string
 */
export function formatISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parse an ISO 8601 date string (YYYY-MM-DD) to a Date object
 * 
 * @param dateString - The ISO 8601 date string to parse
 * @returns The parsed Date object
 */
export function parseISODate(dateString: string): Date {
  return new Date(`${dateString}T00:00:00Z`);
}

/**
 * Format a date as a relative time (e.g., "5 minutes ago")
 * 
 * @param date - The date to format
 * @returns The formatted relative time string
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`;
  } else {
    return formatISODate(date);
  }
}

/**
 * Format a time range in a human-readable format
 * 
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns The formatted time range string
 */
export function formatTimeRange(startDate: Date, endDate: Date): string {
  const startTime = startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const endTime = endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  
  return `${startTime} - ${endTime}`;
}
