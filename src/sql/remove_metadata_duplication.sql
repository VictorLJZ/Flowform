-- This script updates the RPC functions to stop duplicating form_id and response_id in the metadata
-- Since these values are already stored in dedicated columns, there's no need to repeat them in the JSONB metadata

-- 1. Update track_form_completion function
CREATE OR REPLACE FUNCTION track_form_completion(
  p_form_id UUID,
  p_response_id UUID,
  p_total_time_seconds INTEGER DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS JSONB
SECURITY DEFINER -- Run with the privileges of the function creator
SET search_path = public -- Prevent search path injection
AS $$
DECLARE
  v_timestamp TIMESTAMPTZ := NOW();
  v_started_at TIMESTAMPTZ;
  v_completion_time_seconds INTEGER;
BEGIN
  -- Get the started_at timestamp for the response
  SELECT started_at INTO v_started_at
  FROM form_responses
  WHERE id = p_response_id;
  
  -- If no started_at, use a default
  IF v_started_at IS NULL THEN
    v_started_at := v_timestamp - INTERVAL '1 minute';
  END IF;
  
  -- Calculate completion time if not provided
  IF p_total_time_seconds IS NULL THEN
    v_completion_time_seconds := EXTRACT(EPOCH FROM (v_timestamp - v_started_at));
  ELSE
    v_completion_time_seconds := p_total_time_seconds;
  END IF;
  
  -- Step 1: Update the response status to completed
  UPDATE form_responses
  SET
    status = 'completed',
    completed_at = v_timestamp,
    metadata = COALESCE(metadata, '{}'::jsonb) || 
               jsonb_build_object('total_time_seconds', v_completion_time_seconds) || 
               COALESCE(p_metadata, '{}'::jsonb)
  WHERE id = p_response_id;
  
  -- Check if we updated a row
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Response ID % not found', p_response_id;
  END IF;
  
  -- Step 2: Create a form interaction record for the completion
  -- CHANGED: Removed form_id from metadata since it's already in a dedicated column
  INSERT INTO form_interactions (
    response_id,
    block_id,
    form_id, -- Explicitly include form_id as a column
    interaction_type,
    timestamp,
    duration_ms,
    metadata
  ) VALUES (
    p_response_id,
    NULL, -- No specific block for form completion
    p_form_id, -- Explicitly provide form_id as a column value
    'submit',
    v_timestamp,
    v_completion_time_seconds * 1000, -- Convert to milliseconds
    COALESCE(p_metadata, '{}'::jsonb) -- CHANGED: No longer adding form_id to metadata
  );
  
  -- Step 3: Update metrics in form_metrics table
  INSERT INTO form_metrics (
    form_id,
    views,
    starts,
    completions,
    completion_rate,
    average_time_seconds,
    last_updated
  )
  VALUES (
    p_form_id,
    0, -- No change to views
    0, -- No change to starts
    1, -- Increment completions by 1
    0, -- Will calculate completion rate in the UPDATE
    v_completion_time_seconds,
    v_timestamp
  )
  ON CONFLICT (form_id) 
  DO UPDATE SET 
    completions = form_metrics.completions + 1,
    completion_rate = CASE 
                       WHEN form_metrics.starts > 0 
                       THEN (form_metrics.completions + 1)::numeric / form_metrics.starts
                       ELSE 0
                      END,
    -- Update average time as running average
    average_time_seconds = CASE 
                            WHEN form_metrics.completions > 0 
                            THEN (form_metrics.average_time_seconds * form_metrics.completions + v_completion_time_seconds) / (form_metrics.completions + 1)
                            ELSE v_completion_time_seconds
                           END,
    last_updated = v_timestamp;
  
  -- Return success with completion details
  RETURN jsonb_build_object(
    'success', true,
    'response_id', p_response_id,
    'form_id', p_form_id,
    'completed_at', v_timestamp,
    'total_time_seconds', v_completion_time_seconds
  );
  
EXCEPTION WHEN OTHERS THEN
  -- Return error information
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'error_detail', SQLSTATE
  );
END;
$$ LANGUAGE plpgsql;

-- 2. Update track_block_interaction function
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
  -- CHANGED: Only adding visitor_id to metadata, not form_id
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
    jsonb_build_object('visitor_id', p_visitor_id) || COALESCE(p_metadata, '{}'::jsonb) -- CHANGED: Removed form_id
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

-- 3. Update track_block_view function (if needed)
CREATE OR REPLACE FUNCTION track_block_view(
  p_block_id UUID,
  p_form_id UUID,
  p_response_id UUID DEFAULT NULL,
  p_visitor_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS JSONB
SECURITY DEFINER -- Run with the privileges of the function creator
SET search_path = public -- Prevent search path injection
AS $$
DECLARE
  v_view_id UUID;
  v_timestamp TIMESTAMPTZ := NOW();
BEGIN
  -- Step 1: Insert the block view as an interaction with type 'view'
  -- The metadata already doesn't include form_id, but we're updating for consistency
  INSERT INTO form_interactions(
    block_id,
    form_id,
    response_id,
    interaction_type,
    timestamp,
    metadata
  )
  VALUES (
    p_block_id,
    p_form_id,
    p_response_id,
    'view', -- Interaction type for views
    v_timestamp,
    jsonb_build_object('visitor_id', p_visitor_id) || COALESCE(p_metadata, '{}'::jsonb)
  )
  RETURNING id INTO v_view_id;
  
  -- Step 2: Update metrics in block_metrics table
  INSERT INTO block_metrics (
    block_id,
    form_id,
    views,
    skips,
    average_time_seconds,
    drop_off_count,
    drop_off_rate,
    last_updated
  )
  VALUES (
    p_block_id,
    p_form_id,
    1, -- Initial view count
    0, -- Initial skip count
    0, -- Initial avg time
    0, -- Initial drop-off count
    0, -- Initial drop-off rate
    v_timestamp
  )
  ON CONFLICT (block_id) 
  DO UPDATE SET 
    views = block_metrics.views + 1,
    last_updated = v_timestamp;
  
  -- Return success with view ID
  RETURN jsonb_build_object(
    'success', true,
    'view_id', v_view_id,
    'timestamp', v_timestamp
  );
  
EXCEPTION WHEN OTHERS THEN
  -- Return error information
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'error_detail', SQLSTATE
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION track_form_completion TO authenticated;
GRANT EXECUTE ON FUNCTION track_block_interaction TO authenticated;
GRANT EXECUTE ON FUNCTION track_block_view TO authenticated;
GRANT EXECUTE ON FUNCTION track_block_interaction TO anon;
GRANT EXECUTE ON FUNCTION track_block_view TO anon;
