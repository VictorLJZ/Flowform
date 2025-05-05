-- Recreate the track_block_interaction RPC function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION track_block_interaction(
  p_block_id UUID,
  p_form_id UUID,
  p_interaction_type TEXT,
  p_response_id UUID DEFAULT NULL,
  p_duration_ms INTEGER DEFAULT NULL,
  p_visitor_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS JSONB
SECURITY DEFINER -- Run with the privileges of the function creator
SET search_path = public -- Prevent search path injection
AS $$
DECLARE
  v_interaction_id UUID;
  v_timestamp TIMESTAMPTZ := NOW();
BEGIN
  -- Step 1: Insert the interaction record
  INSERT INTO form_interactions(
    block_id,
    form_id,
    response_id,
    interaction_type,
    timestamp,
    duration_ms,
    metadata
  )
  VALUES (
    p_block_id,
    p_form_id,
    p_response_id,
    p_interaction_type,
    v_timestamp,
    p_duration_ms,
    jsonb_build_object('visitor_id', p_visitor_id) || COALESCE(p_metadata, '{}'::jsonb)
  )
  RETURNING id INTO v_interaction_id;
  
  -- Step 2: Update metrics based on interaction type if needed
  IF p_interaction_type = 'submit' AND p_duration_ms IS NOT NULL THEN
    -- Update time spent in block_metrics table
    UPDATE block_metrics
    SET
      average_time_seconds = CASE 
                             WHEN views > 0 
                             THEN ((average_time_seconds * views) + (p_duration_ms / 1000.0)) / (views + 1)
                             ELSE (p_duration_ms / 1000.0)
                           END,
      last_updated = v_timestamp
    WHERE block_id = p_block_id;
  END IF;
  
  -- Return success info
  RETURN jsonb_build_object(
    'success', TRUE,
    'interaction_id', v_interaction_id,
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
GRANT EXECUTE ON FUNCTION track_block_interaction TO authenticated;

-- Also grant to anon users to allow non-authenticated users to track interactions
GRANT EXECUTE ON FUNCTION track_block_interaction TO anon;
