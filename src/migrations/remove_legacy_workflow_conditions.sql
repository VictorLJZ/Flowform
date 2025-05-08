-- Remove Legacy Workflow Conditions
-- This script removes the old condition-related fields from the workflow_edges table,
-- assuming the table has already been migrated to include 'rules' and 'default_target_id'.

-- Step 1: Drop the legacy constraint associated with condition_operator
ALTER TABLE workflow_edges
  DROP CONSTRAINT IF EXISTS valid_operator;

-- Step 2: Drop the legacy condition columns
ALTER TABLE workflow_edges
  DROP COLUMN IF EXISTS condition_field,
  DROP COLUMN IF EXISTS condition_operator,
  DROP COLUMN IF EXISTS condition_value;

-- Reminder: Ensure you have backed up your data if this is a production environment.
-- This operation is destructive to the data in the removed columns.

SELECT 'Legacy workflow condition fields removed successfully.' AS status;
