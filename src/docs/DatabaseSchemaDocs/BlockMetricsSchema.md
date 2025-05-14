# Block Metrics Database Schema

This document provides a reference for the database schema of the `block_metrics` table in the FlowForm application.

## Table Overview

The `block_metrics` table stores aggregated analytics data about individual blocks within forms, including views, skips, and user engagement metrics.

## Table Schema

| Column Name          | Data Type                | Nullable | Default        | Description                               |
|----------------------|--------------------------|----------|----------------|-------------------------------------------|
| id                   | uuid                     | NO       | uuid_generate_v4() | Primary key                           |
| block_id             | uuid                     | NO       | null           | Reference to the block being measured     |
| form_id              | uuid                     | NO       | null           | Reference to the form containing the block|
| views                | integer                  | NO       | 0              | Number of times the block was viewed      |
| skips                | integer                  | NO       | 0              | Number of times the block was skipped     |
| average_time_seconds | integer                  | YES      | 0              | Average time spent on this block          |
| drop_off_count       | integer                  | NO       | 0              | Number of users who abandoned at this block |
| drop_off_rate        | double precision         | YES      | 0              | Percentage of users who abandoned at this block |
| last_updated         | timestamp with time zone | NO       | now()          | When the metrics were last updated        |
| submissions          | integer                  | NO       | 0              | Number of times this block was submitted  |

## Relationships

- Each record is associated with a specific block (`block_id`)
- Each record is associated with a specific form (`form_id`)
- The metrics are aggregated from individual interactions tracked in the `form_interactions` table

## Notes

- The compound relationship between `block_id` and `form_id` is important as the same block could potentially be used in multiple forms
- Drop-off rate is stored as a decimal value between 0 and 1
- These metrics provide insights into which blocks are causing friction or engagement in the form flow
