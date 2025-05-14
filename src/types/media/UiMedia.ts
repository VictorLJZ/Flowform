/**
 * UI layer type definitions for media-related data
 * Extends API types with UI-specific properties
 * Used directly by React components
 */

import { 
  ApiMediaAsset,
  ApiMediaTag,
  ApiMediaUsage
} from './ApiMedia';

/**
 * UI representation of a media asset
 * Extends the API representation with UI-specific properties
 */
export interface UiMediaAsset extends ApiMediaAsset {
  // UI-specific properties
  displayName: string; // Formatted filename for display
  formattedSize: string; // Human-readable file size (e.g., "2.5 MB")
  formattedDimensions?: string; // e.g., "1920 x 1080"
  formattedDuration?: string; // e.g., "2:30" for videos/audio
  formattedDate: string; // Formatted date
  thumbnail?: string; // Thumbnail URL if available
  isSelected?: boolean; // For UI selection state
  isHovered?: boolean; // For UI hover state
  isProcessing?: boolean; // For upload/processing state
}

/**
 * UI representation of a media tag
 * Extends the API representation with UI-specific properties
 */
export interface UiMediaTag extends ApiMediaTag {
  // UI-specific properties
  count?: number; // Number of assets using this tag
  isSelected?: boolean; // For UI selection state
  color?: string; // Tag color for UI display
}

/**
 * UI representation of media usage statistics
 * Extends the API representation with UI-specific properties
 */
export interface UiMediaUsage extends ApiMediaUsage {
  // UI-specific properties
  formattedTotalSize: string; // Human-readable size (e.g., "1.2 GB")
  percentageUsed?: number; // Percentage of quota used
  formattedLastUpdated: string; // Formatted last updated date
}

/**
 * UI state for media filter/sort options
 */
export interface UiMediaFilterOptions {
  searchTerm?: string;
  tags?: string[];
  types?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  sortBy: 'date' | 'name' | 'size' | 'type';
  sortDirection: 'asc' | 'desc';
}

/**
 * UI state for batch operations on media assets
 */
export interface UiMediaBatchOperation {
  selectedIds: string[];
  operation: 'tag' | 'delete' | 'download';
  tags?: string[]; // For tag operation
}
