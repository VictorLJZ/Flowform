# Dynamic Block Analytics Database Schema

This document provides a reference for the database schema of the `dynamic_block_analytics` table in the FlowForm application.

## Table Overview

The `dynamic_block_analytics` table stores detailed analytics data about dynamic question blocks, capturing metrics like response time, answer length, sentiment analysis, and topic extraction for individual questions.

## Table Schema

| Column Name             | Data Type                | Nullable | Default        | Description                               |
|-------------------------|--------------------------|----------|----------------|-------------------------------------------|
| id                      | uuid                     | NO       | uuid_generate_v4() | Primary key                           |
| dynamic_response_id     | uuid                     | NO       | null           | Reference to the dynamic block response   |
| block_id                | uuid                     | NO       | null           | Reference to the form block               |
| question_index          | integer                  | NO       | null           | Index position of the question            |
| question_text           | text                     | NO       | null           | Text of the dynamic question              |
| time_to_answer_seconds  | integer                  | YES      | null           | Time taken to answer the question         |
| answer_length           | integer                  | YES      | null           | Length of the answer in characters        |
| sentiment_score         | double precision         | YES      | null           | Sentiment analysis score of the answer    |
| topics                  | jsonb                    | YES      | null           | Extracted topics from the answer          |

## Relationships

- Each record is associated with a specific dynamic block response (`dynamic_response_id`) through a foreign key to the `dynamic_block_responses` table
- Each record is associated with a specific form block (`block_id`) through a foreign key to the `form_blocks` table
- Multiple analytics records can be associated with a single dynamic block response (one per question)

## Notes

- The `sentiment_score` is typically a numeric value representing the emotional tone of the answer (e.g., positive, negative, neutral)
- The `topics` field uses JSONB to store structured data about topics identified in the response
- In accordance with the FlowForm Type System Architecture:
  - Database layer uses `DbDynamicBlockAnalytic` with snake_case properties and `null` for optional values
  - API layer uses `ApiDynamicBlockAnalytic` with camelCase properties and `undefined` for optional values
  - UI layer uses `UiDynamicBlockAnalytic` with additional formatted properties for display
- These analytics enable insights into user engagement with dynamic, AI-powered form blocks
- The combination of `dynamic_response_id` and `question_index` can be used to correlate analytics with specific questions in the dynamic flow
