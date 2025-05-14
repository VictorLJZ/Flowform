# Form Interactions Database Schema

This document provides a reference for the database schema of the `form_interactions` table in the FlowForm application.

## Table Overview

The `form_interactions` table captures detailed interaction events from users as they engage with forms and blocks, providing granular analytics data.

## Table Schema

| Column Name      | Data Type                | Nullable | Default        | Description                               |
|------------------|--------------------------|----------|----------------|-------------------------------------------|
| id               | uuid                     | NO       | uuid_generate_v4() | Primary key                           |
| response_id      | uuid                     | YES      | null           | Reference to a form response (if applicable) |
| block_id         | uuid                     | YES      | null           | Reference to the block being interacted with |
| interaction_type | text                     | NO       | null           | Type of interaction (view, click, etc.)   |
| timestamp        | timestamp with time zone | NO       | now()          | When the interaction occurred             |
| duration_ms      | integer                  | YES      | null           | Duration of the interaction in milliseconds |
| metadata         | jsonb                    | YES      | null           | Additional context about the interaction  |
| form_id          | uuid                     | YES      | null           | Reference to the form being interacted with |

## Relationships

- Each interaction may be associated with a form (`form_id`)
- Each interaction may be associated with a specific block (`block_id`)
- Each interaction may be part of a form response (`response_id`)

## Notes

- The `interaction_type` field typically contains values like 'view', 'submit', 'skip', 'click', etc.
- The `metadata` JSON field can store additional context-specific information about the interaction
- This table stores raw interaction data that can be aggregated to generate the metrics in the `form_metrics` and `block_metrics` tables
