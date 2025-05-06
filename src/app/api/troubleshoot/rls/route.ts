import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// This endpoint helps diagnose RLS issues by checking if the current policy setup would allow an operation
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const responseId = url.searchParams.get('response_id');
    const blockId = url.searchParams.get('block_id');
    
    if (!responseId || !blockId) {
      return NextResponse.json({
        error: 'Missing parameters',
        details: 'Both response_id and block_id are required'
      }, { status: 400 });
    }
    
    const supabase = await createClient();
    
    // Fetch all RLS policies for the static_block_answers table
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .ilike('tablename', '%static_block_answers%');
    
    if (policiesError) {
      console.error('Failed to fetch policies:', policiesError);
    }
    
    // Run the diagnostic function to check if answer submission would be allowed
    let diagnostics;
    let diagError;
    
    try {
      const diagResult = await supabase.rpc('diagnose_answer_submission', {
        p_response_id: responseId,
        p_block_id: blockId
      });
      
      diagnostics = diagResult.data;
      diagError = diagResult.error;
    } catch (err) {
      console.error('Error calling diagnostic function:', err);
      diagnostics = null;
      diagError = {
        message: err instanceof Error ? err.message : String(err),
        details: 'Diagnostic function may not be installed yet'
      };
    }
    
    // Check if the form is published (critical for RLS)
    let formStatus = null;
    
    try {
      // First get the form_id from the block
      const { data: blockData } = await supabase
        .from('form_blocks')
        .select('form_id')
        .eq('id', blockId)
        .single();
      
      if (blockData) {
        // Then get the form status
        const { data: formData } = await supabase
          .from('forms')
          .select('status')
          .eq('form_id', blockData.form_id)
          .single();
        
        formStatus = formData?.status;
      }
    } catch (formErr) {
      console.error('Error getting form status:', formErr);
    }
    
    // Attempt a direct test insert with a unique answer (to avoid conflicts)
    const testAnswer = `test-${Date.now()}`;
    const { error: insertError } = await supabase
      .from('static_block_answers')
      .insert({
        response_id: responseId,
        block_id: blockId,
        answer: testAnswer,
        answered_at: new Date().toISOString()
      })
      .select()
      .single();
    
    // If insert succeeded, delete the test answer
    if (!insertError) {
      await supabase
        .from('static_block_answers')
        .delete()
        .eq('response_id', responseId)
        .eq('block_id', blockId)
        .eq('answer', testAnswer);
    }
    
    return NextResponse.json({
      message: 'RLS diagnostic complete',
      policies: policies || [],
      diagnostics: diagnostics || null,
      diagnosticsError: diagError,
      formStatus: formStatus,
      directInsertTest: {
        success: !insertError,
        error: insertError ? {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details
        } : null
      },
      rls_recommendations: getRecommendations(insertError, formStatus, diagnostics)
    });
  } catch (error) {
    console.error('Error in RLS diagnostic:', error);
    return NextResponse.json({
      error: 'Failed to run RLS diagnostic',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Helper function to generate recommendations based on diagnostic results
function getRecommendations(
  insertError: any, 
  formStatus: string | null, 
  diagnostics: any
): string[] {
  const recommendations: string[] = [];
  
  if (insertError) {
    if (insertError.code === '42501') {
      recommendations.push(
        'RLS policy violation detected. Run the SQL script from src/docs/FixRLSPoliciesComplete.sql in the Supabase SQL Editor.'
      );
      
      if (formStatus !== 'published') {
        recommendations.push(
          'The form status is not "published". RLS policies typically restrict answers to published forms only.'
        );
      }
    }
  }
  
  if (diagnostics) {
    if (!diagnostics.response_exists) {
      recommendations.push('The response ID does not exist in the database.');
    }
    
    if (!diagnostics.block_exists) {
      recommendations.push('The block ID does not exist in the database.');
    }
    
    if (diagnostics.block_exists && !diagnostics.form_published) {
      recommendations.push('The form is not published. Publish the form to allow submissions.');
    }
  }
  
  if (recommendations.length === 0) {
    recommendations.push('No issues detected with RLS policies. If you are still experiencing problems, check client-side code and browser console for errors.');
  }
  
  return recommendations;
} 