# Flowform Responses Schema Documentation

This document outlines the database schema for response-related tables in the Flowform application. These tables are used to store form responses from users including both static and dynamic responses.

## Table Schemas

### form_responses

This table stores the main response data for each form submission.

| Column Name      | Data Type               | Required | Default           | Description                                      |
|------------------|-------------------------|----------|-------------------|--------------------------------------------------|
| id               | uuid                    | YES      | uuid_generate_v4() | Primary key                                      |
| form_id          | uuid                    | YES      | -                 | Reference to the form                            |
| form_version_id  | uuid                    | NO       | -                 | Reference to the specific version of the form    |
| respondent_id    | text                    | YES      | -                 | Identifier for the respondent                    |
| status           | text                    | YES      | 'in_progress'     | Status of the response (in_progress, completed, abandoned) |
| started_at       | timestamp with time zone | YES      | now()            | When the response was started                    |
| completed_at     | timestamp with time zone | NO       | -                 | When the response was completed                  |
| metadata         | jsonb                   | NO       | -                 | Additional metadata about the response           |

### static_block_answers

This table stores answers to static form blocks (e.g., text inputs, selects, etc.).

| Column Name      | Data Type               | Required | Default           | Description                                      |
|------------------|-------------------------|----------|-------------------|--------------------------------------------------|
| id               | uuid                    | YES      | uuid_generate_v4() | Primary key                                      |
| response_id      | uuid                    | YES      | -                 | Reference to the form response                   |
| block_id         | uuid                    | YES      | -                 | Reference to the form block                      |
| answer           | text                    | NO       | -                 | The user's answer (may be null)                  |
| answered_at      | timestamp with time zone | YES      | now()            | When the answer was provided                     |

### dynamic_block_responses

This table stores responses to dynamic (conversation) blocks that involve AI interaction.

| Column Name      | Data Type               | Required | Default           | Description                                      |
|------------------|-------------------------|----------|-------------------|--------------------------------------------------|
| id               | uuid                    | YES      | uuid_generate_v4() | Primary key                                      |
| response_id      | uuid                    | YES      | -                 | Reference to the form response                   |
| block_id         | uuid                    | YES      | -                 | Reference to the form block                      |
| conversation     | jsonb                   | YES      | -                 | Conversation history as JSON                     |
| started_at       | timestamp with time zone | YES      | now()            | When the conversation was started                |
| updated_at       | timestamp with time zone | NO       | now()            | When the conversation was last updated           |
| completed_at     | timestamp with time zone | NO       | -                 | When the conversation was completed              |
| next_question    | text                    | NO       | -                 | The next question in the conversation (if any)   |

## Type System

These database tables are represented in the application using a three-layer type system:

1. **Database Layer** (Db* types):
   - Represent the exact structure of database tables with snake_case property names
   - Examples: DbFormResponse, DbStaticBlockAnswer, DbDynamicBlockResponse

2. **API Layer** (Api* types):
   - Represent data as it's transferred between client and server with camelCase property names
   - Examples: ApiFormResponse, ApiStaticBlockAnswer, ApiDynamicBlockResponse

3. **UI Layer** (Ui* types):
   - Extend API types with additional UI-specific properties and computed fields
   - Examples: UiFormResponse, UiStaticBlockAnswer, UiDynamicBlockResponse

## Relationships

- Each `form_responses` record can have multiple related `static_block_answers` (one-to-many relationship)
- Each `form_responses` record can have multiple related `dynamic_block_responses` (one-to-many relationship)
- Both `static_block_answers` and `dynamic_block_responses` reference the form block they are answering
