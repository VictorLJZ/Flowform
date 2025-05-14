# Form Block Versions Table Schema

The `form_block_versions` table stores versioned information about form blocks. This enables form versioning by maintaining a historical record of blocks as they change over time.

## Schema Details

| Column Name | Data Type | Nullable | Default Value | Description |
|------------|-----------|----------|---------------|-------------|
| id | uuid | NO | uuid_generate_v4() | Primary key, automatically generated UUID |
| block_id | uuid | NO | null | Reference to the original block in the form_blocks table |
| form_version_id | uuid | NO | null | Foreign key referencing the form version this block belongs to |
| title | text | YES | null | Display title for the block version |
| description | text | YES | null | Optional description or instructions for the block version |
| type | text | NO | null | The type of block (static, dynamic, integration, layout) |
| subtype | text | NO | null | Specific type within the main type category |
| required | boolean | YES | false | Whether an answer is required for this block version |
| order_index | integer | NO | null | Position of the block within the form version |
| settings | jsonb | YES | null | Block-specific configuration settings |
| is_deleted | boolean | YES | false | Indicates if this block has been deleted in this version |
| created_at | timestamp with time zone | YES | now() | Timestamp when the block version was created |

## Relationships

- **block_id**: References the `id` column in the `form_blocks` table
- **form_version_id**: References the `id` column in the `form_versions` table

## Notes

- The version of a block captures the state of a block at a specific point in time
- A block can have multiple versions across different form versions
- The `is_deleted` flag allows tracking blocks that have been removed in specific versions
- Form blocks that appear in responses should reference the appropriate version to ensure data integrity
- Unlike the main form_blocks table, fields like title and description are nullable to accommodate variations in block implementation across versions
