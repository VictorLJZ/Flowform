# Workspace Database Schema

This document provides a reference for the database schema of workspace-related tables in the FlowForm application.

## Tables Overview

The workspace functionality is managed through three primary tables:
- `workspaces`: Stores workspace metadata and settings
- `workspace_members`: Manages user membership within workspaces
- `workspace_invitations`: Handles invitations to join workspaces

## Table Schemas

### Workspaces

The `workspaces` table stores the core workspace information.

| Column Name  | Data Type               | Nullable | Default        | Description                      |
|--------------|-------------------------|----------|----------------|----------------------------------|
| id           | uuid                    | NO       | uuid_generate_v4() | Primary key                  |
| name         | text                    | NO       | null           | Workspace name                   |
| description  | text                    | YES      | null           | Optional workspace description   |
| created_at   | timestamp with time zone| NO       | now()          | Creation timestamp               |
| created_by   | uuid                    | NO       | null           | UUID of the creating user        |
| updated_at   | timestamp with time zone| NO       | now()          | Last update timestamp            |
| logo_url     | text                    | YES      | null           | Optional URL to workspace logo   |
| settings     | jsonb                   | YES      | null           | JSON settings for the workspace  |

### Workspace Members

The `workspace_members` table manages user membership within workspaces.

| Column Name  | Data Type               | Nullable | Default        | Description                      |
|--------------|-------------------------|----------|----------------|----------------------------------|
| workspace_id | uuid                    | NO       | null           | Foreign key to workspaces.id     |
| user_id      | uuid                    | NO       | null           | Foreign key to auth.users.id     |
| role         | text                    | NO       | null           | Member role (owner, admin, etc.) |
| joined_at    | timestamp with time zone| NO       | now()          | When the user joined             |

Note: The primary key for this table is a composite key of (workspace_id, user_id).

### Workspace Invitations

The `workspace_invitations` table manages invitations to join workspaces.

| Column Name  | Data Type               | Nullable | Default        | Description                      |
|--------------|-------------------------|----------|----------------|----------------------------------|
| id           | uuid                    | NO       | uuid_generate_v4() | Primary key                  |
| workspace_id | uuid                    | NO       | null           | Foreign key to workspaces.id     |
| email        | text                    | NO       | null           | Invitee's email address          |
| role         | text                    | NO       | null           | Offered role in the workspace    |
| status       | text                    | NO       | 'pending'      | Invitation status                |
| invited_by   | uuid                    | NO       | null           | UUID of the inviting user        |
| invited_at   | timestamp with time zone| NO       | now()          | When invitation was sent         |
| expires_at   | timestamp with time zone| NO       | now() + 7 days | When invitation expires          |
| token        | text                    | NO       | null           | Unique invitation token          |

## Relationships

- Each `workspace` can have multiple `workspace_members`
- Each `workspace` can have multiple `workspace_invitations`
- Users (referenced by user_id) can be members of multiple workspaces
- Users (referenced by invited_by) can create multiple invitations

## Enum Values

The `role` column in both `workspace_members` and `workspace_invitations` accepts these values:
- 'owner'
- 'admin' 
- 'editor'
- 'viewer'

The `status` column in `workspace_invitations` accepts these values:
- 'pending'
- 'accepted'
- 'declined'
- 'expired'

## Profiles Table

The `profiles` table stores user information linked to authentication identities.

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | uuid | NO | - | Primary key, references auth.users.id |
| email | text | NO | - | User's email address |
| full_name | text | YES | - | User's full name |
| avatar_url | text | YES | - | URL to user's avatar image |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| updated_at | timestamp with time zone | NO | now() | Record update timestamp |
