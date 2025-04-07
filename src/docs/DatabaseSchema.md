# FlowForm-neo Database Schema

This document outlines the database schema for the FlowForm-neo application in Supabase.

## Workspace Management Tables

### 1. profiles

Extends the built-in Supabase auth.users table with application-specific user data.

| Column     | Type                    | Description                        |
|------------|-------------------------|------------------------------------|
| id         | UUID                    | Primary key, references auth.users.id |
| email      | TEXT                    | User's email address (unique)      |
| full_name  | TEXT                    | User's full name                   |
| avatar_url | TEXT                    | URL to user's profile image        |
| created_at | TIMESTAMP WITH TIME ZONE| When profile was created           |
| updated_at | TIMESTAMP WITH TIME ZONE| When profile was last updated      |

### 2. workspaces

Stores workspace information.

| Column      | Type                    | Description                       |
|-------------|-------------------------|-----------------------------------|
| id          | UUID                    | Primary key                       |
| name        | TEXT                    | Workspace name                    |
| description | TEXT                    | Workspace description (optional)  |
| created_at  | TIMESTAMP WITH TIME ZONE| When workspace was created        |
| created_by  | UUID                    | References auth.users.id          |
| updated_at  | TIMESTAMP WITH TIME ZONE| When workspace was last updated   |
| logo_url    | TEXT                    | URL to workspace logo (optional)  |
| settings    | JSONB                   | Workspace settings (optional)     |

#### Row Level Security Policies

| Policy Name | Command | Using (qual) | With Check |
|-------------|---------|--------------|------------|
| Users can create workspaces | INSERT | null | `created_by = auth.uid()` |
| Users can view workspaces they created | SELECT | `created_by = auth.uid()` | null |
| Workspace creators can update workspace | UPDATE | `created_by = auth.uid()` | null |

### 3. workspace_invitations

Tracks pending invitations to workspaces.

| Column      | Type                    | Description                       |
|-------------|-------------------------|-----------------------------------|
| id          | UUID                    | Primary key                       |
| workspace_id| UUID                    | References workspaces.id          |
| email       | TEXT                    | Invited user's email              |
| role        | TEXT                    | Invited role (owner, admin, editor, viewer) |
| status      | TEXT                    | Status (pending, accepted, declined, expired) |
| invited_by  | UUID                    | References auth.users.id          |
| invited_at  | TIMESTAMP WITH TIME ZONE| When invitation was sent          |
| expires_at  | TIMESTAMP WITH TIME ZONE| When invitation expires           |
| token       | TEXT                    | Unique token for invitation link  |

### 4. workspace_members

Stores active workspace memberships.

| Column       | Type                    | Description                      |
|--------------|-------------------------|----------------------------------|
| workspace_id | UUID                    | References workspaces.id         |
| user_id      | UUID                    | References auth.users.id         |
| role         | TEXT                    | Role (owner, admin, editor, viewer) |
| joined_at    | TIMESTAMP WITH TIME ZONE| When user joined the workspace   |

Primary key: (workspace_id, user_id)

#### Row Level Security Policies

| Policy Name | Command | Using (qual) | With Check |
|-------------|---------|--------------|------------|
| Allow users to create their own membership | INSERT | null | `user_id = auth.uid()` |
| Users can view their own memberships | SELECT | `user_id = auth.uid()` | null |
| Owners can manage members | ALL | `EXISTS (SELECT 1 FROM workspaces WHERE id = workspace_id AND created_by = auth.uid())` | null |

## Form Management Tables

### 5. forms

Stores form information.

