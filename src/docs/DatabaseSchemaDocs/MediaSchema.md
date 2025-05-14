# Media Database Schema

This document details the database schema for media-related tables in the FlowForm application.

## Media Assets Table

The `media_assets` table stores information about media files uploaded to the application. It tracks file metadata and storage information.

### Schema Details

| Column Name | Data Type | Nullable | Default Value | Description |
|------------|-----------|----------|---------------|-------------|
| id | uuid | NO | uuid_generate_v4() | Primary key, automatically generated UUID |
| media_id | text | NO | null | External service identifier for the media asset |
| user_id | uuid | NO | null | ID of the user who uploaded the asset |
| workspace_id | uuid | NO | null | ID of the workspace the asset belongs to |
| filename | text | NO | null | Original filename of the uploaded asset |
| url | text | NO | null | Public URL for accessing the media asset |
| secure_url | text | NO | null | Secure URL for accessing the media asset |
| type | text | NO | null | Media type category (image, video, document, etc.) |
| format | text | NO | null | File format/extension (jpg, png, mp4, etc.) |
| width | integer | YES | null | Width of the media asset (for images/videos) |
| height | integer | YES | null | Height of the media asset (for images/videos) |
| duration | double precision | YES | null | Duration in seconds (for audio/video) |
| bytes | integer | NO | null | File size in bytes |
| resource_type | text | NO | null | Resource type classification |
| tags | ARRAY | YES | '{}' | Array of tags associated with the asset |
| created_at | timestamp with time zone | YES | now() | Timestamp when the asset was created |

### Relationships

- **user_id**: References the `id` column in the `profiles` table
- **workspace_id**: References the `id` column in the `workspaces` table

## Media Tags Table

The `media_tags` table stores predefined tags that can be associated with media assets for organizational purposes.

### Schema Details

| Column Name | Data Type | Nullable | Default Value | Description |
|------------|-----------|----------|---------------|-------------|
| id | uuid | NO | uuid_generate_v4() | Primary key, automatically generated UUID |
| workspace_id | uuid | NO | null | ID of the workspace the tag belongs to |
| name | text | NO | null | Name of the tag |
| created_by | uuid | YES | null | ID of the user who created the tag |
| created_at | timestamp with time zone | YES | now() | Timestamp when the tag was created |

### Relationships

- **workspace_id**: References the `id` column in the `workspaces` table
- **created_by**: References the `id` column in the `profiles` table

## Media Usage Table

The `media_usage` table tracks media storage usage statistics per workspace.

### Schema Details

| Column Name | Data Type | Nullable | Default Value | Description |
|------------|-----------|----------|---------------|-------------|
| id | uuid | NO | uuid_generate_v4() | Primary key, automatically generated UUID |
| workspace_id | uuid | NO | null | ID of the workspace |
| total_bytes | bigint | YES | 0 | Total storage used in bytes |
| asset_count | integer | YES | 0 | Count of media assets in the workspace |
| last_updated | timestamp with time zone | YES | now() | Timestamp when usage stats were last updated |

### Relationships

- **workspace_id**: References the `id` column in the `workspaces` table

## Notes

- The `media_assets.tags` column contains an array of tag strings that can be referenced in the `media_tags` table
- Media usage is tracked at the workspace level to enable quota management and billing features
- The `media_id` in the `media_assets` table typically corresponds to an ID from an external storage provider
