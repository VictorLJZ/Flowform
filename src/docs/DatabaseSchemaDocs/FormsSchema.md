# Forms Table Schema

This document describes the database schema for the `forms` table in FlowForm.

## Table Schema

| Column Name   | Data Type                | Nullable | Default           | Description                              |
|---------------|--------------------------|----------|-------------------|------------------------------------------|
| form_id       | uuid                     | NO       | uuid_generate_v4() | Primary key, auto-generated UUID         |
| workspace_id  | uuid                     | NO       | null              | Foreign key to workspaces.id             |
| title         | text                     | NO       | null              | Form title                               |
| description   | text                     | YES      | null              | Optional form description                |
| slug          | text                     | YES      | null              | URL-friendly identifier for the form     |
| status        | text                     | NO       | 'draft'           | Form status: 'draft', 'published', 'archived' |
| theme         | jsonb                    | YES      | null              | Form theming and appearance settings     |
| settings      | jsonb                    | YES      | null              | General form settings and configuration  |
| created_at    | timestamp with time zone | NO       | now()             | When the form was created                |
| created_by    | uuid                     | NO       | null              | User who created the form (auth.users.id)|
| updated_at    | timestamp with time zone | NO       | now()             | When the form was last updated           |
| published_at  | timestamp with time zone | YES      | null              | When the form was published              |

## Relationships

- `workspace_id` references `workspaces.id`
- `created_by` references `auth.users.id`

## Type System Implementation

The forms table is represented in the application's three-layer type system:

1. **Database Layer** (`DbForm` in `src/types/form/DbForm.ts`):
   - Direct representation of the database schema
   - Uses snake_case properties and SQL conventions
   - Nullable fields represented as `type | null`

2. **API Layer** (`ApiForm` in `src/types/form/ApiForm.ts`):
   - API communication format
   - Uses camelCase properties
   - Nullable fields represented as optional properties with `?` syntax

3. **UI Layer** (`UiForm` in `src/types/form/UiForm.ts`):
   - UI-specific representation
   - Extends API type with additional computed properties for display
   - Includes formatted dates, display strings, and UI state

## Usage Guidelines

When working with form data:

1. **Database Operations**: Use `DbForm` types
2. **API Routes**: Transform between `DbForm` ↔ `ApiForm` types
3. **UI Components**: Use `UiForm` types, transforming from `ApiForm` when needed

## Input/Output Types

For creating and updating forms:

- `ApiFormInput`: For form creation API calls
- `ApiFormUpdateInput`: For form update API calls (all fields optional)
