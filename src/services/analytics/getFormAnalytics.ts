import { createClient } from '@/lib/supabase/server';
import { ApiFormMetrics } from '@/types/analytics';

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
): Promise<ApiFormMetrics> {
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
  const { error: metricsError } = await supabase
    .from('form_metrics')
    .select('*')
    .eq('form_id', formId)
    .single();

  if (metricsError && metricsError.code !== 'PGRST116') { // Not found is ok
    console.error('Error getting form metrics:', metricsError);
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

  // Get views over time data using the analytics.get_views_over_time function
  const { error: viewsTimeError } = await supabase.rpc(
    'analytics.get_views_over_time', 
    { 
      form_id_param: formId, 
      start_date_param: dateStart, 
      end_date_param: dateEnd 
    });
    
  if (viewsTimeError) {
    console.error('Error getting views over time:', viewsTimeError);
  }

  // Calculate completion rate
  const completionRate = viewCount ? (completionCount || 0) / viewCount : 0;
  
  // Format the response according to ApiFormMetrics
  const result: ApiFormMetrics = {
    formId,
    totalViews: viewCount || 0,
    uniqueViews: 0, // This needs to be calculated or retrieved from the database
    totalStarts: 0, // This needs to be retrieved from the database
    totalCompletions: completionCount || 0,
    completionRate,
    averageCompletionTimeSeconds: avgTimeSpent,
    lastUpdated: new Date().toISOString()
  };
  
  return result;
}
