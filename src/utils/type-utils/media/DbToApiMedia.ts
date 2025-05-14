/**
 * DB to API Media Transformations
 * 
 * This file provides utility functions for transforming media-related types
 * from Database layer to API layer:
 * - Converts snake_case DB fields to camelCase API fields
 * - Converts null values to undefined for optional fields
 */

import { 
  DbMediaAsset,
  DbMediaTag,
  DbMediaUsage
} from '@/types/media/DbMedia';

import {
  ApiMediaAsset,
  ApiMediaTag,
  ApiMediaUsage
} from '@/types/media/ApiMedia';

/**
 * Convert a database media asset to API format
 * 
 * @param dbAsset - Database media asset object
 * @returns API-formatted media asset object
 */
export function dbToApiMediaAsset(dbAsset: DbMediaAsset): ApiMediaAsset {
  return {
    id: dbAsset.id,
    mediaId: dbAsset.media_id,
    userId: dbAsset.user_id,
    workspaceId: dbAsset.workspace_id,
    filename: dbAsset.filename,
    url: dbAsset.url,
    secureUrl: dbAsset.secure_url,
    type: dbAsset.type,
    format: dbAsset.format,
    width: dbAsset.width === null ? undefined : dbAsset.width,
    height: dbAsset.height === null ? undefined : dbAsset.height,
    duration: dbAsset.duration === null ? undefined : dbAsset.duration,
    bytes: dbAsset.bytes,
    resourceType: dbAsset.resource_type,
    tags: dbAsset.tags === null ? undefined : dbAsset.tags,
    createdAt: dbAsset.created_at
  };
}

/**
 * Convert a database media tag to API format
 * 
 * @param dbTag - Database media tag object
 * @returns API-formatted media tag object
 */
export function dbToApiMediaTag(dbTag: DbMediaTag): ApiMediaTag {
  return {
    id: dbTag.id,
    workspaceId: dbTag.workspace_id,
    name: dbTag.name,
    createdBy: dbTag.created_by === null ? undefined : dbTag.created_by,
    createdAt: dbTag.created_at
  };
}

/**
 * Convert a database media usage stats to API format
 * 
 * @param dbUsage - Database media usage object
 * @returns API-formatted media usage object
 */
export function dbToApiMediaUsage(dbUsage: DbMediaUsage): ApiMediaUsage {
  return {
    id: dbUsage.id,
    workspaceId: dbUsage.workspace_id,
    totalBytes: dbUsage.total_bytes === null ? undefined : dbUsage.total_bytes,
    assetCount: dbUsage.asset_count === null ? undefined : dbUsage.asset_count,
    lastUpdated: dbUsage.last_updated
  };
}

/**
 * Convert multiple database media assets to API format
 * 
 * @param dbAssets - Array of database media asset objects
 * @returns Array of API-formatted media asset objects
 */
export function dbToApiMediaAssets(dbAssets: DbMediaAsset[]): ApiMediaAsset[] {
  return dbAssets.map(dbToApiMediaAsset);
}

/**
 * Convert multiple database media tags to API format
 * 
 * @param dbTags - Array of database media tag objects
 * @returns Array of API-formatted media tag objects
 */
export function dbToApiMediaTags(dbTags: DbMediaTag[]): ApiMediaTag[] {
  return dbTags.map(dbToApiMediaTag);
}
