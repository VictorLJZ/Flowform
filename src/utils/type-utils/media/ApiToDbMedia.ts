/**
 * API to DB Media Transformations
 * 
 * This file provides utility functions for transforming media-related types
 * from API layer to Database layer for write operations:
 * - Converts camelCase API fields to snake_case DB fields
 * - Converts undefined values to null for optional fields
 */

import { 
  DbMediaAsset,
  DbMediaAssetInput,
  DbMediaTagInput,
  DbMediaUsageUpdateInput
} from '@/types/media/DbMedia';

import {
  ApiMediaAssetInput,
  ApiMediaAssetUpdateInput,
  ApiMediaTagInput,
  ApiMediaUsageUpdateInput
} from '@/types/media/ApiMedia';

/**
 * Convert an API media asset input to database format for creation
 * 
 * @param apiInput - API media asset input object
 * @returns Database-formatted media asset input object
 */
export function apiToDbMediaAssetInput(apiInput: ApiMediaAssetInput): DbMediaAssetInput {
  return {
    media_id: apiInput.mediaId,
    user_id: apiInput.userId,
    workspace_id: apiInput.workspaceId,
    filename: apiInput.filename,
    url: apiInput.url,
    secure_url: apiInput.secureUrl,
    type: apiInput.type,
    format: apiInput.format,
    width: apiInput.width === undefined ? null : apiInput.width,
    height: apiInput.height === undefined ? null : apiInput.height,
    duration: apiInput.duration === undefined ? null : apiInput.duration,
    bytes: apiInput.bytes,
    resource_type: apiInput.resourceType,
    tags: apiInput.tags === undefined ? null : apiInput.tags
  };
}

/**
 * Convert an API media asset update input to database format
 * 
 * @param apiInput - API media asset update input object
 * @returns Database-formatted media asset update object
 */
export function apiToDbMediaAssetUpdate(apiInput: ApiMediaAssetUpdateInput): Partial<DbMediaAsset> {
  return {
    id: apiInput.id,
    tags: apiInput.tags === undefined ? null : apiInput.tags
  };
}

/**
 * Convert an API media tag input to database format for creation
 * 
 * @param apiInput - API media tag input object
 * @returns Database-formatted media tag input object
 */
export function apiToDbMediaTagInput(apiInput: ApiMediaTagInput): DbMediaTagInput {
  return {
    workspace_id: apiInput.workspaceId,
    name: apiInput.name,
    created_by: apiInput.createdBy === undefined ? null : apiInput.createdBy
  };
}

/**
 * Convert an API media usage update input to database format
 * 
 * @param apiInput - API media usage update input object
 * @returns Database-formatted media usage update object
 */
export function apiToDbMediaUsageUpdate(apiInput: ApiMediaUsageUpdateInput): DbMediaUsageUpdateInput {
  return {
    workspace_id: apiInput.workspaceId,
    total_bytes: apiInput.totalBytes === undefined ? null : apiInput.totalBytes,
    asset_count: apiInput.assetCount === undefined ? null : apiInput.assetCount
  };
}
