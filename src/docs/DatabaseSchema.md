# FlowForm-neo Database Schema

This document outlines the database schema for the FlowForm-neo application in Supabase.

## Foreign Key Cascade Behavior

The following foreign key relationships are configured with ON DELETE CASCADE, meaning that when a referenced record is deleted, all related records are automatically deleted:

- `profiles.id` → `auth.users.id`: When a user is deleted, their profile is automatically deleted
- `workspace_members.user_id` → `auth.users.id`: When a user is deleted, their workspace memberships are automatically deleted
- `workspaces.created_by` → `auth.users.id`: When a user is deleted, workspaces they created are automatically deleted
- `workspace_invitations.invited_by` → `auth.users.id`: When a user is deleted, invitations they sent are automatically deleted
- `forms.created_by` → `auth.users.id`: When a user is deleted, forms they created are automatically deleted
- `subscriptions.user_id` → `auth.users.id`: When a user is deleted, their subscription records are automatically deleted

## Workspace Management Tables

### 1. profiles

Extends the built-in Supabase auth.users table with application-specific user data.

| Column     | Type                    | Description                        |
|------------|-------------------------|------------------------------------|
| id         | UUID                    | Primary key, references auth.users.id (CASCADE) |
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
| Workspace owners and admins can update workspace | UPDATE | `created_by = auth.uid() OR EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = id AND user_id = auth.uid() AND role IN ('owner', 'admin'))` | null |
| Workspace owners and admins can delete workspace | DELETE | `created_by = auth.uid() OR EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = id AND user_id = auth.uid() AND role IN ('owner', 'admin'))` | null |

### 3. workspace_invitations

Tracks pending invitations to workspaces.

| Column      | Type                    | Description                       |
|-------------|-------------------------|-----------------------------------|
| id          | UUID                    | Primary key                       |
| workspace_id| UUID                    | References workspaces.id          |
| email       | TEXT                    | Invited user's email              |
| role        | TEXT                    | Invited role (owner, admin, editor, viewer) |
| status      | TEXT                    | Status (pending, accepted, declined, expired) |
| invited_by  | UUID                    | References auth.users.id (CASCADE) |
| invited_at  | TIMESTAMP WITH TIME ZONE| When invitation was sent          |
| expires_at  | TIMESTAMP WITH TIME ZONE| When invitation expires           |
| token       | TEXT                    | Unique token for invitation link  |

#### Row Level Security Policies

| Policy Name | Command | Using (qual) | With Check |
|-------------|---------|--------------|------------|
| Users can update their own invitations | UPDATE | `email = get_auth_email() AND status = 'pending'` | `email = get_auth_email() AND status IN ('accepted', 'declined')` |
| Users can view invitations sent to them | SELECT | `email = get_auth_email() OR is_workspace_admin(workspace_id)` | null |
| Workspace owners and admins can create invitations | INSERT | null | `is_workspace_admin(workspace_id)` |
| Workspace owners and admins can manage invitations | ALL | `is_workspace_admin(workspace_id)` | null |
| Anyone can view invitations by token | SELECT | `true` | null |

### 4. workspace_members

Stores active workspace memberships.

| Column       | Type                    | Description                      |
|--------------|-------------------------|----------------------------------|
| workspace_id | UUID                    | References workspaces.id         |
| user_id      | UUID                    | References auth.users.id (CASCADE) |
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
| description | TEXT                    | Form description (optional)       |
| slug        | TEXT                    | URL-friendly identifier (optional)|
| status      | TEXT                    | Status (draft, published, archived)|
| theme       | JSONB                   | Theme configuration (optional)    |
| settings    | JSONB                   | Form settings (optional)          |
| created_at  | TIMESTAMP WITH TIME ZONE| When form was created             |
| created_by  | UUID                    | References auth.users.id          |
| updated_at  | TIMESTAMP WITH TIME ZONE| When form was last updated        |
| published_at| TIMESTAMP WITH TIME ZONE| When form was published (nullable)|

#### Row Level Security Policies

| Policy Name | Command | Using (qual) | With Check |
|-------------|---------|--------------|------------|
| Public can view any form (for FK checks etc) | SELECT | `anon` | `true` |
| Users can update forms in their workspaces | UPDATE | `workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())` | null |
| Users can create forms in their workspaces | INSERT | null | `workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())` |
| Users can view forms in their workspaces | SELECT | `workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())` | null |

### 6. form_blocks

