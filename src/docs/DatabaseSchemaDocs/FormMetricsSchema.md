# Form Metrics Database Schema

This document provides a reference for the database schema of the `form_metrics` table in the FlowForm application.

## Table Overview

The `form_metrics` table stores aggregated analytics data about forms, including views, completions, and performance metrics.

## Table Schema

| Column Name                    | Data Type                | Nullable | Default | Description                             |
|--------------------------------|--------------------------|----------|---------|----------------------------------------|
| form_id                        | uuid                     | NO       | null    | Primary key, references forms.id        |
| total_views                    | integer                  | NO       | 0       | Total number of form views              |
| unique_views                   | integer                  | NO       | 0       | Number of unique visitors to the form   |
| total_starts                   | integer                  | NO       | 0       | Number of times the form was started    |
| total_completions              | integer                  | NO       | 0       | Number of completed form submissions    |
| completion_rate                | double precision         | YES      | 0       | Percentage of starts that completed     |
| average_completion_time_seconds| integer                  | YES      | 0       | Average time to complete the form       |
| bounce_rate                    | double precision         | YES      | 0       | Percentage of visitors who left without interaction |
| last_updated                   | timestamp with time zone | NO       | now()   | When the metrics were last updated      |

## Relationships

- Each record in `form_metrics` corresponds to exactly one form in the `forms` table
- The metrics are automatically updated when related events occur (views, submissions, etc.)

## Notes

- The primary key for this table is `form_id`, which is also a foreign key to the `forms` table
- Rates (completion_rate, bounce_rate) are stored as decimal values between 0 and 1
- The metrics in this table are aggregate data computed from individual events in other tables