| Column      | Type                    | Description                       |
|-------------|-------------------------|-----------------------------------|
| form_id     | UUID                    | Primary key                       |
| workspace_id| UUID                    | References workspaces.id          |
| title       | TEXT                    | Form title                        |
| description | TEXT                    | Form description                  |
| slug        | TEXT                    | Unique slug for public URL        |
| status      | TEXT                    | Status (draft, published, archived) |
| theme       | JSONB                   | Form theme settings (colors, fonts) |
| settings    | JSONB                   | Form behavior settings            |
| created_at  | TIMESTAMP WITH TIME ZONE| When form was created             |
| created_by  | UUID                    | References auth.users.id          |
| updated_at  | TIMESTAMP WITH TIME ZONE| When form was last updated        |
| published_at| TIMESTAMP WITH TIME ZONE| When form was published (nullable)|

### 6. form_blocks

Stores question blocks within forms.

| Column      | Type                    | Description                       |
|-------------|-------------------------|-----------------------------------|
| id          | UUID                    | Primary key                       |
| form_id     | UUID                    | References forms.form_id          |
| type        | TEXT                    | Block type (static, dynamic)      |
| subtype     | TEXT                    | Block subtype (text_short, text_long, etc.) |
| title       | TEXT                    | Question title/text               |
| description | TEXT                    | Help text/description             |
| required    | BOOLEAN                 | Whether answer is required        |
| order_index | INTEGER                 | Position in form                  |
| settings    | JSONB                   | Block-specific settings           |
| created_at  | TIMESTAMP WITH TIME ZONE| When block was created            |
| updated_at  | TIMESTAMP WITH TIME ZONE| When block was last updated       |

### 7. dynamic_block_configs

Stores AI configuration for dynamic blocks.

| Column           | Type                    | Description                       |
|------------------|-------------------------|-----------------------------------|
| block_id         | UUID                    | References form_blocks.id (primary key) |
| starter_question | TEXT                    | Initial question to ask           |
| temperature      | FLOAT                   | AI temperature setting (0.0-1.0)  |
| max_questions    | INTEGER                 | Maximum number of follow-up questions |
| ai_instructions  | TEXT                    | Guidelines for the AI             |
| created_at       | TIMESTAMP WITH TIME ZONE| When config was created           |
| updated_at       | TIMESTAMP WITH TIME ZONE| When config was last updated      |

### 8. block_options

Stores options for multiple choice and similar blocks.

| Column      | Type                    | Description                       |
|-------------|-------------------------|-----------------------------------|
| id          | UUID                    | Primary key                       |
| block_id    | UUID                    | References form_blocks.id         |
| value       | TEXT                    | Option value (stored in database) |
| label       | TEXT                    | Option label (displayed to user)  |
| order_index | INTEGER                 | Position in options list          |
| created_at  | TIMESTAMP WITH TIME ZONE| When option was created           |

### 9. form_responses

Stores form submissions.

| Column        | Type                    | Description                       |
|---------------|-------------------------|-----------------------------------|
| id            | UUID                    | Primary key                       |
| form_id       | UUID                    | References forms.form_id          |
| respondent_id | TEXT                    | Anonymous identifier for respondent |
| status        | TEXT                    | Status (in_progress, completed, abandoned) |
| started_at    | TIMESTAMP WITH TIME ZONE| When response was started         |
| completed_at  | TIMESTAMP WITH TIME ZONE| When response was completed (nullable) |
| metadata      | JSONB                   | Browser, device, source info      |

### 10. static_block_answers

Stores answers to static blocks.

| Column      | Type                    | Description                       |
|-------------|-------------------------|-----------------------------------|
| id          | UUID                    | Primary key                       |
| response_id | UUID                    | References form_responses.id      |
| block_id    | UUID                    | References form_blocks.id         |
| answer      | TEXT                    | Answer content                    |
| answered_at | TIMESTAMP WITH TIME ZONE| When question was answered        |

### 11. dynamic_block_responses

Stores AI-driven conversations.

