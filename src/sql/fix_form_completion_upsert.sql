-- This script fixes the track_form_completion function to properly handle
-- the existing row vs. new row insertion scenario

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
  v_row_exists BOOLEAN;
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
  INSERT INTO form_interactions (
    response_id,
    block_id,
    form_id,
    interaction_type,
    timestamp,
    duration_ms,
    metadata
  ) VALUES (
    p_response_id,
    NULL, -- No specific block for form completion
    p_form_id,
    'submit',
    v_timestamp,
    v_completion_time_seconds * 1000, -- Convert to milliseconds
    COALESCE(p_metadata, '{}'::jsonb) -- No longer adding form_id to metadata
  );
  
  -- Step 3: Check if the metrics row exists first
  SELECT EXISTS (
    SELECT 1 FROM form_metrics WHERE form_id = p_form_id
  ) INTO v_row_exists;
  
  -- Step 4: Update metrics in form_metrics table based on existence
  IF v_row_exists THEN
    -- Row exists, just update it
    UPDATE form_metrics
    SET
      total_completions = total_completions + 1,
      completion_rate = CASE 
                         WHEN total_starts > 0 
                         THEN (total_completions + 1)::numeric / total_starts
                         ELSE 0
                        END,
      -- Update average time as running average
      average_completion_time_seconds = CASE 
                              WHEN total_completions > 0 
                              THEN (average_completion_time_seconds * total_completions + 
                                   v_completion_time_seconds) / (total_completions + 1)
                              ELSE v_completion_time_seconds
                             END,
      last_updated = v_timestamp
    WHERE form_id = p_form_id;
  ELSE
    -- No row exists, safely insert a new one with safe values
    -- Ensure we don't violate the constraint by setting starts = completions
    INSERT INTO form_metrics (
      form_id,
      total_views,
      unique_views,
      total_starts,
      total_completions,
      completion_rate,
      average_completion_time_seconds,
      bounce_rate,
      last_updated
    )
    VALUES (
      p_form_id,
      1, -- Assume at least one view
      1, -- Assume at least one unique view
      1, -- Set starts to match completions to avoid constraint violation
      1, -- First completion
      1.0, -- 100% completion rate
      v_completion_time_seconds,
      0, -- No bounce rate data
      v_timestamp
    );
  END IF;
  
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION track_form_completion TO authenticated;
GRANT EXECUTE ON FUNCTION track_form_completion TO anon;
