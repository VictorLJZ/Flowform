/**
 * API layer type definitions for media-related data
 * Used for data transfer between client and server
 * Uses camelCase naming convention
 */

/**
 * API representation of a media asset
 */
export interface ApiMediaAsset {
  id: string;
  mediaId: string;
  userId: string;
  workspaceId: string;
  filename: string;
  url: string;
  secureUrl: string;
  type: string;
  format: string;
  width?: number;
  height?: number;
  duration?: number;
  bytes: number;
  resourceType: string;
  tags?: string[];
  createdAt: string;
}

/**
 * API representation of a media tag
 */
export interface ApiMediaTag {
  id: string;
  workspaceId: string;
  name: string;
  createdBy?: string;
  createdAt: string;
}

/**
 * API representation of media usage statistics
 */
export interface ApiMediaUsage {
  id: string;
  workspaceId: string;
  totalBytes?: number;
  assetCount?: number;
  lastUpdated: string;
}

/**
 * Input type for creating a new media asset
 */
export interface ApiMediaAssetInput {
  mediaId: string;
  userId: string;
  workspaceId: string;
  filename: string;
  url: string;
  secureUrl: string;
  type: string;
  format: string;
  width?: number;
  height?: number;
  duration?: number;
  bytes: number;
  resourceType: string;
  tags?: string[];
}

/**
 * Input type for updating an existing media asset
 */
export interface ApiMediaAssetUpdateInput {
  id: string;
  tags?: string[];
}

/**
 * Input type for creating a new media tag
 */
export interface ApiMediaTagInput {
  workspaceId: string;
  name: string;
  createdBy?: string;
}

/**
 * Input type for updating media usage statistics
 */
export interface ApiMediaUsageUpdateInput {
  workspaceId: string;
  totalBytes?: number;
  assetCount?: number;
}
