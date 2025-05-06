-- This script simplifies the block tracking system to focus only on block_submit events
-- rather than tracking multiple interaction types

-- Create a new, focused RPC function for block_submit events
CREATE OR REPLACE FUNCTION track_block_submit(
  p_block_id UUID,
  p_form_id UUID,
  p_response_id UUID,
  p_duration_ms INTEGER DEFAULT NULL,
  p_visitor_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS JSONB
SECURITY DEFINER -- Run with the privileges of the function creator
SET search_path = public -- Prevent search path injection
AS $$
DECLARE
  v_submit_id UUID;
  v_timestamp TIMESTAMPTZ := NOW();
BEGIN
  -- Step 1: Insert the submit record in form_interactions
  INSERT INTO form_interactions(
    block_id,
    form_id,
    response_id,
    interaction_type, -- Still use 'submit' for compatibility with existing data
    timestamp,
    duration_ms,
    metadata
  )
  VALUES (
    p_block_id,
    p_form_id,
    p_response_id,
    'submit',
    v_timestamp,
    p_duration_ms,
    COALESCE(p_metadata, '{}'::jsonb) -- Not adding visitor_id to metadata
  )
  RETURNING id INTO v_submit_id;
  
  -- Step 2: Update metrics in block_metrics
  -- This part handles:
  -- - Average time spent on the block
  -- - Submission counts and success rates
  INSERT INTO block_metrics (
    block_id,
    form_id,
    views,
    submissions,
    success_rate,
    average_time_seconds,
    completion_rate,
    last_updated
  )
  VALUES (
    p_block_id,
    p_form_id,
    1, -- Default to 1 view
    1, -- This is a submission
    1.0, -- Default success rate
    COALESCE(p_duration_ms / 1000.0, 0), -- Convert ms to seconds
    1.0, -- Default completion rate
    v_timestamp
  )
  ON CONFLICT (block_id)
  DO UPDATE SET
    submissions = block_metrics.submissions + 1,
    -- Update time spent calculation
    average_time_seconds = CASE 
                            WHEN block_metrics.views > 0 
                            THEN ((block_metrics.average_time_seconds * block_metrics.views) + 
                                 COALESCE(p_duration_ms / 1000.0, 0)) / (block_metrics.views + 1)
                            ELSE COALESCE(p_duration_ms / 1000.0, 0)
                           END,
    -- Update success rate
    success_rate = CASE 
                    WHEN block_metrics.submissions > 0 
                    THEN (block_metrics.success_rate * block_metrics.submissions + 1.0) / 
                         (block_metrics.submissions + 1)
                    ELSE 1.0
                   END,
    -- Update completion rate (views to submissions ratio)
    completion_rate = CASE 
                      WHEN block_metrics.views > 0 
                      THEN (block_metrics.submissions + 1)::FLOAT / block_metrics.views
                      ELSE 1.0
                     END,
    last_updated = v_timestamp;
  
  -- Return success information
  RETURN jsonb_build_object(
    'success', TRUE,
    'submit_id', v_submit_id,
    'timestamp', v_timestamp
  );
EXCEPTION WHEN OTHERS THEN
  -- Return error info
  RETURN jsonb_build_object(
    'success', FALSE,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION track_block_submit TO authenticated;
GRANT EXECUTE ON FUNCTION track_block_submit TO anon;

-- Comment to explain the change in the database
COMMENT ON FUNCTION track_block_submit IS 
'Records block submit events and updates metrics. This simplified version replaces the more complex track_block_interaction function.';
