import { createClient } from '@/lib/supabase/server';
import { BlockPerformance } from '@/types/analytics-types';
import { BlockMetrics } from '@/types/supabase-types';

/**
 * Get performance analytics for a specific block or all blocks in a form
 * 
 * @param formId - The ID of the form
 * @param blockId - Optional ID of a specific block to analyze
 * @param startDate - Optional start date for filtering (ISO string)
 * @param endDate - Optional end date for filtering (ISO string)
 * @returns Performance data for the block(s)
 */
export async function getBlockPerformance(
  formId: string,
  blockId?: string,
  startDate?: string,
  endDate?: string
): Promise<BlockPerformance[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  
  // Define date range filters
  const dateStart = startDate || '1970-01-01';
  const dateEnd = endDate || now;

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
    console.error('Error getting form blocks:', blocksError);
    throw blocksError;
  }

  if (!blocks || blocks.length === 0) {
    return [];
  }

  // Get block metrics if they exist
  const blockIds = blocks.map(block => block.id);
  const { data: metrics, error: metricsError } = await supabase
    .from('block_metrics')
    .select('*')
    .in('block_id', blockIds);

  if (metricsError) {
    console.error('Error getting block metrics:', metricsError);
    throw metricsError;
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
      .gte('created_at', dateStart)
      .lte('created_at', dateEnd);
    
    if (dynamicError) {
      console.error('Error getting dynamic block responses:', dynamicError);
      throw dynamicError;
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
      .gte('created_at', dateStart)
      .lte('created_at', dateEnd);
    
    if (responseError) {
      console.error('Error getting form responses:', responseError);
      throw responseError;
    }
    
    // Get static block answers count per block
    const { data: staticAnswers, error: staticError } = await supabase
      .rpc('count_static_answers_per_block', {
        block_ids: staticBlockIds,
        start_date: dateStart,
        end_date: dateEnd
      });
    
    if (staticError) {
      console.error('Error getting static block answers:', staticError);
      throw staticError;
    }
    
    // Calculate completion rates for static blocks
    if (staticAnswers && staticAnswers.length > 0 && totalResponses) {
      staticBlockIds.forEach(id => {
        const answerCount = staticAnswers.find((a: {block_id: string; count: number}) => a.block_id === id)?.count || 0;
        staticCompletionRates[id] = answerCount / totalResponses;
      });
    }
  }
  
  // Compile the performance data for each block
  const blockPerformance: BlockPerformance[] = blocks.map(block => {
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
  
  return blockPerformance;
}
