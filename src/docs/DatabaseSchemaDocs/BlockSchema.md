# Form Blocks Table Schema

The `form_blocks` table stores information about individual blocks within forms. Each block represents a specific component or section of a form that collects or displays information.

## Schema Details

| Column Name | Data Type | Nullable | Default Value | Description |
|------------|-----------|----------|---------------|-------------|
| id | uuid | NO | uuid_generate_v4() | Primary key, automatically generated UUID |
| form_id | uuid | NO | null | Foreign key referencing the form this block belongs to |
| type | text | NO | null | The type of block (static, dynamic, integration, layout) |
| subtype | text | NO | null | Specific type within the main type category |
| title | text | NO | null | Display title for the block |
| description | text | YES | null | Optional description or instructions for the block |
| required | boolean | NO | true | Whether an answer is required for this block |
| order_index | integer | NO | null | Position of the block within the form |
| settings | jsonb | YES | null | Block-specific configuration settings |
| created_at | timestamp with time zone | NO | now() | Timestamp when the block was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when the block was last updated |

## Relationships

- **form_id**: References the `id` column in the `forms` table

## Notes

- The `settings` column is a JSONB object containing block-specific configuration details that vary depending on the block type and subtype
- The combination of `type` and `subtype` determines the behavior and appearance of the block
- Block order is maintained through the `order_index` field, which should be unique within a form
