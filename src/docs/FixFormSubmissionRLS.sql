-- SQL script to fix Row-Level Security policies for form submissions
-- Run this in Supabase SQL Editor with admin privileges

-- Create a function to insert static answers with service role privileges
CREATE OR REPLACE FUNCTION public.insert_static_answer(
  p_response_id UUID,
  p_block_id UUID,
  p_answer TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_id UUID;
BEGIN
  -- Insert the answer
  INSERT INTO public.static_block_answers(
    response_id, block_id, answer, answered_at
  )
  VALUES (
    p_response_id, p_block_id, p_answer, NOW()
  )
  RETURNING id INTO v_id;
  
  v_result := jsonb_build_object(
    'success', true,
    'id', v_id
  );
  
  RETURN v_result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'code', SQLSTATE
  );
END;
$$;

-- Create missing INSERT policy for static_block_answers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'static_block_answers' 
    AND cmd = 'INSERT'
  ) THEN
    EXECUTE 
    'CREATE POLICY "Anyone can insert answers to published forms" 
    ON public.static_block_answers 
    FOR INSERT 
    TO authenticated, anon
    WITH CHECK (
      block_id IN (
        SELECT id FROM form_blocks 
        WHERE form_id IN (
          SELECT form_id FROM forms 
          WHERE status = ''published''
        )
      )
    )';
    
    RAISE NOTICE 'Created INSERT policy for static_block_answers table';
  ELSE
    RAISE NOTICE 'INSERT policy for static_block_answers already exists';
  END IF;
END
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.insert_static_answer(UUID, UUID, TEXT) TO authenticated, anon, service_role;

-- Verify RLS is enabled on the table
DO $$
DECLARE
  v_rls_enabled BOOLEAN;
BEGIN
  SELECT relrowsecurity INTO v_rls_enabled 
  FROM pg_class
  WHERE relname = 'static_block_answers';
  
  IF v_rls_enabled THEN
    RAISE NOTICE 'RLS is enabled on static_block_answers table';
  ELSE
    RAISE NOTICE 'Enabling RLS on static_block_answers table';
    EXECUTE 'ALTER TABLE public.static_block_answers ENABLE ROW LEVEL SECURITY';
  END IF;
END
$$;

-- List all policies for the table
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