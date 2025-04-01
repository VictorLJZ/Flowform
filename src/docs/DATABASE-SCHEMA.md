# FlowForm Database Schema

This document outlines the database schema used in the FlowForm application. The schema is implemented in Supabase (PostgreSQL).

## Tables Overview

The database consists of the following tables:

1. `forms` - Stores form configurations
2. `questions` - Stores questions for each form
3. `answers` - Stores answers to questions
4. `form_sessions` - Tracks user sessions for form completion
5. `form_qa_embeddings` - Stores vector embeddings for Q&A pairs
6. `form_session_embeddings` - Stores vector embeddings for sessions

## Table Details

### forms

Stores form configurations and metadata.

**Columns (based on code):**
- `id` (string, primary key) - Unique identifier for the form
- `title` (string) - Form title
- `description` (string, nullable) - Form description
- `instructions` (string) - Instructions for AI question generation
- `max_questions` (integer) - Maximum number of questions in the form
- `temperature` (float) - AI temperature setting for question generation
- `created_at` (timestamp) - Creation timestamp
- `updated_at` (timestamp) - Last update timestamp
- `user_id` (string, nullable) - User who created the form
- `status` (enum: 'draft', 'active', 'archived') - Form status

**Indexes:**
- `forms_pkey` - Primary key on `id` column

### questions

Stores questions for each form.

**Columns (actual database):**
- `id` (text, primary key, NOT NULL) - Unique identifier for the question
- `form_id` (text, foreign key, NOT NULL) - Reference to the form
- `type` (text, NOT NULL) - Type of question
- `order` (integer, NOT NULL) - Order/position of the question in the form
- `question_text` (text, NULL) - The actual text of the question
- `input_type` (text, NULL) - Type of input for the question
- `prompt` (text, NULL) - Additional prompt for the question
- `depends_on` (array, NULL) - Dependencies on other questions
- `created_at` (timestamp with time zone, NULL, default: CURRENT_TIMESTAMP) - Creation timestamp
- `updated_at` (timestamp with time zone, NULL, default: CURRENT_TIMESTAMP) - Last update timestamp
- `content` (text, NOT NULL, default: '') - Empty column, likely added later to match code expectations

**The code expects:**
- `content` (string) - Question text
- `is_starter` (boolean) - Flag indicating if this is the first question

**Indexes:**
- `questions_pkey` - Primary key on `id` column
- `idx_questions_form_id` - Index on `form_id` for faster lookups
- `idx_questions_order` - Index on `order` for sorting

**Foreign Keys:**
- `questions_form_id_fkey` - Links `form_id` to `forms.id`

### answers

Stores answers to questions.

**Columns (based on code):**
- `id` (string, primary key) - Unique identifier for the answer
- `form_id` (string, foreign key) - Reference to the form
- `question_id` (string, foreign key) - Reference to the question
- `content` (string) - Answer text
- `created_at` (timestamp) - Creation timestamp
- `session_id` (string, foreign key) - Reference to the form session

**Indexes:**
- `answers_pkey` - Primary key on `id` column
- `idx_answers_question_id` - Index on `question_id` for faster lookups

### form_sessions

Tracks user sessions for form completion.

**Columns (based on code):**
- `id` (string, primary key) - Unique identifier for the session
- `form_id` (string, foreign key) - Reference to the form
- `current_question_index` (integer) - Index of the current question
- `created_at` (timestamp) - Creation timestamp
- `updated_at` (timestamp) - Last update timestamp
- `completed` (boolean) - Flag indicating if the form is completed
- `user_id` (string, nullable) - User who started the session

**Indexes:**
- `form_sessions_pkey` - Primary key on `id` column
- `idx_form_sessions_form_id` - Index on `form_id` for faster lookups

### form_qa_embeddings

Stores vector embeddings for Q&A pairs for RAG analytics.

**Indexes:**
- `form_qa_embeddings_pkey` - Primary key on `id` column
- `idx_form_qa_embeddings_form_id` - Index on `form_id` for faster lookups

### form_session_embeddings

Stores vector embeddings for complete sessions for RAG analytics.

**Indexes:**
- `form_session_embeddings_pkey` - Primary key on `id` column
- `idx_form_session_embeddings_form_id` - Index on `form_id` for faster lookups

## Relationships

Based on the index patterns, field names, and confirmed foreign key constraints:

1. `forms` ← one-to-many → `questions`
   - A form has many questions
   - Confirmed by foreign key constraint: `questions_form_id_fkey`

2. `forms` ← one-to-many → `form_sessions`
   - A form has many sessions

3. `questions` ← one-to-many → `answers`
   - A question has many answers

4. `form_sessions` ← one-to-many → `answers`
   - A session contains many answers

5. `forms` ← one-to-many → `form_qa_embeddings`
   - A form has many Q&A embeddings

6. `forms` ← one-to-many → `form_session_embeddings`
   - A form has many session embeddings

## Error Diagnosis

The error "Could not find the 'content' column of 'questions' in the schema cache" indicates that:

1. The code expects a column named `content` in the `questions` table to store the question text.
2. The `content` column exists in the table but appears to be empty (default: '').
3. The actual question text is likely stored in the `question_text` column.

**Possible solutions:**

1. **Data migration approach:** Migrate data from `question_text` to `content` column:
   ```sql
   UPDATE questions 
   SET content = question_text 
   WHERE content = '' AND question_text IS NOT NULL;
   ```

2. **Database trigger approach:** Create a trigger to keep both columns in sync:
   ```sql
   CREATE OR REPLACE FUNCTION sync_question_columns()
   RETURNS TRIGGER AS $$
   BEGIN
     IF NEW.question_text IS NOT NULL AND NEW.content = '' THEN
       NEW.content := NEW.question_text;
     ELSIF NEW.content IS NOT NULL AND NEW.content != '' AND NEW.question_text IS NULL THEN
       NEW.question_text := NEW.content;
     END IF;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER sync_questions
   BEFORE INSERT OR UPDATE ON questions
   FOR EACH ROW
   EXECUTE FUNCTION sync_question_columns();
   ```

3. **Code update approach:** Update the application code to use `question_text` instead of `content`. 