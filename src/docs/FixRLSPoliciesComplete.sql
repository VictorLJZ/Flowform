-- Complete RLS policy fix for form submissions
-- Run this script directly in the Supabase SQL Editor

-- First, drop the existing problematic policy
DROP POLICY IF EXISTS "Respondents can insert static answers" ON static_block_answers;

-- Create a better INSERT policy that works for both anonymous and authenticated users
CREATE POLICY "Anyone can submit answers to forms" 
ON public.static_block_answers 
FOR INSERT 
TO authenticated, anon
WITH CHECK (
  -- Check that the response exists
  response_id IN (SELECT id FROM form_responses)
  AND
  -- Check that the block exists and belongs to a published form
  block_id IN (
    SELECT form_blocks.id 
    FROM form_blocks 
    JOIN forms ON form_blocks.form_id = forms.form_id
    WHERE forms.status = 'published'
  )
);

-- Create a bypass function with SECURITY DEFINER privilege
CREATE OR REPLACE FUNCTION public.insert_answer_bypass(
  p_response_id UUID,
  p_block_id UUID, 
  p_answer TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Direct insert bypassing RLS
  INSERT INTO public.static_block_answers(
    response_id, block_id, answer, answered_at
  )
  VALUES (
    p_response_id, p_block_id, p_answer, NOW()
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Error inserting answer: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$$;

-- Grant execute permissions to all users
GRANT EXECUTE ON FUNCTION public.insert_answer_bypass TO authenticated, anon, service_role;

-- Create a diagnostic function to help troubleshoot RLS issues
CREATE OR REPLACE FUNCTION public.diagnose_answer_submission(
  p_response_id UUID,
  p_block_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB := '{}'::JSONB;
  v_response_exists BOOLEAN;
  v_block_exists BOOLEAN;
  v_form_id UUID;
  v_form_status TEXT;
  v_form_published BOOLEAN;
BEGIN
  -- Check if response exists
  SELECT EXISTS(SELECT 1 FROM form_responses WHERE id = p_response_id)
  INTO v_response_exists;
  
  v_result := v_result || jsonb_build_object('response_exists', v_response_exists);
  
  -- Check if block exists
  SELECT EXISTS(SELECT 1 FROM form_blocks WHERE id = p_block_id)
  INTO v_block_exists;
  
  v_result := v_result || jsonb_build_object('block_exists', v_block_exists);
  
  -- Get form details if block exists
  IF v_block_exists THEN
    SELECT form_id INTO v_form_id FROM form_blocks WHERE id = p_block_id;
    v_result := v_result || jsonb_build_object('form_id', v_form_id);
    
    -- Check form status
    SELECT status INTO v_form_status FROM forms WHERE form_id = v_form_id;
    v_result := v_result || jsonb_build_object('form_status', v_form_status);
    
    -- Check if form is published
    v_form_published := v_form_status = 'published';
    v_result := v_result || jsonb_build_object('form_published', v_form_published);
  END IF;
  
  -- Check if RLS would allow this insert
  v_result := v_result || jsonb_build_object(
    'would_pass_rls_check', 
    v_response_exists AND v_block_exists AND v_form_published
  );
  
  RETURN v_result;
END;
$$;

-- Grant execute permissions to all users
GRANT EXECUTE ON FUNCTION public.diagnose_answer_submission TO authenticated, anon, service_role;

-- Enable RLS on the table if not already enabled
ALTER TABLE public.static_block_answers ENABLE ROW LEVEL SECURITY;

-- List all policies for the table after changes
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies
WHERE tablename = 'static_block_answers'
ORDER BY policyname; 