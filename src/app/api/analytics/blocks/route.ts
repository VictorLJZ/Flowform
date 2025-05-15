import { createServiceClient } from '@/lib/supabase/serviceClient';
import { NextResponse } from 'next/server';
import { DbBlockMetrics } from '@/types/analytics/DbBlockMetrics';
import { ApiBlockMetrics } from '@/types/analytics/ApiBlockMetrics';
import { BlockPerformance } from '@/types/AggregateApiCleanup';

// Get performance analytics for a specific block or all blocks in a form
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const formId = url.searchParams.get('formId');
    const blockId = url.searchParams.get('blockId');
    const startDate = url.searchParams.get('startDate') || '1970-01-01';
    const endDate = url.searchParams.get('endDate') || new Date().toISOString();

    if (!formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    
    // First, get the blocks information
    let blocksQuery = supabase
      .from('form_blocks')
      .select('id, form_id, type, subtype')
      .eq('form_id', formId);
      
    if (blockId) {
      blocksQuery = blocksQuery.eq('id', blockId);
    }
    
    const { data: blocks, error: blocksError } = await blocksQuery;

    if (blocksError) {
      // Error getting form blocks
      return NextResponse.json(
        { error: blocksError.message },
        { status: 500 }
      );
    }

    if (!blocks || blocks.length === 0) {
      return NextResponse.json([]);
    }

    // Get block metrics if they exist
    const blockIds = blocks.map(block => block.id);
    const { data: metrics, error: metricsError } = await supabase
      .from('block_metrics')
      .select('*')
      .in('block_id', blockIds);

    if (metricsError) {
      // Error getting block metrics
      return NextResponse.json(
        { error: metricsError.message },
        { status: 500 }
      );
    }

    // Map of block ID to metrics
    const metricsMap = (metrics || []).reduce<Record<string, DbBlockMetrics>>((acc, metric) => {
      acc[metric.block_id] = metric;
      return acc;
    }, {});

    // For static blocks, get completion rates from static_block_answers
    const staticBlockIds = blocks
      .filter(block => block.type === 'static')
      .map(block => block.id);
    
    const staticCompletionRates: Record<string, number> = {};
    
    if (staticBlockIds.length > 0) {
      // Get total number of form responses
      const { count: totalResponses, error: responseError } = await supabase
        .from('form_responses')
        .select('*', { count: 'exact', head: true })
        .eq('form_id', formId)
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      if (responseError) {
        // Error getting form responses
        return NextResponse.json(
          { error: responseError.message },
          { status: 500 }
        );
      }
      
      // Get static block answers count per block
      const { data: staticAnswers, error: staticError } = await supabase
        .rpc('count_static_answers_per_block', {
          block_ids: staticBlockIds,
          start_date: startDate,
          end_date: endDate
        });
      
      if (staticError) {
        // Error getting static block answers
        return NextResponse.json(
          { error: staticError.message },
          { status: 500 }
        );
      }
      
      // Calculate completion rates for static blocks
      if (staticAnswers && staticAnswers.length > 0 && totalResponses) {
        staticBlockIds.forEach(id => {
          const answerCount = staticAnswers.find((a: { block_id: string; count: number }) => a.block_id === id)?.count || 0;
          staticCompletionRates[id] = answerCount / totalResponses;
        });
      }
    }
    
    // Compile the performance data for each block
    const blockPerformance = blocks.map(block => {
      const blockMetrics = metricsMap[block.id];
      const completionRate = block.type === 'static' ? (staticCompletionRates[block.id] || 0) : 0;
      const skipRate = block.type === 'static' ? (1 - completionRate) : 1; // Assume dynamic blocks are skipped
      
      return {
        block_id: block.id,
        form_id: block.form_id,
        block_type: block.type,
        block_subtype: block.subtype,
        completion_rate: completionRate,
        average_time_spent: blockMetrics?.average_time_seconds || 0,
        skip_rate: skipRate,
        // Transform DbBlockMetrics to ApiBlockMetrics at the API boundary
        metrics: blockMetrics ? {
          id: blockMetrics.id,
          blockId: blockMetrics.block_id,
          formId: blockMetrics.form_id,
          views: blockMetrics.views,
          skips: blockMetrics.skips,
          averageTimeSeconds: blockMetrics.average_time_seconds || undefined,
          dropOffCount: blockMetrics.drop_off_count,
          dropOffRate: blockMetrics.drop_off_rate || undefined,
          lastUpdated: blockMetrics.last_updated,
          submissions: blockMetrics.submissions
        } as ApiBlockMetrics : null
      } as BlockPerformance;
    });
    
    return NextResponse.json(blockPerformance);
  } catch (error: unknown) {
    // Error in block performance API
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
