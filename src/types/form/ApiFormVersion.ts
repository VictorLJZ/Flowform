// API-layer type for form versions
// Represents the format used in API responses with camelCase properties

export interface ApiFormVersion {
  id: string;
  formId: string;
  versionNumber: number;
  createdAt: string;
  createdBy: string;
}