Stores question blocks within forms.

| Column      | Type                    | Description                       |
|-------------|-------------------------|-----------------------------------|
| id          | UUID                    | Primary key                       |
| form_id     | UUID                    | References forms.form_id          |
| type        | TEXT                    | Block type (static, dynamic, etc.)|
| subtype     | TEXT                    | Specific block type               |
| title       | TEXT                    | Question title/text               |
| description | TEXT                    | Additional instructions           |
| required    | BOOLEAN                 | Whether question is required      |
| order_index | INTEGER                 | Position in form                  |
| settings    | JSONB                   | Block-specific settings           |
| created_at  | TIMESTAMP WITH TIME ZONE| When block was created            |
| updated_at  | TIMESTAMP WITH TIME ZONE| When block was last updated       |

#### Row Level Security Policies

| Policy Name | Command | Using (qual) | With Check |
|-------------|---------|--------------|------------|
| Public can view blocks in published forms | SELECT | `form_id IN (SELECT form_id FROM forms WHERE status = 'published')` | null |
| Users can manage blocks in their forms | ALL | `form_id IN (SELECT form_id FROM forms WHERE workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()))` | null |
| Users can view blocks in their forms | SELECT | `form_id IN (SELECT form_id FROM forms WHERE workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()))` | null |

### 7. dynamic_block_configs

Stores AI configuration for dynamic blocks.

| Column         | Type                    | Description                       |
|----------------|-------------------------|-----------------------------------|
| block_id         | UUID                    | References form_blocks.id (primary key) |
| starter_question | TEXT                    | Initial question to ask           |
| temperature      | FLOAT                   | AI temperature setting (0.0-1.0)  |
| max_questions    | INTEGER                 | Maximum number of follow-up questions |
| ai_instructions  | TEXT                    | Guidelines for the AI             |
| created_at       | TIMESTAMP WITH TIME ZONE| When config was created           |
| updated_at       | TIMESTAMP WITH TIME ZONE| When config was last updated      |

#### Row Level Security Policies

| Policy Name | Command | Using (qual) | With Check |
|-------------|---------|--------------|------------|
| Users can manage dynamic block configs in their forms | ALL | `block_id IN (SELECT id FROM form_blocks WHERE form_id IN (SELECT form_id FROM forms WHERE workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())))` | null |
| Users can view dynamic block configs in their forms | SELECT | `block_id IN (SELECT id FROM form_blocks WHERE form_id IN (SELECT form_id FROM forms WHERE workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())))` | null |
| Anyone can read dynamic block configs | SELECT | `true` | null |

### 8. block_options

Stores options for multiple choice and similar blocks.

| Column      | Type                    | Description                       |
|-------------|-------------------------|-----------------------------------|
| id          | UUID                    | Primary key                       |
| block_id    | UUID                    | References form_blocks.id         |
| value       | TEXT                    | Option value (for data)           |
| label       | TEXT                    | Option label (for display)        |
| order_index | INTEGER                 | Position in options list          |
| created_at  | TIMESTAMP WITH TIME ZONE| When option was created           |

#### Row Level Security Policies

| Policy Name | Command | Using (qual) | With Check |
|-------------|---------|--------------|------------|
| Public can view options in published forms | SELECT | `block_id IN (SELECT id FROM form_blocks WHERE form_id IN (SELECT form_id FROM forms WHERE status = 'published'))` | null |

### 9. form_responses

Stores form submissions.

| Column        | Type                    | Description                       |
|---------------|-------------------------|-----------------------------------|
| id            | UUID                    | Primary key                       |
| form_id       | UUID                    | References forms.form_id          |
| form_version_id | UUID                  | References form_versions.id (nullable) |
| respondent_id | TEXT                    | Anonymous identifier for respondent |
| status        | TEXT                    | Status (in_progress, completed, abandoned) |
| started_at    | TIMESTAMP WITH TIME ZONE| When response was started         |
| completed_at  | TIMESTAMP WITH TIME ZONE| When response was completed       |
| metadata      | JSONB                   | Additional metadata               |

#### Row Level Security Policies

