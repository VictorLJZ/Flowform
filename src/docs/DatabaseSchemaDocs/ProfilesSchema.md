# Profiles Database Schema

This document provides a reference for the database schema of the `profiles` table in the FlowForm application.

## Table Overview

The `profiles` table stores user profile information, including email, name, and avatar URL. This table is central to user identity management in the application.

## Table Schema

| Column Name          | Data Type                | Nullable | Default        | Description                               |
|----------------------|--------------------------|----------|----------------|-------------------------------------------|
| id                   | uuid                     | NO       | null           | Primary key and foreign key to auth.users |
| email                | text                     | NO       | null           | User's email address (unique)             |
| full_name            | text                     | YES      | null           | User's full name                          |
| avatar_url           | text                     | YES      | null           | URL to user's profile image               |
| created_at           | timestamp with time zone | NO       | now()          | When the profile was created              |
| updated_at           | timestamp with time zone | NO       | now()          | When the profile was last updated         |

## Relationships

- The `id` column is linked to the authentication system's users table
- The profile record is referenced by workspace memberships and other user-related records
- Email addresses must be unique across all profiles

## Notes

- In accordance with the FlowForm Type System Architecture:
  - Database layer uses `DbProfile` with snake_case properties and `null` for optional values
  - API layer uses `ApiProfile` with camelCase properties and `undefined` for optional values
  - UI layer uses `UiProfile` with added display properties like `displayName` and `initials`
- The `full_name` and `avatar_url` fields being nullable aligns with the application's user onboarding flow, where these details might be added after initial registration
- The `email` field has a uniqueness constraint to ensure email addresses are not duplicated
