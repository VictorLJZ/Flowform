# Form Versions Schema

This table stores versions of forms, allowing the system to track changes and maintain a history of form modifications.

## Table: `form_versions`

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | Primary key for the form version |
| form_id | uuid | NO | null | Foreign key to the forms table |
| version_number | integer | NO | null | Sequential version number for the form |
| created_at | timestamp with time zone | YES | now() | When the version was created |
| created_by | uuid | YES | null | User ID who created this version |

## Relationships

- **form_id**: References the `id` column in the `forms` table.
- **created_by**: References the `id` column in the `profiles` table.

## Usage

Form versions are created when a form is published. Each version contains a snapshot of the form's blocks at the time of publication, stored in the `form_block_versions` table.
