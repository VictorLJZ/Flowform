import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// This API route is used to set up and verify RLS policies for form submission
// It should be called with admin privileges
export async function POST() {
  try {
    const supabase = await createClient();
    
    // Execute SQL to create the necessary RLS policies and functions
    const { error } = await supabase.rpc('admin_setup_rls', {
      sql: `
        -- Create a function to insert static answers with service role privileges
        CREATE OR REPLACE FUNCTION insert_static_answer(
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
          END IF;
        END
        $$;
        
        -- Grant necessary permissions
        GRANT EXECUTE ON FUNCTION insert_static_answer(UUID, UUID, TEXT) TO authenticated, anon, service_role;
      `
    });
    
    if (error) {
      console.error('Failed to execute RLS setup:', error);
      return NextResponse.json({
        error: 'Failed to setup RLS policies',
        details: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      message: 'RLS policies and helper functions created successfully'
    });
  } catch (error) {
    console.error('Error in RLS setup:', error);
    return NextResponse.json({
      error: 'Failed to setup RLS policies',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 