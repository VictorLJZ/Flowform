import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/serviceClient';
import type { FormInsights } from '@/types/analytics-types';

// Mark this route as dynamic to prevent caching
export const dynamic = 'force-dynamic';

/**
 * GET handler for the /api/analytics/insights/[formId] endpoint
 * 
 * Retrieves comprehensive analytics insights for a form directly from form_metrics table
 * instead of calculating metrics.
 */
export async function GET(
  request: Request,
  context: { params: { formId: string } }
) {
  const { params } = context;
  const formId = params.formId;
  
  // Check if formId is valid
  if (!formId || typeof formId !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Invalid form ID', data: null },
      { status: 400 }
    );
  }

  try {
    // Use service client for secure server-side analytics access
    const supabase = createServiceClient();
    
    // First verify the form exists
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('form_id')
      .eq('form_id', formId)
      .single();
    
    if (formError || !form) {
      return NextResponse.json(
        { success: false, error: 'Form not found', data: null },
        { status: 404 }
      );
    }
    
    // Get form metrics directly from the form_metrics table
    // This table contains pre-calculated metrics maintained by RPC functions
    const { data: formMetrics, error: metricsError } = await supabase
      .from('form_metrics')
      .select('*')
      .eq('form_id', formId)
      .single();
    
    if (metricsError) {
      console.warn('Error fetching form metrics:', metricsError);
      // If metrics don't exist yet, return defaults
      return NextResponse.json({ 
        success: true, 
        data: {
          totalViews: 0,
          totalStarts: 0,
          totalSubmissions: 0,
          completionRate: 0,
          averageTimeToComplete: 0,
          lastUpdated: new Date().toISOString()
        } as FormInsights
      });
    }
    
    // Build insights response directly from the metrics table
    // with proper field name transformation to match our expected FormInsights type
    const insights: FormInsights = {
      totalViews: formMetrics.total_views || 0,
      totalStarts: formMetrics.total_starts || 0,
      totalSubmissions: formMetrics.total_completions || 0,
      completionRate: formMetrics.completion_rate ? formMetrics.completion_rate * 100 : 0, // Convert from decimal to percentage
      averageTimeToComplete: formMetrics.average_completion_time_seconds || 0,
      lastUpdated: formMetrics.last_updated || new Date().toISOString()
    };
    
    return NextResponse.json({ 
      success: true, 
      data: insights 
    });
    
  } catch (error) {
    console.error('Error fetching form insights:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch insights', data: null },
      { status: 500 }
    );
  }
}
