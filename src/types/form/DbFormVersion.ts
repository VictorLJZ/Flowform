// Database-layer type for form versions
// Represents the exact schema from the form_versions table with snake_case properties

export interface DbFormVersion {
  id: string;
  form_id: string;
  version_number: number;
  created_at: string;
  created_by: string;
}
