# FlowForm Implementation Plan

This document outlines the changes needed to fully implement FlowForm with support for both static and dynamic questions, user authentication, and comprehensive response tracking.

## Database Structure Changes

### Users & Authentication
- [ ] Implement Supabase Auth integration
- [ ] Create user profiles table (if not auto-created by Supabase)
- [ ] Set up RLS (Row Level Security) policies for data access

### Forms Table Updates
- [ ] Add user_id field (if not present)
- [ ] Ensure proper indexes for user_id
- [ ] Add RLS policies for form ownership

### Questions Table Restructuring
- [ ] Add/confirm `type` field with values:
  - `static` - Standard questions
  - `dynamic` - Dynamic starter questions
  - `dynamic_followup` - AI-generated follow-up questions
- [ ] Add/confirm `input_type` field for UI rendering
- [ ] Add/confirm `parent_question_id` for tracking dynamic question relationships
- [ ] Add/confirm `depends_on` array for conditional logic
- [ ] Fix content/question_text mismatch:
  ```sql
  -- Option 1: Migrate data to content column
  UPDATE questions 
  SET content = question_text 
  WHERE content = '' AND question_text IS NOT NULL;
  
  -- Option 2: Create trigger to sync columns
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

### Question Options Table (New)
- [ ] Create table for question options:
  ```sql
  CREATE TABLE question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    value TEXT NOT NULL,
    order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX idx_question_options_question_id ON question_options(question_id);
  ```

### Form Sessions Enhancements
- [ ] Add/confirm `respondent_id` field for authenticated respondents
- [ ] Add/confirm `completed` status field

## Code Changes

### Authentication Implementation
- [ ] Set up Supabase Auth UI components
- [ ] Create auth context/provider
- [ ] Implement protected routes
- [ ] Add user profile management
- [ ] Update API routes to use authenticated user context

### Form Builder UI
- [ ] Add question type selector (static/dynamic)
- [ ] Create UI for defining static questions
- [ ] Add input type selector (text, textarea, select, etc.)
- [ ] Implement option management for select/radio/checkbox
- [ ] Add conditional logic UI for question dependencies
- [ ] Update form settings to handle both question types

### Form Storage Service
- [ ] Update `createForm()` to handle user association
- [ ] Update `saveQuestion()` to handle different question types
- [ ] Add method for storing question options
- [ ] Add method for defining question dependencies
- [ ] Refactor question generation for dynamic questions only

### Form Rendering
- [ ] Create component system for different question types
- [ ] Implement conditional rendering based on dependencies
- [ ] Support branching flows based on answers
- [ ] Handle transitions between static and dynamic sections
- [ ] Update progress tracking for variable question paths

### Response Collection
- [ ] Update session management
- [ ] Modify answer storage for both question types
- [ ] Handle dynamic question generation only where appropriate
- [ ] Implement proper validation for different input types

### Analytics Systems
- [ ] Update embedding generation for both question types
- [ ] Adapt RAG analysis to understand static vs. dynamic
- [ ] Enhance visualization to show question type differences
- [ ] Add filtering by question type in analytics

## Testing & Validation

- [ ] Test user registration and login
- [ ] Test form creation with mixed question types
- [ ] Test conditional logic and branching
- [ ] Test dynamic question generation
- [ ] Test response collection and storage
- [ ] Test analytics with mixed question data
- [ ] Performance testing with large forms

## Deployment Considerations

- [ ] Update database migrations for production
- [ ] Set up proper environment variables
- [ ] Configure Supabase production settings
- [ ] Implement proper error handling and logging

## Implementation Order

1. **Authentication**
   - Get user management in place first
   - Test auth flow end-to-end

2. **Database Structure**
   - Apply all database changes
   - Fix existing data issues
   - Test with existing functionality

3. **Form Builder Updates**
   - Implement static question support
   - Add input type variety
   - Test form creation process

4. **Response Collection**
   - Update form rendering
   - Handle conditional logic
   - Ensure proper data storage

5. **Analytics Enhancements**
   - Update after core functionality works
   - Ensure backward compatibility

## Current Priority Fixes

1. Fix the immediate issue with `content` vs `question_text` mismatch:
   - [ ] Run data migration SQL (see above)
   - [ ] Create sync trigger (for ongoing compatibility)
   - [ ] Update code to use consistent column

2. Fix form creation error:
   - [ ] Apply database changes first
   - [ ] Test form creation process
   - [ ] Ensure proper error handling 