// Form versioning type definitions
import { FormResponse, StaticBlockAnswer, DynamicBlockResponse } from './supabase-types';

export interface FormVersion {
  id: string;
  form_id: string;
  version_number: number;
  created_at: string;
  created_by: string;
}

export interface FormBlockVersion {
  id: string;
  block_id: string;
  form_version_id: string;
  title: string;
  description: string | null;
  type: string;
  subtype: string;
  required: boolean;
  order_index: number;
  settings: Record<string, unknown> | null;
  is_deleted: boolean;
  created_at: string;
}

// Enhanced response type that includes versioning information
export interface VersionedResponse extends FormResponse {
  form_version?: FormVersion;
  version_blocks?: FormBlockVersion[];
  static_answers: StaticBlockAnswer[];
  dynamic_responses: DynamicBlockResponse[];
}

export interface FormVersionsResponse {
  versions: FormVersion[];
  currentVersion: FormVersion | null;
}
