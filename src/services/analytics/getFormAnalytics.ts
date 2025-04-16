import { createClient } from '@/lib/supabase/server';
import { FormMetrics } from '@/types/supabase-types';

type Analytics = {
  form_id: string;
  total_views: number;
  total_completions: number;
  completion_rate: number;
  average_time_spent: number;
  metrics: FormMetrics | null;
  views_over_time: { date: string; count: number }[];
};

/**
 * Get analytics data for a specific form
 * 
 * @param formId - The ID of the form
 * @param startDate - Optional start date for filtering (ISO string)
 * @param endDate - Optional end date for filtering (ISO string)
 * @returns Analytics data for the form
 */
export async function getFormAnalytics(
  formId: string,
  startDate?: string,
  endDate?: string
): Promise<Analytics> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  
  // Define date range filters
  const dateStart = startDate || '1970-01-01';
  const dateEnd = endDate || now;

  // Get form views count
  const { count: viewCount, error: viewError } = await supabase
    .from('form_views')
    .select('*', { count: 'exact', head: true })
    .eq('form_id', formId)
    .gte('created_at', dateStart)
    .lte('created_at', dateEnd);

  if (viewError) {
    console.error('Error getting form views:', viewError);
    throw viewError;
  }

  // Get completed responses count
  const { count: completionCount, error: completionError } = await supabase
    .from('form_responses')
    .select('*', { count: 'exact', head: true })
    .eq('form_id', formId)
    .eq('status', 'completed')
    .gte('created_at', dateStart)
    .lte('created_at', dateEnd);

  if (completionError) {
    console.error('Error getting completed responses:', completionError);
    throw completionError;
  }

  // Get form metrics if they exist
  const { data: metrics, error: metricsError } = await supabase
    .from('form_metrics')
    .select('*')
    .eq('form_id', formId)
    .single();

  if (metricsError && metricsError.code !== 'PGRST116') { // Not found is ok
    console.error('Error getting form metrics:', metricsError);
    throw metricsError;
  }

  // Get form interactions to calculate average time spent
  const { data: interactions, error: interactionsError } = await supabase
    .from('form_interactions')
    .select('duration')
    .eq('form_id', formId)
    .eq('interaction_type', 'completion')
    .gte('created_at', dateStart)
    .lte('created_at', dateEnd);

  if (interactionsError) {
    console.error('Error getting form interactions:', interactionsError);
    throw interactionsError;
  }

  // Calculate average time spent
  let avgTimeSpent = 0;
  if (interactions && interactions.length > 0) {
    const totalTime = interactions.reduce((sum, interaction) => {
      return sum + (interaction.duration || 0);
    }, 0);
    avgTimeSpent = totalTime / interactions.length;
  }

  // Get views over time (grouped by day)
  const { data: viewsOverTime, error: viewsTimeError } = await supabase
    .rpc('get_daily_form_views', { 
      form_id_param: formId,
      start_date_param: dateStart,
      end_date_param: dateEnd 
    });

  if (viewsTimeError) {
    console.error('Error getting views over time:', viewsTimeError);
    // Fall back to an empty array if the function isn't available
    const viewsOverTimeData: { date: string; count: number }[] = [];
    
    return {
      form_id: formId,
      total_views: viewCount || 0,
      total_completions: completionCount || 0,
      completion_rate: viewCount ? (completionCount || 0) / viewCount : 0,
      average_time_spent: avgTimeSpent,
      metrics: metrics || null,
      views_over_time: viewsOverTimeData
    };
  }

  return {
    form_id: formId,
    total_views: viewCount || 0,
    total_completions: completionCount || 0,
    completion_rate: viewCount ? (completionCount || 0) / viewCount : 0,
    average_time_spent: avgTimeSpent,
    metrics: metrics || null,
    views_over_time: viewsOverTime || []
  };
}