| Column       | Type                    | Description                       |
|--------------|-------------------------|-----------------------------------|
| id           | UUID                    | Primary key                       |
| response_id  | UUID                    | References form_responses.id      |
| block_id     | UUID                    | References form_blocks.id         |
| conversation | JSONB                   | Array of Q&A objects              |
| started_at   | TIMESTAMP WITH TIME ZONE| When conversation was started     |
| completed_at | TIMESTAMP WITH TIME ZONE| When conversation was completed   |

## Analytics Tables

### 12. form_views

Tracks each time a form is viewed.

| Column      | Type                    | Description                       |
|-------------|-------------------------|-----------------------------------|
| id          | UUID                    | Primary key                       |
| form_id     | UUID                    | References forms.form_id          |
| visitor_id  | TEXT                    | Anonymous identifier for visitor  |
| source      | TEXT                    | Referrer or traffic source        |
| device_type | TEXT                    | mobile, tablet, desktop           |
| browser     | TEXT                    | Browser information               |
| timestamp   | TIMESTAMP WITH TIME ZONE| When the view occurred            |
| is_unique   | BOOLEAN                 | Whether this is first view by visitor |

### 13. form_metrics

Aggregated metrics for form performance.

| Column                        | Type                    | Description                       |
|-------------------------------|-------------------------|-----------------------------------|
| form_id                       | UUID                    | References forms.form_id (primary key) |
| total_views                   | INTEGER                 | Total number of form views        |
| unique_views                  | INTEGER                 | Number of unique visitors         |
| total_starts                  | INTEGER                 | Number of response starts         |
| total_completions             | INTEGER                 | Number of completed submissions   |
| completion_rate               | FLOAT                   | Percentage of starts that complete |
| average_completion_time_seconds | INTEGER               | Average time to complete form     |
| bounce_rate                   | FLOAT                   | Percentage who view but don't start |
| last_updated                  | TIMESTAMP WITH TIME ZONE| When metrics were last updated    |

### 14. block_metrics

Performance metrics for individual question blocks.

| Column                | Type                    | Description                       |
|-----------------------|-------------------------|-----------------------------------|
| id                    | UUID                    | Primary key                       |
| block_id              | UUID                    | References form_blocks.id         |
| form_id               | UUID                    | References forms.form_id          |
| views                 | INTEGER                 | How many times block was viewed   |
| skips                 | INTEGER                 | Times optional questions skipped  |
| average_time_seconds  | INTEGER                 | Average time spent on block       |
| drop_off_count        | INTEGER                 | Number who abandoned at this block |
| drop_off_rate         | FLOAT                   | Percentage who abandoned at block |
| last_updated          | TIMESTAMP WITH TIME ZONE| When metrics were last updated    |

### 15. form_interactions

Granular tracking of user interactions with form elements.

| Column           | Type                    | Description                       |
|------------------|-------------------------|-----------------------------------|
| id               | UUID                    | Primary key                       |
| response_id      | UUID                    | References form_responses.id      |
| block_id         | UUID                    | References form_blocks.id         |
| interaction_type | TEXT                    | view, focus, blur, change, submit, error |
| timestamp        | TIMESTAMP WITH TIME ZONE| When interaction occurred         |
| duration_ms      | INTEGER                 | Duration of interaction (if applicable) |
| metadata         | JSONB                   | Additional context data           |

### 16. dynamic_block_analytics

Analytics specific to AI-driven conversation blocks.

| Column              | Type                    | Description                       |
|---------------------|-------------------------|-----------------------------------|
| id                  | UUID                    | Primary key                       |
| dynamic_response_id | UUID                    | References dynamic_block_responses.id |
| block_id            | UUID                    | References form_blocks.id         |
| question_index      | INTEGER                 | Position in conversation sequence |
| question_text       | TEXT                    | The question that was asked       |
| time_to_answer_seconds | INTEGER              | How long user took to answer      |
| answer_length       | INTEGER                 | Character count of answer         |
| sentiment_score     | FLOAT                   | Optional sentiment analysis       |
| topics              | JSONB                   | Optional extracted topics         |