| Policy Name | Command | Using (qual) | With Check |
|-------------|---------|--------------|------------|
| Anyone can create responses to published forms | INSERT | null | `form_id IN (SELECT form_id FROM forms WHERE status = 'published')` |
| Respondents can update their own responses | UPDATE | `true` | null |
| Allow public form submissions | INSERT | null | `true` |
| Allow users to update their own responses | UPDATE | `true` | `true` |
| Respondents can view their own responses | SELECT | `true` | null |
| Allow form owners to view responses | SELECT | `form_id IN (SELECT form_id FROM forms WHERE created_by = auth.uid() OR workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()))` | null |
| Allow form owners to delete responses | DELETE | `form_id IN (SELECT form_id FROM forms WHERE created_by = auth.uid() OR workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')))` | null |

### 10. form_versions

Stores versioning information for forms to track changes over time.

| Column        | Type                    | Description                       |
|---------------|-------------------------|-----------------------------------|
| id            | UUID                    | Primary key                       |
| form_id       | UUID                    | References forms.form_id (ON DELETE CASCADE) |
| version_number| INTEGER                 | Sequential version number         |
| created_at    | TIMESTAMP WITH TIME ZONE| When version was created          |
| created_by    | UUID                    | References auth.users.id          |

#### Row Level Security Policies

| Policy Name | Command | Using (qual) | With Check |
|-------------|---------|--------------|------------|
| Form owners can create versions | INSERT | null | `form_id IN (SELECT forms.form_id FROM forms WHERE forms.created_by = auth.uid())` |
| Anyone with form access can view versions | SELECT | `form_id IN (SELECT forms.form_id FROM forms WHERE forms.status = 'published' OR forms.created_by = auth.uid() OR EXISTS (SELECT 1 FROM workspace_members wm JOIN forms f ON f.workspace_id = wm.workspace_id WHERE f.form_id = form_id AND wm.user_id = auth.uid()))` | null |

### 11. form_block_versions

Stores the state of form blocks at specific versions, enabling historical view of forms.

| Column        | Type                    | Description                       |
|---------------|-------------------------|-----------------------------------|
| id            | UUID                    | Primary key                       |
| block_id      | UUID                    | References form_blocks.id (ON DELETE CASCADE) |
| form_version_id| UUID                   | References form_versions.id (ON DELETE CASCADE) |
| title         | TEXT                    | Block title at this version       |
| description   | TEXT                    | Block description at this version |
| type          | TEXT                    | Block type at this version        |
| subtype       | TEXT                    | Block subtype at this version     |
| required      | BOOLEAN                 | Whether block was required        |
| order_index   | INTEGER                 | Block order in the form           |
| settings      | JSONB                   | Block settings at this version    |
| is_deleted    | BOOLEAN                 | Whether block was deleted         |
| created_at    | TIMESTAMP WITH TIME ZONE| When block version was created    |

#### Row Level Security Policies

| Policy Name | Command | Using (qual) | With Check |
|-------------|---------|--------------|------------|
| Form owners can create block versions | INSERT | null | `form_version_id IN (SELECT fv.id FROM form_versions fv JOIN forms f ON f.form_id = fv.form_id WHERE f.created_by = auth.uid())` |
| Anyone with form access can view block versions | SELECT | `form_version_id IN (SELECT fv.id FROM form_versions fv JOIN forms f ON f.form_id = fv.form_id WHERE f.status = 'published' OR f.created_by = auth.uid() OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = f.workspace_id AND wm.user_id = auth.uid()))` | null |

### 12. static_block_answers
+**Note:** A UNIQUE constraint on `(response_id, block_id)` ensures each question is answered only once per session.

Stores answers to static blocks.

| Column      | Type                    | Description                       |
|-------------|-------------------------|-----------------------------------|
| id          | UUID                    | Primary key                       |
| response_id | UUID                    | References form_responses.id      |
| block_id    | UUID                    | References form_blocks.id         |
| answer      | TEXT                    | Answer content                    |
| answered_at | TIMESTAMP WITH TIME ZONE| When question was answered        |

#### Row Level Security Policies

| Policy Name | Command | Using (qual) | With Check |
|-------------|---------|--------------|------------|
| Form owners and workspace members can view static answers | SELECT | `response_id IN (SELECT fr.id FROM form_responses fr JOIN forms f ON fr.form_id = f.form_id WHERE f.created_by = auth.uid() OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = f.workspace_id AND wm.user_id = auth.uid()))` | null |

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

#### Row Level Security Policies

| Policy Name | Command | Using (qual) | With Check |
|-------------|---------|--------------|------------|
| Form owners and workspace members can view dynamic responses | SELECT | `response_id IN (SELECT fr.id FROM form_responses fr JOIN forms f ON fr.form_id = f.form_id WHERE f.created_by = auth.uid() OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = f.workspace_id AND wm.user_id = auth.uid()))` | null |
## Analytics Tables

