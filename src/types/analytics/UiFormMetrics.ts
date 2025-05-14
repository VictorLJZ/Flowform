/**
 * UI layer types for form metrics
 * 
 * Extends API form metrics with UI-specific properties
 * Used in UI components for display
 */

import { ApiFormMetrics, ApiFormInteraction, ApiFormView } from './ApiFormMetrics';

/**
 * Form metrics with UI display properties
 */
export interface UiFormMetrics extends ApiFormMetrics {
  // UI-specific properties
  formattedCompletionRate: string;               // Formatted as percentage (e.g., "45%")
  formattedBounceRate: string;                   // Formatted as percentage (e.g., "15%")
  formattedAverageCompletionTime: string;        // Formatted as time (e.g., "2m 15s")
  conversionRate: number;                        // Calculated conversion rate
  formattedConversionRate: string;               // Formatted as percentage
  healthScore: number;                           // Overall form health score (0-100)
  formattedLastUpdated: string;                  // Human-readable date
}

/**
 * Form interaction events with UI display properties
 */
export interface UiFormInteraction extends ApiFormInteraction {
  // UI-specific properties
  formattedTimestamp: string;                    // Human-readable date and time
  formattedDuration: string;                     // Human-readable duration
  interactionTypeDisplay: string;                // User-friendly interaction type name
  colorCode: string;                             // Color code for the interaction type
}

/**
 * Form view events with UI display properties
 */
export interface UiFormView extends ApiFormView {
  // UI-specific properties
  formattedTimestamp: string;                    // Human-readable date and time
  deviceIcon: string;                            // Icon for the device type
  browserIcon: string;                           // Icon for the browser
  sourceDisplay: string;                         // User-friendly source name
  sourceIcon?: string;                           // Icon for the source
}