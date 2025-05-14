# Form Views Database Schema

This document provides a reference for the database schema of the `form_views` table in the FlowForm application.

## Table Overview

The `form_views` table records individual view events for forms, capturing details about visitors, their devices, and viewing context.

## Table Schema

| Column Name  | Data Type                | Nullable | Default        | Description                               |
|--------------|--------------------------|----------|----------------|-------------------------------------------|
| id           | uuid                     | NO       | uuid_generate_v4() | Primary key                           |
| form_id      | uuid                     | NO       | null           | Reference to the form being viewed        |
| visitor_id   | text                     | NO       | null           | Unique identifier for the visitor         |
| source       | text                     | YES      | null           | Where the visitor came from (referrer)    |
| device_type  | text                     | YES      | null           | Type of device used (mobile, desktop, etc.) |
| browser      | text                     | YES      | null           | Browser used to view the form             |
| timestamp    | timestamp with time zone | NO       | now()          | When the view occurred                    |
| is_unique    | boolean                  | NO       | false          | Whether this is a first-time view from this visitor |

## Relationships

- Each view is associated with a specific form (`form_id`)
- Views are aggregated to update the `total_views` and `unique_views` columns in the `form_metrics` table

## Notes

- The `visitor_id` is typically a hashed identifier generated from browser/device characteristics
- The `is_unique` flag helps distinguish between first-time and returning visitors
- This granular view data enables time-based analysis of form traffic patterns and source attribution