### 12. form_views

Tracks visitors viewing forms.

| Column      | Type                    | Description                       |
|-------------|-------------------------|-----------------------------------|
| id          | UUID                    | Primary key                       |
| form_id     | UUID                    | References forms.form_id          |
| visitor_id  | TEXT                    | Unique visitor identifier         |
| source      | TEXT                    | Traffic source (nullable)         |
| device_type | TEXT                    | Device category (nullable)        |
| browser     | TEXT                    | Browser information (nullable)    |
| timestamp   | TIMESTAMP WITH TIME ZONE| When view occurred                |
| is_unique   | BOOLEAN                 | Whether this is a unique visitor  |

#### Row Level Security Policies

| Policy Name | Command | Using (qual) | With Check |
|-------------|---------|--------------|------------|
| Anonymous users can create form views | INSERT | `authenticated, anon` | `true` |
| Workspace members can view form views | SELECT | `form_id IN (SELECT form_id FROM forms WHERE workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()))` | null |

### 13. form_metrics

Aggregated metrics for form performance.

| Column                        | Type                    | Description                       |
|-------------------------------|-------------------------|-----------------------------------|
| form_id                       | UUID                    | References forms.form_id (primary key) |
| total_views                   | INTEGER                 | Total number of form views        |
| unique_views                  | INTEGER                 | Unique visitors count             |
| total_starts                  | INTEGER                 | Number of form starts             |
| total_completions             | INTEGER                 | Number of form completions        |
| completion_rate               | FLOAT                   | Percentage of completions vs starts |
| average_completion_time_seconds | INTEGER               | Average time to complete form     |
| bounce_rate                   | FLOAT                   | Percentage of visitors who left without interacting |
| last_updated                  | TIMESTAMP WITH TIME ZONE| When metrics were last updated    |

#### Row Level Security Policies

| Policy Name | Command | Using (qual) | With Check |
|-------------|---------|--------------|------------|
| Workspace members can view form analytics | SELECT | `form_id IN (SELECT form_id FROM forms WHERE workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()))` | null |

### 14. block_metrics

Performance metrics for individual question blocks.

| Column                | Type                    | Description                       |
|-----------------------|-------------------------|-----------------------------------|
| id                    | UUID                    | Primary key                       |
| block_id              | UUID                    | References form_blocks.id         |
| form_id               | UUID                    | References forms.form_id          |
| views                 | INTEGER                 | How many times block was viewed   |
| skips                 | INTEGER                 | Times optional questions skipped  |
| average_time_seconds  | FLOAT                   | Average time spent on block       |
| drop_off_count        | INTEGER                 | Number of users who dropped off   |
| drop_off_rate         | FLOAT                   | Percentage of users who dropped off |
| last_updated          | TIMESTAMP WITH TIME ZONE| When metrics were last updated    |

#### Row Level Security Policies

| Policy Name | Command | Using (qual) | With Check |
|-------------|---------|--------------|------------|
| Workspace members can view block metrics | SELECT | `form_id IN (SELECT form_id FROM forms WHERE workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()))` | null |

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

#### Row Level Security Policies

| Policy Name | Command | Using (qual) | With Check |
|-------------|---------|--------------|------------|
| Form owners and workspace members can view interactions | SELECT | `response_id IN (SELECT fr.id FROM form_responses fr JOIN forms f ON fr.form_id = f.form_id WHERE f.created_by = auth.uid() OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = f.workspace_id AND wm.user_id = auth.uid()))` | null |
| Anonymous users can create interactions | INSERT | null | `block_id IN (SELECT id FROM form_blocks WHERE form_id IN (SELECT form_id FROM forms WHERE status = 'published'))` |

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

## Database Functions and Stored Procedures

### 1. create_form

Securely creates a new form with permission checks.

#### Function Signature
```sql
create_form(
  p_workspace_id UUID,
  p_user_id UUID,
  p_title TEXT DEFAULT 'Untitled Form',
  p_description TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'draft',
  p_settings JSONB DEFAULT NULL
) RETURNS TABLE (
  form_id UUID,
  title TEXT,
  description TEXT,
  workspace_id UUID,
  created_by UUID,
  status TEXT,
  created_at TIMESTAMPTZ
)
```

