# Chat System Database Schema

This document provides a reference for the database schema of the chat system tables in the FlowForm application, including `chat_sessions`, `chat_messages`, and `conversation_embeddings`.

## Overview

The FlowForm chat system enables AI-powered conversations with users within form contexts. These tables store session data, message history, and semantic embeddings for advanced retrieval and analysis.

## Chat Sessions Table

The `chat_sessions` table tracks individual conversation sessions between users and the AI.

### Table Schema

| Column Name        | Data Type                | Nullable | Default        | Description                                  |
|--------------------|--------------------------|----------|----------------|----------------------------------------------|
| id                 | uuid                     | NO       | uuid_generate_v4() | Primary key                              |
| form_id            | uuid                     | NO       | null           | Reference to the form this chat belongs to   |
| user_id            | uuid                     | NO       | null           | Reference to the user                        |
| created_at         | timestamp with time zone | YES      | now()          | When the session was created                 |
| updated_at         | timestamp with time zone | YES      | now()          | When the session was last updated            |
| title              | text                     | YES      | null           | User-friendly title for the chat session     |
| last_message       | text                     | YES      | null           | Snippet of the most recent message           |
| last_response_id   | text                     | YES      | null           | OpenAI response ID for state management      |

### Relationships

- Each session is associated with a specific form (`form_id`) through a foreign key to the `forms` table
- Each session is associated with a specific user (`user_id`)
- A session can have multiple messages in the `chat_messages` table

## Chat Messages Table

The `chat_messages` table stores the individual messages within a chat session.

### Table Schema

| Column Name        | Data Type                | Nullable | Default        | Description                               |
|--------------------|--------------------------|----------|----------------|-------------------------------------------|
| id                 | uuid                     | NO       | uuid_generate_v4() | Primary key                           |
| session_id         | uuid                     | NO       | null           | Reference to the chat session             |
| role               | text                     | NO       | null           | Role of the message sender (user, assistant, developer) |
| content            | text                     | NO       | null           | Content of the message                    |
| created_at         | timestamp with time zone | YES      | now()          | When the message was created              |

### Relationships

- Each message is associated with a specific chat session (`session_id`) through a foreign key to the `chat_sessions` table
- Messages are stored in chronological order by `created_at`

## Conversation Embeddings Table

The `conversation_embeddings` table stores vector embeddings of conversation content for semantic search and analysis.

### Table Schema

| Column Name        | Data Type                | Nullable | Default        | Description                               |
|--------------------|--------------------------|----------|----------------|-------------------------------------------|
| id                 | uuid                     | NO       | uuid_generate_v4() | Primary key                           |
| form_id            | uuid                     | NO       | null           | Reference to the form                     |
| block_id           | uuid                     | NO       | null           | Reference to the specific form block      |
| response_id        | uuid                     | NO       | null           | Reference to the form response            |
| conversation_text  | text                     | NO       | null           | Text content used to generate embedding   |
| embedding          | vector                   | YES      | null           | Vector representation of the conversation |
| created_at         | timestamp with time zone | YES      | now()          | When the embedding was created            |

### Relationships

- Each embedding is associated with a specific form (`form_id`) through a foreign key to the `forms` table
- Each embedding is associated with a specific block (`block_id`) through a foreign key to the `form_blocks` table
- Each embedding is associated with a specific response (`response_id`) through a foreign key to the `form_responses` table

## Implementation Notes

- In accordance with the FlowForm Type System Architecture:
  - Database layer uses `DbChat*` types with snake_case properties and `null` for optional values
  - API layer uses `ApiChat*` types with camelCase properties and `undefined` for optional values
  - UI layer uses `UiChat*` types with additional display properties
  
- The `role` field in `chat_messages` aligns with the OpenAI Responses API format, using:
  - `'user'` for end-user messages
  - `'assistant'` for AI responses 
  - `'developer'` for system instructions (replaces the deprecated 'system' role)

- The `last_response_id` in `chat_sessions` stores OpenAI's response ID to support state management with the Responses API

- The `embedding` column in `conversation_embeddings` uses a vector data type provided by pgvector extension

- These tables support both synchronous chat interfaces and asynchronous analytics, enabling both real-time conversations and insights generation
