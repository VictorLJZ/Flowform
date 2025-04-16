import { createClient } from '@/lib/supabase/client'
import type { FormMetrics } from '@/types/supabase-types'

/**
 * Fetches analytics summary data for a form
 * 
 * @param formId - The ID of the form to fetch analytics for
 * @returns Promise resolving to form metrics data
 */
export async function getFormAnalyticsSummary(formId: string): Promise<FormMetrics | null> {
  if (!formId) {
    throw new Error('Form ID is required')
  }

  const supabase = createClient()

  try {
    // Check if we have pre-calculated metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('form_metrics')
      .select('*')
      .eq('form_id', formId)
      .single()
    
    if (metricsError && metricsError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw metricsError
    }
    
    if (metrics) {
      return metrics as FormMetrics
    }
    
    // If no pre-calculated metrics exist, calculate them on the fly
    // Get total views
    const { count: totalViews, error: viewsError } = await supabase
      .from('form_views')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', formId)
    
    if (viewsError) throw viewsError
    
    // Get unique views
    const { count: uniqueViews, error: uniqueError } = await supabase
      .from('form_views')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', formId)
      .eq('is_unique', true)
    
    if (uniqueError) throw uniqueError
    
    // Get total response counts
    const { count: totalStarts, error: startsError } = await supabase
      .from('form_responses')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', formId)
    
    if (startsError) throw startsError
    
    // Get completed response counts
    const { count: totalCompletions, error: completionsError } = await supabase
      .from('form_responses')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', formId)
      .eq('status', 'completed')
    
    if (completionsError) throw completionsError
    
    // Calculate completion rate
    const completionRate = totalStarts > 0 ? (totalCompletions / totalStarts) : 0
    
    // Create dynamic metrics (not saved to database)
    const dynamicMetrics: FormMetrics = {
      form_id: formId,
      total_views: totalViews || 0,
      unique_views: uniqueViews || 0,
      total_starts: totalStarts || 0,
      total_completions: totalCompletions || 0,
      completion_rate: completionRate,
      average_completion_time_seconds: null, // Would require additional calculation
      bounce_rate: 0, // Would require additional calculation
      last_updated: new Date().toISOString()
    }
    
    return dynamicMetrics
  } catch (error: any) {
    console.error('Error fetching form analytics summary:', error)
    throw error
  }
}