#### Key SQL Pattern
```sql
-- Pattern used to avoid ambiguous column references in RETURNING clause
WITH inserted_form AS (
  INSERT INTO forms (...) VALUES (...)
  RETURNING *
)
SELECT inf.form_id INTO v_form_id
FROM inserted_form inf;
```

#### Description
This function creates a new form while performing security checks to ensure the user has permission to create forms in the specified workspace. It combines multiple validation steps and database operations into a single transaction for improved performance. The function uses table aliases throughout to avoid ambiguous column references.

#### Parameters
| Parameter     | Type  | Description                              | Default |
|---------------|-------|------------------------------------------|----------|
| p_workspace_id| UUID  | Workspace ID where form will be created  | Required |
| p_user_id     | UUID  | User ID creating the form                | Required |
| p_title       | TEXT  | Form title                               | 'Untitled Form' |
| p_description | TEXT  | Form description                         | NULL |
| p_status      | TEXT  | Form status (draft, published, archived) | 'draft' |
| p_settings    | JSONB | Form settings                            | NULL |

#### Returns
Table containing the created form data.

#### Error Codes
| Code  | Description                                |
|-------|--------------------------------------------|  
| P0001 | User or workspace does not exist           |
| P0002 | User is not a member of the workspace      |

#### Implementation Notes
- Executes with SECURITY DEFINER privileges (runs as function owner)
- Permission to execute is granted to authenticated users
- Uses table aliases (e.g., `wm` for workspace_members, `f` for forms) in all queries to prevent ambiguous column references
- All columns are fully qualified (e.g., `wm.workspace_id` instead of just `workspace_id`)
- Uses a Common Table Expression (CTE) for the INSERT with proper aliasing to avoid ambiguity in the RETURNING clause
- Handles the PostgreSQL limitation where aliases can't be used in the `INSERT INTO` clause itself
- Search path is explicitly set to public for additional security

## Database Functions

Database functions are server-side procedures that run directly in the Supabase PostgreSQL database. They provide a way to execute complex operations in a single request while maintaining data integrity.

### save_form_with_blocks

**Purpose:** Save a complete form with all its blocks in a single database transaction

**What is RPC?** RPC (Remote Procedure Call) is a technique that allows your frontend code to call functions that run on the server. Think of it like making a phone call to ask someone to do multiple tasks for you, rather than sending separate text messages for each task.

**Why Use This Approach?**
1. **Data Consistency**: All operations succeed or fail together, preventing partial saves
2. **Performance**: Reduces network round-trips by handling all operations server-side
3. **Complexity Management**: Complex logic stays in the database where it's most efficient

**Parameters:**
- `p_form_data` (JSONB): Form metadata including title, description, settings, etc.
- `p_blocks_data` (JSONB): Array of form blocks with their configurations

**Returns:** JSONB object containing:
- `form`: The saved form data
- `blocks`: Array of saved blocks
- `success`: Boolean indicating success

**Behavior:**
- For new forms: Creates form record and all associated blocks
- For existing forms: Updates form data and synchronizes blocks by:
  - Adding new blocks
  - Updating existing blocks
  - Removing blocks no longer present in the frontend
- For dynamic blocks: Manages configurations in the dynamic_block_configs table

**Example Usage:**
```typescript
const { data, error } = await supabase.rpc('save_form_with_blocks', {
  p_form_data: formData,
  p_blocks_data: blocksData
});
```

### save_form_with_blocks_with_workspace

**Purpose:** Wrapper function that ensures workspace_id is properly preserved when saving forms

**Problem it Solves:** When workspace_id is embedded in JSON data, PostgreSQL may sometimes nullify it during processing. This function explicitly preserves workspace_id to prevent constraint violations.

**Parameters:**
- `p_form_data` (JSONB): Form metadata including title, description, settings, etc.
- `p_blocks_data` (JSONB): Array of form blocks with their configurations
- `p_workspace_id` (UUID): Explicit workspace_id parameter that gets merged into form data

**Returns:** JSONB object containing:
- Same structure as save_form_with_blocks

**Implementation:**
```sql
CREATE OR REPLACE FUNCTION public.save_form_with_blocks_with_workspace(
  p_form_data JSONB,
  p_blocks_data JSONB,
  p_workspace_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_modified_form_data JSONB;
  v_result JSONB;
BEGIN
  -- Explicitly cast the workspace_id as UUID and merge it into form data
  v_modified_form_data = p_form_data || jsonb_build_object('workspace_id', p_workspace_id::UUID);
  
  -- Call the original function with the modified form data
  SELECT public.save_form_with_blocks(v_modified_form_data, p_blocks_data) INTO v_result;
  
  RETURN v_result;
END;
$$;
```

