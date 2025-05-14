# Block Options Database Schema

This document provides a reference for the database schema of the `block_options` table in the FlowForm application.

## Table Overview

The `block_options` table stores options for form blocks that have selectable choices, such as dropdown menus, radio buttons, checkboxes, and other selection controls.

## Table Schema

| Column Name          | Data Type                | Nullable | Default        | Description                               |
|----------------------|--------------------------|----------|----------------|-------------------------------------------|
| id                   | uuid                     | NO       | uuid_generate_v4() | Primary key                           |
| block_id             | uuid                     | NO       | null           | Reference to the form block this option belongs to |
| value                | text                     | NO       | null           | The stored value of this option (used for form submission) |
| label                | text                     | NO       | null           | The displayed text for this option        |
| order_index          | integer                  | NO       | null           | The order position of this option in the list |
| created_at           | timestamp with time zone | NO       | now()          | When the option was created               |

## Relationships

- Each record is associated with a specific form block (`block_id`) through a foreign key to the `form_blocks` table
- Multiple options can be associated with a single block, ordered by `order_index`

## Notes

- The `value` field stores the data that is actually submitted when a user selects this option
- The `label` field stores the user-friendly text shown in the UI
- The `order_index` field ensures options are displayed in the correct sequence
- In accordance with the FlowForm Type System Architecture:
  - Database layer uses `DbBlockOption` with snake_case properties
  - API layer uses `ApiBlockOption` with camelCase properties
  - UI layer uses `UiBlockOption` with potential additional display properties
- Options are typically rendered in the form UI based on the block type and configured display settings
