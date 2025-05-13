// UI-layer type for form versions
// Extends the API type with additional UI-specific properties

import { ApiFormVersion } from './ApiFormVersion';

export interface UiFormVersion extends ApiFormVersion {
  // UI-specific computed properties
  formattedCreatedAt?: string;      // Human-readable format of creation date
  isLatestVersion?: boolean;        // Flag to indicate if this is the latest version
}
