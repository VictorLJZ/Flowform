import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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
    const staticAnswersByResponse: Record<string, any[]> = {};
    const dynamicResponsesByResponse: Record<string, any[]> = {};

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
  } catch (error: any) {
    console.error('[API] Error in responses API:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