**Example Usage:**
```typescript
const { data, error } = await supabase.rpc('save_form_with_blocks_with_workspace', {
  p_form_data: formData,
  p_blocks_data: blocksData,
  p_workspace_id: formData.workspace_id
});
```

### save_form_with_blocks_typed

**Purpose:** Type-safe function for saving forms with blocks that eliminates JSON parsing issues by using explicit types

**Problem it Solves:** Provides strict type checking and prevents data loss during PostgreSQL JSONB processing by using native PostgreSQL types for all critical fields.

**Parameters:**
- `p_form_id` (UUID): Primary key for the form
- `p_title` (TEXT): Form title
- `p_description` (TEXT): Form description
- `p_workspace_id` (UUID): Explicit workspace ID to prevent constraint violations
- `p_created_by` (UUID): User ID of form creator
- `p_status` (TEXT): Form status (draft, published, archived)
- `p_theme` (JSONB): Form theme configuration
- `p_settings` (JSONB): Form settings
- `p_blocks_data` (JSONB): Array of form blocks with their configurations

**Returns:** JSONB object containing:
- Same structure as save_form_with_blocks

**Implementation:**
```sql
CREATE OR REPLACE FUNCTION public.save_form_with_blocks_typed(
  p_form_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_workspace_id UUID,
  p_created_by UUID,
  p_status TEXT,
  p_theme JSONB,
  p_settings JSONB,
  p_blocks_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_form_data JSONB;
  v_result JSONB;
BEGIN
  -- Build the form data with explicitly typed fields
  v_form_data = jsonb_build_object(
    'id', p_form_id,
    'title', p_title,
    'description', p_description,
    'workspace_id', p_workspace_id,
    'created_by', p_created_by,
    'status', p_status,
    'theme', p_theme,
    'settings', p_settings
  );
  
  -- Call the original function with properly typed data
  SELECT public.save_form_with_blocks(v_form_data, p_blocks_data) INTO v_result;
  
  RETURN v_result;
END;
$$;
```

**Example Usage:**
```typescript
const { data, error } = await supabase.rpc('save_form_with_blocks_typed', {
  p_form_id: formData.id,
  p_title: formData.title,
  p_description: formData.description,
  p_workspace_id: formData.workspace_id,  // explicitly typed as UUID
  p_created_by: formData.created_by,
  p_status: formData.status,
  p_theme: formData.theme,
  p_settings: formData.settings,
  p_blocks_data: blocksData
});
```

### save_form_with_blocks_empty_safe

**Purpose:** Robust form saving function that properly handles empty blocks arrays, prevents array dimension parsing errors, and correctly casts block IDs to UUID type.

**Problem it Solves:** 
1. Eliminates the PostgreSQL array dimension parsing error with empty JSONB arrays
2. Resolves UUID type casting issues between frontend and database
3. Provides safe fallback for invalid UUID formats by auto-generating valid ones

**Parameters:**
- `p_form_data` (JSONB): Form metadata including id, title, description, workspace_id, etc.
- `p_blocks_data` (JSONB): Array of form blocks with their configurations

**Returns:** JSONB object containing:
- `form`: The saved form data
- `blocks`: Array of saved blocks
- `success`: Boolean indicating operation success

