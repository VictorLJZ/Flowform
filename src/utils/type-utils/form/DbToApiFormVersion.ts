/**
 * Transforms a DbFormVersion to an ApiFormVersion
 * Converts snake_case DB properties to camelCase API properties
 */

import { DbFormVersion, ApiFormVersion } from '@/types/block';

export function dbToApiFormVersion(dbFormVersion: DbFormVersion): ApiFormVersion {
  return {
    id: dbFormVersion.id,
    formId: dbFormVersion.form_id,
    versionNumber: dbFormVersion.version_number,
    createdAt: dbFormVersion.created_at,
    createdBy: dbFormVersion.created_by,
  };
}

export function dbToApiFormVersionArray(dbFormVersions: DbFormVersion[]): ApiFormVersion[] {
  return dbFormVersions.map(dbToApiFormVersion);
}
