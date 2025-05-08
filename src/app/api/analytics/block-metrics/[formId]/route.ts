import { NextResponse, NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/serviceClient';
import { FormattedBlockMetrics } from '@/types';

// Enable CORS for this route
export const dynamic = 'force-dynamic';

/**
 * API route for fetching block metrics for a specific form
 * 
 * @param request - The HTTP request
 * @returns JSON response with block metrics
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract formId from URL
    const pathParts = request.nextUrl.pathname.split('/');
    const formId = pathParts[pathParts.length - 1];

    if (!formId) {
      return NextResponse.json(
        { error: 'Missing required parameter: formId' },
        { status: 400 }
      );
    }

    console.log('[API DEBUG] Fetching block metrics for form:', formId);
    const supabase = createServiceClient();
    
    // First get all blocks for this form
    const { data: formBlocks, error: formError } = await supabase
      .from('form_blocks')
      .select('id, title, type, form_id, order_index')
      .eq('form_id', formId)
      .order('order_index', { ascending: true });
    
    if (formError) {
      console.error('[API] Error fetching form blocks:', formError);
      return NextResponse.json({
        success: false, 
        error: 'Failed to fetch form blocks',
        details: formError.message
      }, { status: 500 });
    }
    
    // If no blocks found, return empty array
    if (!formBlocks || formBlocks.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }
    
    console.log('[API] Successfully fetched form blocks:', formBlocks.length);
    
    // Now try to get form responses to count views and completions
    const { data: responses, error: respError } = await supabase
      .from('form_responses')
      .select('id, status, form_id')
      .eq('form_id', formId);
      
    if (respError) {
      console.error('[API] Error fetching form responses:', respError);
      // Continue anyway as we can still return block data without metrics
    }
    
    // Count total responses
    const totalResponses = responses?.length || 0;
    const completedResponses = responses?.filter(r => r.status === 'completed')?.length || 0;
    
    // Get static block answers for a measure of completion per block
    const { data: blockAnswers, error: answersError } = await supabase
      .from('static_block_answers')
      .select('id, block_id, response_id')
      .in('response_id', (responses || []).map(r => r.id).filter(Boolean));
      
    if (answersError) {
      console.error('[API] Error fetching block answers:', answersError);
      // Continue anyway
    }
    
    // Count answers per block
    const answersByBlock: Record<string, number> = {};
    (blockAnswers || []).forEach(answer => {
      if (answer.block_id) {
        answersByBlock[answer.block_id] = (answersByBlock[answer.block_id] || 0) + 1;
      }
    });
    
    // Format the data in a way that matches our frontend expectations
    const formattedData = formBlocks.map((block): FormattedBlockMetrics => {
      // Calculate metrics
      const viewCount = totalResponses || 0;
      const completionCount = answersByBlock[block.id] || 0;
      const dropOffCount = viewCount > 0 ? (viewCount - completionCount) : 0;
      const dropOffRate = viewCount > 0 ? Math.round((dropOffCount / viewCount) * 100) : 0;
      
      return {
        id: block.id,
        title: block.title || 'Untitled Question',
        blockTypeId: block.type || 'unknown',
        count: viewCount,
        uniqueViews: completionCount,
        avgTimeSpent: 0, // We don't have this data
        interactionCount: completionCount,
        completionRate: viewCount > 0 ? Math.round((completionCount / viewCount) * 100) : 0,
        // Additional properties for our table
        dropOffRate: dropOffRate,
        dropOffPercentage: dropOffRate > 0 ? `-${dropOffRate}%` : '0%',
      } as FormattedBlockMetrics;
    });

    // Add CORS headers
    const response = NextResponse.json({
      success: true,
      data: formattedData
    });
    
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;
  } catch (error) {
    console.error('Error processing block metrics request:', error);
    return NextResponse.json({
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