**Implementation:**
```sql
CREATE OR REPLACE FUNCTION public.save_form_with_blocks_empty_safe(
  p_form_data jsonb,
  p_blocks_data jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_form_id uuid;
  v_form_record record;
  v_block_record record;
  v_block_id uuid; -- Changed from text to uuid for proper type handling
  v_block_index integer;
  v_block jsonb;
  v_form jsonb;
  v_blocks jsonb[];
  v_result jsonb;
  v_form_created boolean := false;
BEGIN
  -- Extract form_id from form data (use id from input but form_id in database)
  v_form_id := (p_form_data->>'id')::uuid;
  
  -- FORM HANDLING
  -- Check if the form exists
  SELECT * INTO v_form_record FROM forms WHERE form_id = v_form_id;
  
  IF NOT FOUND THEN
    -- Create new form
    INSERT INTO forms (
      form_id, title, description, workspace_id, created_by, status, theme, settings
    ) VALUES (
      (p_form_data->>'id')::uuid,
      p_form_data->>'title',
      p_form_data->>'description',
      (p_form_data->>'workspace_id')::uuid,
      (p_form_data->>'created_by')::uuid,
      p_form_data->>'status',
      p_form_data->'theme',
      p_form_data->'settings'
    )
    RETURNING * INTO v_form_record;
    
    v_form_created := true;
  ELSE
    -- Update existing form
    UPDATE forms SET
      title = p_form_data->>'title',
      description = p_form_data->>'description',
      workspace_id = (p_form_data->>'workspace_id')::uuid,
      status = p_form_data->>'status',
      theme = p_form_data->'theme',
      settings = p_form_data->'settings',
      updated_at = NOW()
    WHERE form_id = v_form_id
    RETURNING * INTO v_form_record;
  END IF;
  
  -- Build the form JSON for response
  v_form := jsonb_build_object(
    'form_id', v_form_record.form_id,  -- Use form_id, not id
    'title', v_form_record.title,
    'description', v_form_record.description,
    'workspace_id', v_form_record.workspace_id,
    'created_by', v_form_record.created_by,
    'status', v_form_record.status,
    'theme', v_form_record.theme,
    'settings', v_form_record.settings,
    'created_at', v_form_record.created_at,
    'updated_at', v_form_record.updated_at
  );
  
  -- BLOCKS HANDLING
  -- Delete existing blocks if this is an update
  IF NOT v_form_created THEN
    DELETE FROM form_blocks WHERE form_id = v_form_id;
  END IF;
  
  -- Initialize blocks array for response
  v_blocks := ARRAY[]::jsonb[];
  
  -- CRITICAL IMPROVEMENT: Properly handle empty blocks array
  -- Only process blocks if there are any
  IF p_blocks_data IS NOT NULL AND jsonb_array_length(p_blocks_data) > 0 THEN
    -- Process each block
    FOR v_block_index IN 0..jsonb_array_length(p_blocks_data) - 1 LOOP
      v_block := p_blocks_data->v_block_index;
      
      BEGIN
        -- CRITICAL FIX: Attempt to cast the ID directly to UUID with error handling
        v_block_id := (v_block->>'id')::uuid;
      EXCEPTION WHEN OTHERS THEN
        -- If casting fails, generate a new UUID
        v_block_id := uuid_generate_v4();
        RAISE NOTICE 'Failed to cast block ID to UUID, generated new ID: %', v_block_id;
      END;
      
      -- Insert block with properly typed UUID
      INSERT INTO form_blocks (
        id, form_id, type, subtype, title, description, required, order_index, settings
      ) VALUES (
        v_block_id, -- Now a properly typed UUID
        v_form_id,
        v_block->>'type',
        v_block->>'subtype',
        v_block->>'title',
        v_block->>'description',
        (v_block->>'required')::boolean,
        (v_block->>'order_index')::integer,
        v_block->'settings'
      )
      RETURNING * INTO v_block_record;
      
      -- Add block to response array
      v_blocks := v_blocks || jsonb_build_object(
        'id', v_block_record.id,
        'form_id', v_block_record.form_id,
        'type', v_block_record.type,
        'subtype', v_block_record.subtype,
        'title', v_block_record.title,
        'description', v_block_record.description,
        'required', v_block_record.required,
        'order_index', v_block_record.order_index,
        'settings', v_block_record.settings,
        'created_at', v_block_record.created_at,
        'updated_at', v_block_record.updated_at
      );
    END LOOP;
  END IF;
  
  -- Build the final result
  v_result := jsonb_build_object(
    'form', v_form,
    'blocks', to_jsonb(v_blocks),
    'success', true
  );
  
  RETURN v_result;
EXCEPTION WHEN OTHERS THEN
  -- Handle errors
  RAISE NOTICE 'Error in save_form_with_blocks_empty_safe: %', SQLERRM;
  
  -- Return error result
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'error_detail', SQLSTATE
  );
END;
$$;
```

**Example Usage:**
```typescript
// Direct object passing (preferred method)
const { data, error } = await supabase.rpc('save_form_with_blocks_empty_safe', {
  p_form_data: {
    id: formData.id,
    title: formData.title,
    description: formData.description,
    workspace_id: formData.workspace_id,
    created_by: formData.created_by,
    status: formData.status,
    theme: formData.theme,
    settings: formData.settings
  },
  p_blocks_data: blocks.map(block => ({
    // Blocks will have their IDs properly converted to UUIDs in PostgreSQL
    id: block.id, // Can be any format, function handles conversion
    type: block.type,
    subtype: block.subtype,
    title: block.title || '',
    description: block.description || null,
    required: !!block.required,
    order_index: block.order || 0,
    settings: block.settings || {}
  }))
});
```

