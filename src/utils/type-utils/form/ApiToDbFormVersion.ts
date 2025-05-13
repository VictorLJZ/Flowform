/**
 * Transforms an ApiFormVersion to a DbFormVersion
 * Converts camelCase API properties to snake_case DB properties
 */

import { ApiFormVersion, DbFormVersion } from '@/types/form';

export function apiToDbFormVersion(apiFormVersion: ApiFormVersion): DbFormVersion {
  return {
    id: apiFormVersion.id,
    form_id: apiFormVersion.formId,
    version_number: apiFormVersion.versionNumber,
    created_at: apiFormVersion.createdAt,
    created_by: apiFormVersion.createdBy,
  };
}

export function apiToDbFormVersionArray(apiFormVersions: ApiFormVersion[]): DbFormVersion[] {
  return apiFormVersions.map(apiToDbFormVersion);
}
