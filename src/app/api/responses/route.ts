import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { StaticBlockAnswer, DynamicBlockResponse } from '@/types/supabase-types';

// Get all responses for a specific form
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const formId = url.searchParams.get('formId');
    const includeAnswers = url.searchParams.get('includeAnswers') === 'true';
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    if (!formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get responses for this form
    const { data: responses, error: responseError, count } = await supabase
      .from('form_responses')
      .select('*', { count: 'exact' })
      .eq('form_id', formId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (responseError) {
      console.error('[API] Error fetching form responses:', responseError);
      return NextResponse.json(
        { error: responseError.message },
        { status: 500 }
      );
    }

    if (!responses || responses.length === 0) {
      return NextResponse.json({ responses: [], total: 0 });
    }

    // If we don't need detailed answers, return just the responses
    if (!includeAnswers) {
      return NextResponse.json({ responses, total: count || responses.length });
    }

    // Get the response IDs for fetching answers
    const responseIds = responses.map(response => response.id);

    // Fetch static answers
    const { data: staticAnswers, error: staticError } = await supabase
      .from('static_block_answers')
      .select('*')
      .in('response_id', responseIds);

    if (staticError) {
      console.error('[API] Error fetching static answers:', staticError);
      return NextResponse.json(
        { error: staticError.message },
        { status: 500 }
      );
    }

    // Fetch dynamic responses
    const { data: dynamicResponses, error: dynamicError } = await supabase
      .from('dynamic_block_responses')
      .select('*')
      .in('response_id', responseIds);

    if (dynamicError) {
      console.error('[API] Error fetching dynamic responses:', dynamicError);
      return NextResponse.json(
        { error: dynamicError.message },
        { status: 500 }
      );
    }

    // Group answers by response ID for easier access
    const staticAnswersByResponse: Record<string, StaticBlockAnswer[]> = {};
    const dynamicResponsesByResponse: Record<string, DynamicBlockResponse[]> = {};

    // Group static answers
    if (staticAnswers) {
      for (const answer of staticAnswers) {
        if (!staticAnswersByResponse[answer.response_id]) {
          staticAnswersByResponse[answer.response_id] = [];
        }
        staticAnswersByResponse[answer.response_id].push(answer);
      }
    }

    // Group dynamic responses
    if (dynamicResponses) {
      for (const response of dynamicResponses) {
        if (!dynamicResponsesByResponse[response.response_id]) {
          dynamicResponsesByResponse[response.response_id] = [];
        }
        dynamicResponsesByResponse[response.response_id].push(response);
      }
    }

    return NextResponse.json({
      responses,
      static_answers: staticAnswersByResponse,
      dynamic_responses: dynamicResponsesByResponse,
      total: count || responses.length
    });
  } catch (error: unknown) {
    console.error('[API] Error in responses API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

// Create a new form response
export async function POST(request: Request) {
  try {
    console.log('Starting /api/responses POST request');
    
    // Parse the request body
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { form_id, respondent_id, metadata } = body;

    if (!form_id) {
      console.error('Form ID is required but not provided');
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Generate a random respondent_id if not provided
    // This could be an anonymous ID or a user ID if the user is logged in
    const visitorId = respondent_id || crypto.randomUUID();
    console.log('Using respondent_id:', visitorId);

    // Check if the form exists
    console.log('Checking if form exists:', form_id);
    const { data: formData, error: formError } = await supabase
      .from('forms')
      .select('form_id, status')
      .eq('form_id', form_id)
      .single();
      
    if (formError) {
      console.error('Form not found:', formError);
      return NextResponse.json(
        { error: 'Form not found or error retrieving it', details: formError.message },
        { status: 404 }
      );
    }
    
    if (formData.status !== 'published') {
      console.warn('Attempting to create response for non-published form:', form_id);
      // We'll still allow this for testing purposes, but log a warning
    }

    // Prepare record with all required fields
    const responseRecord = {
      form_id,
      respondent_id: visitorId,
      status: 'in_progress',
      started_at: new Date().toISOString(),
      metadata: metadata || null
    };
    
    console.log('Creating form response with data:', JSON.stringify(responseRecord, null, 2));

    // Create a new form response
    const { data: response, error } = await supabase
      .from('form_responses')
      .insert(responseRecord)
      .select()
      .single();

    if (error) {
      console.error('Error creating form response:', error);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: 500 }
      );
    }

    console.log('Form response created successfully with ID:', response.id);
    return NextResponse.json({
      response_id: response.id,
      form_id: response.form_id,
      respondent_id: response.respondent_id,
      created_at: response.created_at,
      started_at: response.started_at,
      status: response.status
    });
  } catch (error: unknown) {
    console.error('Unexpected error in create response API:', error);
    
    // Check if it's a SyntaxError from parsing the request body
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request body - could not parse JSON' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
