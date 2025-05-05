# FlowForm Analytics RPC Functions

This document outlines the RPC (Remote Procedure Call) functions implemented to track analytics data in FlowForm. These functions replace the previous trigger-based implementation to ensure better data integrity and consistency.

## Analytics RPC Architecture

The analytics system uses a set of stored procedures (RPC functions) to handle all analytics tracking operations:

1. **Form View Tracking**: Records when users view a form
2. **Form Start Tracking**: Records when users begin filling out a form
3. **Form Completion Tracking**: Records when users complete a form
4. **Block View Tracking**: Records when users view individual blocks
5. **Block Interaction Tracking**: Records when users interact with specific blocks

These RPCs handle all necessary database operations in single transactions, ensuring data consistency and proper metric calculations.

## RPC Function Definitions

### 1. track_form_view

Records a form view and updates form metrics.

```sql
CREATE OR REPLACE FUNCTION track_form_view(
  p_form_id UUID,
  p_visitor_id TEXT,
  p_is_unique BOOLEAN DEFAULT FALSE,
  p_device_type TEXT DEFAULT NULL,
  p_browser TEXT DEFAULT NULL,
  p_source TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_view_id UUID;
  v_timestamp TIMESTAMPTZ := NOW();
BEGIN
  -- Step 1: Insert the form view record
  INSERT INTO form_views(
    form_id, 
    visitor_id, 
    is_unique, 
    device_type, 
    browser, 
    source, 
    timestamp
  )
  VALUES (
    p_form_id, 
    p_visitor_id, 
    p_is_unique, 
    p_device_type, 
    p_browser, 
    p_source, 
    v_timestamp
  )
  RETURNING id INTO v_view_id;
  
  -- Step 2: Update metrics in form_metrics table
  INSERT INTO form_metrics (
    form_id, 
    total_views, 
    unique_views,
    total_starts,
    total_completions,
    completion_rate,
    bounce_rate,
    last_updated
  )
  VALUES (
    p_form_id, 
    1, 
    CASE WHEN p_is_unique THEN 1 ELSE 0 END,
    0, -- Initial total_starts
    0, -- Initial total_completions
    0, -- Initial completion_rate
    1, -- Initial bounce_rate (assume 100% bounce until interaction)
    v_timestamp
  )
  ON CONFLICT (form_id) 
  DO UPDATE SET 
    total_views = form_metrics.total_views + 1,
    unique_views = form_metrics.unique_views + CASE WHEN p_is_unique THEN 1 ELSE 0 END,
    -- Calculate bounce rate: (views without interactions) / total views
    bounce_rate = CASE 
      WHEN form_metrics.total_views + 1 > 0 THEN 
        LEAST(1.0, GREATEST(0.0, 
          ((form_metrics.total_views + 1) - form_metrics.total_starts)::FLOAT / (form_metrics.total_views + 1)
        ))
      ELSE 0
    END,
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Parameters:**
- `p_form_id`: UUID of the form being viewed
- `p_visitor_id`: Unique identifier for the visitor
- `p_is_unique`: Whether this is a unique view (default: false)
- `p_device_type`: Device type (desktop, mobile, tablet)
- `p_browser`: Browser information
- `p_source`: Referral source

**Returns:**
- JSON object with success status, view ID, and timestamp

### 2. track_form_start

Records when a user starts filling out a form and updates metrics.

```sql
CREATE OR REPLACE FUNCTION track_form_start(
  p_form_id UUID,
  p_response_id UUID,
  p_visitor_id TEXT,
  p_metadata JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_timestamp TIMESTAMPTZ := NOW();
BEGIN
  -- Step 1: Update the response status to in_progress if it exists
  -- If it doesn't exist yet, we'll create it
  IF p_response_id IS NOT NULL THEN
    UPDATE form_responses 
    SET 
      status = 'in_progress',
      started_at = v_timestamp,
      metadata = COALESCE(metadata, '{}'::jsonb) || 
                 jsonb_build_object('visitor_id', p_visitor_id) || 
                 COALESCE(p_metadata, '{}'::jsonb)
    WHERE id = p_response_id;
    
    -- Check if update affected any rows
    IF NOT FOUND THEN
      -- Response doesn't exist, create it
      INSERT INTO form_responses (
        id,
        form_id,
        respondent_id,
        status,
        started_at,
        metadata
      ) VALUES (
        p_response_id,
        p_form_id,
        p_visitor_id,
        'in_progress',
        v_timestamp,
        jsonb_build_object('visitor_id', p_visitor_id) || COALESCE(p_metadata, '{}'::jsonb)
      );
    END IF;
  ELSE
    -- Create a new response record with a generated UUID
    INSERT INTO form_responses (
      form_id,
      respondent_id,
      status,
      started_at,
      metadata
    ) VALUES (
      p_form_id,
      p_visitor_id,
      'in_progress',
      v_timestamp,
      jsonb_build_object('visitor_id', p_visitor_id) || COALESCE(p_metadata, '{}'::jsonb)
    )
    RETURNING id INTO p_response_id;
  END IF;
  
  -- Step 2: Update metrics in the form_metrics table
  INSERT INTO form_metrics (
    form_id,
    total_views,
    unique_views,
    total_starts,
    total_completions,
    completion_rate,
    bounce_rate,
    last_updated
  )
  VALUES (
    p_form_id,
    1, -- Start with at least one view
    0, -- Default unique views
    1, -- This counts as a start
    0, -- No completions yet
    0, -- Initial completion rate
    0, -- Initial bounce rate
    v_timestamp
  )
  ON CONFLICT (form_id)
  DO UPDATE SET
    total_starts = form_metrics.total_starts + 1,
    -- Recalculate completion rate
    completion_rate = CASE 
                        WHEN form_metrics.total_completions > 0 THEN 
                          LEAST(1.0, GREATEST(0.0, 
                            form_metrics.total_completions::FLOAT / (form_metrics.total_starts + 1)
                          ))
                        ELSE 0
                      END,
    -- Update bounce rate when someone starts a form (they're no longer a "bounce")
    bounce_rate = CASE 
                    WHEN form_metrics.total_views > 0 THEN 
                      LEAST(1.0, GREATEST(0.0, 
                        (form_metrics.total_views - (form_metrics.total_starts + 1))::FLOAT / form_metrics.total_views
                      ))
                    ELSE 0
                  END,
    last_updated = v_timestamp;
  
  -- Return success with response ID
  RETURN jsonb_build_object(
    'success', true,
    'response_id', p_response_id,
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Parameters:**
- `p_form_id`: UUID of the form being started
- `p_response_id`: Optional UUID for an existing response record (if null, creates new)
- `p_visitor_id`: Unique identifier for the visitor
- `p_metadata`: Additional metadata about the form start event

**Returns:**
- JSON object with success status, response ID, and timestamp

### 3. track_form_completion

Records when a user completes a form and updates metrics.

```sql
CREATE OR REPLACE FUNCTION track_form_completion(
  p_form_id UUID,
  p_response_id UUID,
  p_total_time_seconds INTEGER DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
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
  INSERT INTO form_interactions (
    response_id,
    block_id,
    interaction_type,
    timestamp,
    duration_ms,
    metadata
  ) VALUES (
    p_response_id,
    NULL, -- No specific block for form completion
    'submit',
    v_timestamp,
    v_completion_time_seconds * 1000, -- Convert to milliseconds
    jsonb_build_object('form_id', p_form_id) || COALESCE(p_metadata, '{}'::jsonb)
  );
  
  -- Step 3: Update metrics in form_metrics table
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
    1, -- Start with at least one view
    0, -- Default unique views
    1, -- Must have started to complete
    1, -- This is a completion
    1, -- Initial 100% completion rate
    v_completion_time_seconds,
    0, -- Initial bounce rate
    v_timestamp
  )
  ON CONFLICT (form_id)
  DO UPDATE SET
    -- Increment completions (with data integrity check)
    total_completions = LEAST(form_metrics.total_completions + 1, form_metrics.total_starts),
    
    -- Recalculate completion rate with bounds checking
    completion_rate = CASE 
                        WHEN form_metrics.total_starts > 0 THEN 
                          LEAST(1.0, GREATEST(0.0, 
                            LEAST(form_metrics.total_completions + 1, form_metrics.total_starts)::FLOAT / form_metrics.total_starts
                          ))
                        ELSE 0
                      END,
                      
    -- Update average completion time
    average_completion_time_seconds = CASE 
                                        WHEN form_metrics.total_completions > 0 
                                        THEN ((COALESCE(form_metrics.average_completion_time_seconds, 0) * form_metrics.total_completions) + 
                                            v_completion_time_seconds) / (form_metrics.total_completions + 1)
                                        ELSE v_completion_time_seconds
                                      END,
    last_updated = v_timestamp;
  
  -- Return success with completion details
  RETURN jsonb_build_object(
    'success', true,
    'response_id', p_response_id,
    'completion_time_seconds', v_completion_time_seconds,
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Parameters:**
- `p_form_id`: UUID of the form being completed
- `p_response_id`: UUID of the form response being completed
- `p_total_time_seconds`: Optional total time taken to complete the form
- `p_metadata`: Additional metadata about the completion event


### 4. track_block_view

Records when a user views a specific block and updates metrics.

```sql
CREATE OR REPLACE FUNCTION track_block_view(
  p_block_id UUID,
  p_form_id UUID,
  p_response_id UUID DEFAULT NULL,
  p_visitor_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_view_id UUID;
  v_timestamp TIMESTAMPTZ := NOW();
BEGIN
  -- Step 1: Insert the block view as an interaction with type 'view'
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
- `p_form_id`: UUID of the form containing the block
- `p_response_id`: Optional UUID of the response session
- `p_visitor_id`: Unique identifier for the visitor
- `p_metadata`: Additional metadata about the view event

**Returns:**
- JSON object with success status, view ID, and timestamp

**Note:** This function records block views directly in the `form_interactions` table with an interaction_type of 'view' rather than using a separate block_views table. This ensures all interactions are tracked consistently in a single table.

### 5. track_block_interaction

Records when a user interacts with a specific block and updates metrics.

```sql
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
```

**Parameters:**
- `p_block_id`: UUID of the block that was interacted with
- `p_form_id`: UUID of the form containing the block
- `p_interaction_type`: Type of interaction (focus, blur, change, submit, error)
- `p_response_id`: Optional UUID of the response session
- `p_duration_ms`: Optional duration of the interaction in milliseconds
- `p_visitor_id`: Optional unique identifier for the visitor
- `p_metadata`: Additional metadata about the interaction

**Returns:**
- JSON object with success status, interaction ID, and timestamp SECURITY DEFINER;
```

**Parameters:**
- `p_block_id`: UUID of the block being interacted with
- `p_form_id`: UUID of the form containing the block
- `p_response_id`: Optional UUID of the response session
- `p_duration_ms`: Optional duration of the interaction in milliseconds
- `p_visitor_id`: Unique identifier for the visitor
- `p_metadata`: Additional metadata about the interaction

**Returns:**
- JSON object with success status, interaction ID, and timestamp

## Implementation Details

### Data Integrity

All RPC functions include:

1. **Transaction safety**: All operations occur in a single transaction
2. **Bounds checking**: All rates (completion rate, bounce rate) are constrained to 0-1
3. **Logical constraints**: Completions cannot exceed starts
4. **Error handling**: All exceptions are caught and return detailed error information

### API Integration

These RPC functions are called from corresponding API endpoints:

- `track_form_view` - Called from `/api/analytics/track/form-view/route.ts`
- `track_form_start` - Called from `/api/forms/[formId]/sessions/route.ts`
- `track_form_completion` - Called from `/api/analytics/track/form-completion/route.ts`
- `track_block_view` - Called from `/api/analytics/track/block-view/route.ts`
- `track_block_interaction` - Called from `/api/analytics/track/block-interaction/route.ts`
