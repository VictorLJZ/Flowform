import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { BlockMetrics } from '@/types/supabase-types';

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

    const supabase = await createClient();
    
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
      console.error('[API] Error getting form blocks:', blocksError);
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
      console.error('[API] Error getting block metrics:', metricsError);
      return NextResponse.json(
        { error: metricsError.message },
        { status: 500 }
      );
    }

    // Map of block ID to metrics
    const metricsMap = (metrics || []).reduce<Record<string, BlockMetrics>>((acc, metric) => {
      acc[metric.block_id] = metric;
      return acc;
    }, {});

    // For dynamic blocks, get completion rates from dynamic_block_responses
    const dynamicBlockIds = blocks
      .filter(block => block.type === 'dynamic')
      .map(block => block.id);
    
    const dynamicCompletionRates: Record<string, { total: number; completed: number }> = {};
    
    if (dynamicBlockIds.length > 0) {
      const { data: dynamicResponses, error: dynamicError } = await supabase
        .from('dynamic_block_responses')
        .select('block_id, completed_at')
        .in('block_id', dynamicBlockIds)
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      if (dynamicError) {
        console.error('[API] Error getting dynamic block responses:', dynamicError);
        return NextResponse.json(
          { error: dynamicError.message },
          { status: 500 }
        );
      }
      
      // Calculate completion rates for dynamic blocks
      if (dynamicResponses && dynamicResponses.length > 0) {
        dynamicBlockIds.forEach(id => {
          const responses = dynamicResponses.filter(r => r.block_id === id);
          const completed = responses.filter(r => r.completed_at !== null).length;
          
          dynamicCompletionRates[id] = {
            total: responses.length,
            completed
          };
        });
      }
    }
    
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
        console.error('[API] Error getting form responses:', responseError);
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
        console.error('[API] Error getting static block answers:', staticError);
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
      let completionRate = 0;
      let skipRate = 0;
      
      if (block.type === 'dynamic') {
        const rates = dynamicCompletionRates[block.id];
        if (rates) {
          completionRate = rates.total > 0 ? rates.completed / rates.total : 0;
          skipRate = rates.total > 0 ? 1 - (rates.completed / rates.total) : 0;
        }
      } else {
        completionRate = staticCompletionRates[block.id] || 0;
        skipRate = 1 - completionRate;
      }
      
      return {
        block_id: block.id,
        form_id: block.form_id,
        block_type: block.type,
        block_subtype: block.subtype,
        completion_rate: completionRate,
        average_time_spent: blockMetrics?.average_time_seconds || 0,
        skip_rate: skipRate,
        metrics: blockMetrics || null
      };
    });
    
    return NextResponse.json(blockPerformance);
  } catch (error: unknown) {
    console.error('[API] Error in block performance API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
