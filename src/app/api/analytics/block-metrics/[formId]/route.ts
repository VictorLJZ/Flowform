import { NextResponse, NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/serviceClient';
import { FormattedBlockMetrics } from '@/types';

// Enable CORS for this route
export const dynamic = 'force-dynamic';

/**
 * API route for fetching block metrics for a specific form
 * This implementation directly retrieves metrics from the block_metrics table
 * instead of performing calculations.
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
    
    // First get all blocks for this form (for metadata like title and type)
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
    
    // Get metrics for all blocks in this form from the block_metrics table
    const { data: blockMetrics, error: metricsError } = await supabase
      .from('block_metrics')
      .select('*')
      .eq('form_id', formId);
      
    if (metricsError) {
      console.error('[API] Error fetching block metrics:', metricsError);
      // Continue anyway, we'll use default values for metrics
    }
    
    // Create a map of block metrics for easy lookup
    const metricsMap: Record<string, any> = {};
    (blockMetrics || []).forEach(metric => {
      if (metric.block_id) {
        metricsMap[metric.block_id] = metric;
      }
    });
    
    // Format the data in a way that matches our frontend expectations
    const formattedData = formBlocks.map((block): FormattedBlockMetrics => {
      // Get metrics for this block, or use defaults if not found
      const metrics = metricsMap[block.id] || {
        views: 0,
        submissions: 0,
        skips: 0,
        average_time_seconds: 0,
        drop_off_count: 0,
        drop_off_rate: 0
      };
      
      // Calculate completion rate, ensuring we don't divide by zero
      const completionRate = metrics.views > 0 
        ? Math.round(((metrics.views - metrics.drop_off_count) / metrics.views) * 100) 
        : 0;
      
      return {
        id: block.id,
        title: block.title || 'Untitled Question',
        blockTypeId: block.type || 'unknown',
        count: metrics.views || 0,
        uniqueViews: metrics.views - metrics.drop_off_count || 0,
        avgTimeSpent: metrics.average_time_seconds || 0,
        interactionCount: metrics.views - metrics.drop_off_count || 0,
        completionRate: completionRate,
        // Additional properties for our table
        dropOffRate: Math.round(metrics.drop_off_rate * 100) || 0,
        dropOffPercentage: metrics.drop_off_rate > 0 ? `-${Math.round(metrics.drop_off_rate * 100)}%` : '0%',
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
