-- This script removes the legacy block interaction tracking system
-- since it's been replaced by the more focused block_submit tracking

-- Step 1: Remove the legacy track_block_interaction function
DROP FUNCTION IF EXISTS track_block_interaction;

-- Step 2: Add a comment to the form_interactions table to indicate that
-- only 'view' and 'submit' interaction_types are used going forward
COMMENT ON COLUMN form_interactions.interaction_type IS 
  'The type of interaction. Valid values: view, submit. Legacy values (now deprecated): focus, blur, change, error';

-- No need to modify the existing data - we'll keep it for historical continuity
-- but new events will only use the simplified approach
