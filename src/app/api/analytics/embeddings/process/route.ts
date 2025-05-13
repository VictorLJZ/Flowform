import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processFormConversations } from '@/services/analytics/preprocessConversations';
import { EmbeddingStatus } from '@/types/AggregateApiCleanup';

/**
 * POST handler for processing form conversations and generating embeddings
 * This endpoint processes all conversations from dynamic blocks in a form
 * and generates vector embeddings for them to be used in the RAG system
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formId } = body;
    
    if (!formId) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }
    
    // Create supabase server client
    const supabase = await createClient();
    
    // Get user ID from session
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user has access to this form
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('created_by')
      .eq('form_id', formId)
      .single();
    
    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }
    
    if (form.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to access this form' }, { status: 403 });
    }
    
    // Process form conversations
    const result = await processFormConversations(formId);
    
    return NextResponse.json(result);
  } catch (error) {
    // Error processing form conversations
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to process form conversations' 
    }, { status: 500 });
  }
}

/**
 * GET handler for checking embedding status
 * Returns the count of embedded conversations for a form
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const formId = searchParams.get('formId');
  
  if (!formId) {
    return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
  }
  
  try {
    // Create supabase server client
    const supabase = await createClient();
    
    // Get user ID from session
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user has access to this form
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('created_by')
      .eq('form_id', formId)
      .single();
    
    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }
    
    if (form.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to access this form' }, { status: 403 });
    }
    
    // Get dynamic block counts
    const { data: blocks, error: blocksError } = await supabase
      .from('form_blocks')
      .select('id')
      .eq('form_id', formId)
      .eq('type', 'dynamic');
      
    if (blocksError) {
      // Error fetching dynamic blocks
      return NextResponse.json({ error: blocksError.message }, { status: 500 });
    }
    
    const blockIds = blocks.map(block => block.id);
    
    if (blockIds.length === 0) {
      return NextResponse.json({ 
        total_responses: 0,
        embedded_count: 0,
        embedding_percentage: 0
      });
    }
    
    // Count total conversations
    const { count: totalCount, error: totalError } = await supabase
      .from('dynamic_block_responses')
      .select('response_id', { count: 'exact' })
      .in('block_id', blockIds);
      
    if (totalError) {
      // Error counting total conversations
      return NextResponse.json({ error: totalError.message }, { status: 500 });
    }
    
    // Count embedded conversations
    const { count: embeddedCount, error: embeddedError } = await supabase
      .from('conversation_embeddings')
      .select('id', { count: 'exact' })
      .eq('form_id', formId);
      
    if (embeddedError) {
      // Error counting embedded conversations
      return NextResponse.json({ error: embeddedError.message }, { status: 500 });
    }
    
    const totalResponses = totalCount || 0;
    const embeddedResponses = embeddedCount || 0;
    const embeddingPercentage = totalResponses > 0 
      ? Math.round((embeddedResponses / totalResponses) * 100) 
      : 0;
    
    const status: EmbeddingStatus = {
      total_responses: totalResponses,
      embedded_count: embeddedResponses,
      embedding_percentage: embeddingPercentage
    };
    
    return NextResponse.json(status);
  } catch (error) {
    // Error checking embedding status
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to check embedding status' 
    }, { status: 500 });
  }
} 