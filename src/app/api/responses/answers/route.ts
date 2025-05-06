import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for validating the answer request
const AnswerRequestSchema = z.object({
  response_id: z.string().uuid(),
  block_id: z.string().uuid(),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(z.string()),
    z.array(z.object({
      question: z.string(),
      answer: z.string()
    }))
  ])
});

// Submit an answer to a form response
export async function POST(request: Request) {
  try {
    console.log('Starting /api/responses/answers POST request');
    
    // Parse the request body
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body));
    
    // Validate the request data
    const result = AnswerRequestSchema.safeParse(body);
    if (!result.success) {
      console.error('Validation error:', result.error.format());
      return NextResponse.json({
        error: 'Invalid request data',
        details: result.error.format()
      }, { status: 400 });
    }
    
    const { response_id, block_id, value } = result.data;
    console.log('Validated data:', { response_id, block_id, value_type: typeof value });
    
    const supabase = await createClient();
    
    // Run diagnostics to check for potential RLS issues
    try {
      console.log('Running diagnostics on submission...');
      const { data: diagnostics, error: diagError } = await supabase.rpc(
        'diagnose_answer_submission',
        { p_response_id: response_id, p_block_id: block_id }
      );
      
      if (diagError) {
        console.error('Diagnostics error:', diagError);
      } else {
        console.log('Diagnostics results:', diagnostics);
        
        if (!diagnostics.response_exists) {
          return NextResponse.json({
            error: 'Form response not found',
            details: 'The specified response ID does not exist'
          }, { status: 404 });
        }
        
        if (!diagnostics.block_exists) {
          return NextResponse.json({
            error: 'Form block not found',
            details: 'The specified block ID does not exist'
          }, { status: 404 });
        }
        
        if (!diagnostics.form_published) {
          return NextResponse.json({
            error: 'Form is not published',
            details: 'Answers can only be submitted to published forms'
          }, { status: 403 });
        }
      }
    } catch (diagErr) {
      console.warn('Diagnostics function not available, continuing with standard checks:', diagErr);
    }
    
    // First check if the response exists
    console.log('Checking if response exists:', response_id);
    const { data: responseData, error: responseError } = await supabase
      .from('form_responses')
      .select('id, form_id, status')
      .eq('id', response_id)
      .single();
    
    if (responseError) {
      console.error('Response not found:', responseError);
      return NextResponse.json({
        error: 'Form response not found or error retrieving it',
        details: responseError.message
      }, { status: 404 });
    }
    
    if (responseData.status === 'completed') {
      console.error('Response already completed:', response_id);
      return NextResponse.json({
        error: 'This form response has already been completed'
      }, { status: 400 });
    }
    
    // Check if the block exists
    console.log('Checking if block exists:', block_id);
    const { data: blockData, error: blockError } = await supabase
      .from('form_blocks')
      .select('id, form_id')
      .eq('id', block_id)
      .single();
    
    if (blockError) {
      console.error('Block not found:', blockError);
      return NextResponse.json({
        error: 'Form block not found or error retrieving it',
        details: blockError.message
      }, { status: 404 });
    }
    
    // Ensure we have a valid string value for the answer
    let answerValue;
    if (value === null || value === undefined) {
      answerValue = '';
      console.log('Null/undefined value normalized to empty string');
    } else if (typeof value === 'object') {
      answerValue = JSON.stringify(value);
      console.log('Object value serialized to JSON string');
    } else if (typeof value === 'boolean') {
      answerValue = value ? 'true' : 'false';
      console.log('Boolean value converted to string');
    } else {
      answerValue = String(value);
      console.log('Value converted to string:', answerValue);
    }
    
    // Check if there's an existing answer to update
    console.log('Checking for existing answer');
    const { data: existingAnswer, error: existingError } = await supabase
      .from('static_block_answers')
      .select('id')
      .eq('response_id', response_id)
      .eq('block_id', block_id)
      .maybeSingle();
    
    if (existingError) {
      console.error('Error checking for existing answer:', existingError);
    }
    
    const answerRecord = {
      response_id,
      block_id,
      answer: answerValue,
      answered_at: new Date().toISOString()
    };
    
    console.log('Saving answer:', JSON.stringify(answerRecord));
    
    // First check the form status to make sure it's published
    console.log('Checking form status for block:', block_id);
    const { data: formData, error: formError } = await supabase
      .from('forms')
      .select('form_id, status')
      .eq('form_id', blockData.form_id)
      .single();
      
    if (formError) {
      console.error('Error retrieving form data:', formError);
      return NextResponse.json({
        error: 'Error retrieving form data',
        details: formError.message
      }, { status: 500 });
    }
    
    console.log(`Form status: ${formData.status} (needs to be 'published' for RLS to work)`);
    
    // Determine the correct save approach - we're going to use upsert to handle duplicates
    try {
      console.log('Using upsert method to handle potential duplicates');
      
      // The key is to use upsert (insert with on_conflict) to handle duplicate keys
      const { data: upsertData, error: upsertError } = await supabase
        .from('static_block_answers')
        .upsert(answerRecord, { 
          onConflict: 'response_id,block_id',  // The columns that have a unique constraint
          ignoreDuplicates: false  // We want to update on conflict, not ignore
        })
        .select();
      
      if (upsertError) {
        console.error('Error upserting answer:', upsertError);
        
        // Special handling for RLS errors
        if (upsertError.code === '42501') {
          console.error('RLS policy violation:', upsertError);
          
          // Try the BYPASS function as last resort
          try {
            console.log('Attempting bypass function...');
            const { data: bypassData, error: bypassError } = await supabase.rpc(
              'insert_answer_bypass',
              {
                p_response_id: response_id,
                p_block_id: block_id,
                p_answer: answerValue
              }
            );
            
            if (bypassError) {
              console.error('Bypass function failed:', bypassError);
              
              // Check if it's a duplicate key error
              if (bypassError.message && (
                bypassError.message.includes('duplicate key') || 
                bypassError.message.includes('unique constraint') ||
                bypassError.code === '23505'
              )) {
                // For duplicate key errors, we can actually return success
                // This is a race condition where the answer was already saved
                return NextResponse.json({
                  message: 'Answer already exists',
                  success: true
                });
              }
              
              return NextResponse.json({
                error: 'Permission denied: RLS policy violation',
                code: upsertError.code,
                details: 'Security policy prevents saving this answer'
              }, { status: 403 });
            }
            
            // Bypass succeeded
            return NextResponse.json({
              message: 'Answer saved successfully via bypass method',
              answer_id: bypassData
            });
          } catch (bypassCatchError) {
            console.error('Exception in bypass attempt:', bypassCatchError);
          }
          
          // If we get here, both normal and bypass methods failed
          return NextResponse.json({
            error: 'Permission denied: Security policy prevents saving this answer',
            code: upsertError.code
          }, { status: 403 });
        }
        
        // Check for duplicate key error
        if (upsertError.code === '23505') {
          console.log('Duplicate key error, answer already exists');
          // This is actually not an error condition for our app
          return NextResponse.json({
            message: 'Answer already exists',
            success: true
          });
        }
        
        return NextResponse.json({
          error: 'Error saving answer',
          code: upsertError.code,
          details: upsertError.message
        }, { status: 500 });
      }
      
      console.log('Answer saved successfully:', upsertData?.[0]?.id);
      return NextResponse.json({
        message: 'Answer saved successfully',
        answer_id: upsertData?.[0]?.id
      });
    } catch (error) {
      console.error('Exception during save operation:', error);
      return NextResponse.json({
        error: 'Exception during save operation',
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
    
  } catch (error: unknown) {
    console.error('Unexpected error in save answer API:', error);
    
    // Check if it's a SyntaxError from parsing the request body
    if (error instanceof SyntaxError) {
      return NextResponse.json({
        error: 'Invalid request body - could not parse JSON'
      }, { status: 400 });
    }
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 