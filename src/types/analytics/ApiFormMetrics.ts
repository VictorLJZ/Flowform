/**
 * API layer types for form metrics
 * 
 * Represents form-related metrics data as transferred between client and server
 * Properties use camelCase following API layer conventions
 */

/**
 * Form insights data as returned by the API
 * Used in the analytics insights endpoints
 */
export interface FormInsights {
  totalViews: number;
  totalStarts: number;
  totalSubmissions: number;
  completionRate: number;
  averageTimeToComplete: number;
  lastUpdated: string;
}

/**
 * Form metrics aggregate data
 */
export interface ApiFormMetrics {
  formId: string;
  totalViews: number;
  uniqueViews: number;
  totalStarts: number;
  totalCompletions: number;
  completionRate?: number;
  averageCompletionTimeSeconds?: number;
  bounceRate?: number;
  lastUpdated: string;
}

/**
 * Form interaction events
 */
export interface ApiFormInteraction {
  id: string;
  responseId?: string;
  blockId?: string;
  formId?: string;
  interactionType: string;
  timestamp: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Form view events
 */
export interface ApiFormView {
  id: string;
  formId: string;
  visitorId: string;
  source?: string;
  deviceType?: string;
  browser?: string;
  timestamp: string;
  isUnique: boolean;
}