/**
 * Transforms an ApiFormVersion to a UiFormVersion
 * Adds UI-specific computed properties
 */

import { ApiFormVersion, UiFormVersion } from '@/types/block';

export function apiToUiFormVersion(
  apiFormVersion: ApiFormVersion, 
  latestVersionNumber?: number
): UiFormVersion {
  const formattedDate = new Date(apiFormVersion.createdAt).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return {
    ...apiFormVersion,
    formattedCreatedAt: formattedDate,
    // If latestVersionNumber is provided, check if this is the latest version
    isLatestVersion: latestVersionNumber !== undefined 
      ? apiFormVersion.versionNumber === latestVersionNumber 
      : undefined
  };
}

export function apiToUiFormVersionArray(
  apiFormVersions: ApiFormVersion[], 
  latestVersionNumber?: number
): UiFormVersion[] {
  return apiFormVersions.map(version => apiToUiFormVersion(version, latestVersionNumber));
}