**Architectural Benefits:**
- Eliminates array dimension parsing errors with empty arrays
- Resolves UUID type casting issues between frontend and database
- Provides automatic UUID generation for invalid ID formats
- Properly handles type conversion for all form and block fields
- Offers graceful error handling with detailed error messages
- Ensures database constraint satisfaction through proper typing

**Diagnostic Flow:**
When the form saving process is executed, the following diagnostic flow is observed:

```
// Form data preparation
Save Data being prepared: {
  id: 'd86e3353-0087-43a8-a1cb-17b0a399424d', 
  title: 'Untitled Form', 
  description: '', 
  workspace_id: 'f9f45bf0-4835-4947-87df-df8c42da7410', 
  created_by: '226d4bff-1c02-4c9f-9fec-f574cfe8a333',
  ...
}

// Blocks preparation
Blocks to save: [{...}]
FormBuilder Block 0 settings: {
  placeholder: 'Type your answer here...', 
  maxLength: 255
}

// Critical field preservation
Form data prepared with critical fields:
- workspace_id: f9f45bf0-4835-4947-87df-df8c42da7410
- id: d86e3353-0087-43a8-a1cb-17b0a399424d

// Block processing
Prepared 1 blocks for saving
Executing type-safe PostgreSQL RPC...
🔎 DIAGNOSTICS: Blocks array length: 1
```

This diagnostic flow confirms that the function correctly processes both form metadata and block data, preserving critical field types throughout the process.

## Subscription Management Tables

### 16. subscriptions

Stores user subscription information.

| Column           | Type                    | Description                       |
|------------------|-------------------------|-----------------------------------|
| id               | UUID                    | Primary key                       |
| user_id          | UUID                    | References auth.users.id (CASCADE) |
| workspace_id     | UUID                    | References workspaces.id          |
| status           | TEXT                    | Status (active, canceled, past_due, trialing, incomplete, incomplete_expired) |
| plan             | TEXT                    | Plan type (free, pro, business)   |
| price_id         | TEXT                    | Stripe price ID                   |
| subscription_id  | TEXT                    | Stripe subscription ID            |
| customer_id      | TEXT                    | Stripe customer ID                |
| current_period_start | TIMESTAMP WITH TIME ZONE | Current billing period start  |
| current_period_end   | TIMESTAMP WITH TIME ZONE | Current billing period end    |
| cancel_at_period_end | BOOLEAN                 | Whether subscription ends at period end |
| created_at       | TIMESTAMP WITH TIME ZONE| When subscription was created     |
| updated_at       | TIMESTAMP WITH TIME ZONE| When subscription was last updated|
| metadata         | JSONB                   | Additional subscription metadata  |

#### Row Level Security Policies

| Policy Name | Command | Using (qual) | With Check |
|-------------|---------|--------------|------------|
| Users can view their own subscriptions | SELECT | `user_id = auth.uid()` | null |
| Users can view subscriptions for their workspaces | SELECT | `workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())` | null |
| Only service role can insert/update subscriptions | INSERT | null | `auth.uid() = '00000000-0000-0000-0000-000000000000'::uuid` |
| Only service role can update subscriptions | UPDATE | `auth.uid() = '00000000-0000-0000-0000-000000000000'::uuid` | null |

### 17. payment_events

Tracks Stripe webhook events.

| Column      | Type                    | Description                       |
|-------------|-------------------------|-----------------------------------|
| id          | UUID                    | Primary key                       |
| event_id    | TEXT                    | Stripe event ID                   |
| event_type  | TEXT                    | Stripe event type                 |
| event_data  | JSONB                   | Full event payload                |
| processed   | BOOLEAN                 | Whether event has been processed  |
| created_at  | TIMESTAMP WITH TIME ZONE| When event was received           |
| processed_at| TIMESTAMP WITH TIME ZONE| When event was processed          |

#### Row Level Security Policies

| Policy Name | Command | Using (qual) | With Check |
|-------------|---------|--------------|------------|
| Only service role can access payment events | ALL | `auth.uid() = '00000000-0000-0000-0000-000000000000'::uuid` | null |
