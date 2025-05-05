import { NextResponse, NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/serviceClient';
import { FormattedBlockMetrics } from '@/types';

/**
 * API route for fetching block metrics for a specific form
 * 
 * @param request - The HTTP request
 * @param params - The route parameters with formId
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

    // Create Supabase service client for trusted server operations
    const supabase = createServiceClient();

    // Fetch block metrics from the database
    const { data: blockMetrics, error } = await supabase
      .from('block_metrics')
      .select(`
        id,
        block_id,
        form_id,
        views_count,
        unique_views_count,
        avg_time_spent,
        interaction_count,
        completion_rate,
        blocks (
          id,
          title,
          description,
          block_type_id
        )
      `)
      .eq('form_id', formId)
      .order('views_count', { ascending: false });

    if (error) {
      console.error('[API] Error fetching block metrics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch block metrics' },
        { status: 500 }
      );
    }

    // Format the data for the client
    const formattedData = blockMetrics.map((metric): FormattedBlockMetrics => {
      // If blocks is an array, get the first item
      const blockData = Array.isArray(metric.blocks) ? metric.blocks[0] : metric.blocks;
      
      return {
        id: metric.block_id,
        title: blockData?.title || 'Untitled Block',
        blockTypeId: blockData?.block_type_id || 'unknown',
        count: metric.views_count || 0,
        uniqueViews: metric.unique_views_count || 0,
        avgTimeSpent: metric.avg_time_spent || 0,
        interactionCount: metric.interaction_count || 0,
        completionRate: metric.completion_rate || 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error processing block metrics request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
