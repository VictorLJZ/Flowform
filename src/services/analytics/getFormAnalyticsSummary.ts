import { createClient } from '@/lib/supabase/client'
import { DbFormMetrics } from '@/types/analytics/DbFormMetrics'
import { ApiFormMetrics } from '@/types/analytics/ApiFormMetrics'
import { dbToApiFormMetrics } from '@/utils/type-utils/analytics'

/**
 * Fetches analytics summary data for a form
 * 
 * @param formId - The ID of the form to fetch analytics for
 * @returns Promise resolving to form metrics data in API layer format
 */
export async function getFormAnalyticsSummary(formId: string): Promise<ApiFormMetrics | null> {
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
      // Transform database response to API layer format
      return dbToApiFormMetrics(metrics as DbFormMetrics)
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
    
    // Calculate completion rate with null safety
    const safeStarts = totalStarts || 0
    const safeCompletions = totalCompletions || 0
    const completionRate = safeStarts > 0 ? (safeCompletions / safeStarts) : 0
    
    // Create dynamic metrics (not saved to database)
    // Create metrics object directly in API layer format
    const dynamicMetrics: ApiFormMetrics = {
      formId: formId,
      totalViews: totalViews || 0,
      uniqueViews: uniqueViews || 0,
      totalStarts: totalStarts || 0,
      totalCompletions: totalCompletions || 0,
      completionRate: completionRate,
      averageCompletionTimeSeconds: undefined, // Would require additional calculation
      bounceRate: 0, // Would require additional calculation
      lastUpdated: new Date().toISOString()
    }
    
    return dynamicMetrics
  } catch (error: unknown) {
    console.error('Error fetching form analytics summary:', error)
    throw error
  }
}
