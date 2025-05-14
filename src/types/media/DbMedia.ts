/**
 * Database layer type definitions for media-related tables
 * Directly maps to the media_assets, media_tags, and media_usage tables
 * Uses snake_case naming to match database column names
 */

/**
 * Database representation of a media asset
 * Maps directly to the media_assets table
 */
export interface DbMediaAsset {
  id: string; // UUID, primary key
  media_id: string; // External service identifier
  user_id: string; // UUID, references profiles.id
  workspace_id: string; // UUID, references workspaces.id
  filename: string; // Original filename
  url: string; // Public URL
  secure_url: string; // Secure URL
  type: string; // Media type category (image, video, document, etc.)
  format: string; // File format/extension
  width: number | null; // Width (for images/videos)
  height: number | null; // Height (for images/videos)
  duration: number | null; // Duration in seconds (for audio/video)
  bytes: number; // File size in bytes
  resource_type: string; // Resource type classification
  tags: string[] | null; // Array of tags
  created_at: string; // ISO timestamp
}

/**
 * Database representation of a media tag
 * Maps directly to the media_tags table
 */
export interface DbMediaTag {
  id: string; // UUID, primary key
  workspace_id: string; // UUID, references workspaces.id
  name: string; // Tag name
  created_by: string | null; // UUID, references profiles.id
  created_at: string; // ISO timestamp
}

/**
 * Database representation of media usage statistics
 * Maps directly to the media_usage table
 */
export interface DbMediaUsage {
  id: string; // UUID, primary key
  workspace_id: string; // UUID, references workspaces.id
  total_bytes: number | null; // Total storage used in bytes
  asset_count: number | null; // Count of media assets
  last_updated: string; // ISO timestamp
}

/**
 * Input type for creating a new media asset in the database
 */
export type DbMediaAssetInput = Omit<DbMediaAsset, 'id' | 'created_at'>;

/**
 * Input type for creating a new media tag in the database
 */
export type DbMediaTagInput = Omit<DbMediaTag, 'id' | 'created_at'>;

/**
 * Input type for updating media usage statistics in the database
 */
export type DbMediaUsageUpdateInput = Pick<DbMediaUsage, 'workspace_id' | 'total_bytes' | 'asset_count'>;
