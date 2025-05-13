// Form versioning type definitions
import { ApiFormResponse, ApiStaticBlockAnswer, ApiDynamicBlockResponse } from './response';
import { DbFormVersion } from './form';

// FormVersion has been migrated to the new type system:
// - DbFormVersion: Database layer (/types/form/DbFormVersion.ts)
// - ApiFormVersion: API layer (/types/form/ApiFormVersion.ts)
// - UiFormVersion: UI layer (/types/form/UiFormVersion.ts)
// Import these types from '@/types/form' instead

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
export interface VersionedResponse extends Omit<ApiFormResponse, 'formVersionId'> {
  form_version?: DbFormVersion;
  version_blocks?: FormBlockVersion[];
  static_answers: ApiStaticBlockAnswer[];
  dynamic_responses: ApiDynamicBlockResponse[];
  // Add back the renamed property as snake_case for backward compatibility
  form_version_id?: string;
}

export interface FormVersionsResponse {
  versions: DbFormVersion[];
  currentVersion: DbFormVersion | null;
}
