-- Workflow Edge Enhancement Migration
-- This migration alters the workflow_edges table to support multiple rules per connection
-- with complex logical operations

-- Step 1: Add the new rules JSONB column to store complex rule structures
ALTER TABLE workflow_edges 
  ADD COLUMN rules JSONB DEFAULT '[]'::jsonb;

-- Step 2: Rename target_block_id to default_target_id to make its purpose clearer
-- We'll use a two-step approach to avoid constraints issues
ALTER TABLE workflow_edges
  ADD COLUMN default_target_id UUID REFERENCES form_blocks(id) ON DELETE CASCADE;

-- Copy existing values
UPDATE workflow_edges
  SET default_target_id = target_block_id;

-- Ensure default_target_id is not null
ALTER TABLE workflow_edges
  ALTER COLUMN default_target_id SET NOT NULL;

-- Drop original column after data migration
ALTER TABLE workflow_edges
  DROP COLUMN target_block_id;

-- Step 3: Update indexes that referenced the old column
DROP INDEX IF EXISTS idx_workflow_edges_target_block;
CREATE INDEX idx_workflow_edges_default_target ON workflow_edges(default_target_id);

-- Step 4: Remove legacy condition-related columns and constraints
ALTER TABLE workflow_edges 
  DROP CONSTRAINT IF EXISTS valid_operator;

ALTER TABLE workflow_edges
  DROP COLUMN IF EXISTS condition_field,
  DROP COLUMN IF EXISTS condition_operator,
  DROP COLUMN IF EXISTS condition_value;
