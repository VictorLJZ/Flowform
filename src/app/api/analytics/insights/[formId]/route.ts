import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/serviceClient';
import type { FormInsights } from '@/types/analytics-types';

// Mark this route as dynamic to prevent caching
export const dynamic = 'force-dynamic';

/**
 * GET handler for the /api/analytics/insights/[formId] endpoint
 * 
 * Retrieves comprehensive analytics insights for a form
 */
export async function GET(
  request: Request,
  { params }: { params: { formId: string } }
) {
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
    
    // Note: Using the service client approach means we're bypassing the auth check
    // since this is a secure server-side endpoint. If user-level authorization
    // is required, a different approach would be needed.
    
    // Get form metrics if they exist
    const { data: formMetrics, error: metricsError } = await supabase
      .from('form_metrics')
      .select('*')
      .eq('form_id', formId)
      .single();
    
    // Get total submissions count from form_responses
    const { count: submissionsCount, error: submissionsError } = await supabase
      .from('form_responses')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', formId)
      .eq('status', 'completed');
    
    // Get total starts count from form_responses (any status)
    const { count: startsCount, error: startsError } = await supabase
      .from('form_responses')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', formId);
    
    // Calculate average completion time from responses
    const { data: completionTimes, error: timingError } = await supabase
      .from('form_responses')
      .select('started_at, completed_at')
      .eq('form_id', formId)
      .eq('status', 'completed')
      .not('completed_at', 'is', null);
    
    // Calculate average time to complete in seconds
    let avgTimeToComplete = 0;
    if (completionTimes && completionTimes.length > 0) {
      const totalSeconds = completionTimes.reduce((acc: number, response: { started_at: string | null; completed_at: string | null }) => {
        if (!response.started_at || !response.completed_at) return acc;
        const startTime = new Date(response.started_at).getTime();
        const endTime = new Date(response.completed_at).getTime();
        const durationSec = (endTime - startTime) / 1000;
        // Filter out unreasonably long times (e.g., over 1 hour)
        return durationSec > 0 && durationSec < 3600 ? acc + durationSec : acc;
      }, 0);
      
      avgTimeToComplete = totalSeconds / completionTimes.length;
    }
    
    // Build insights response
    const totalViews = formMetrics?.total_views || 0;
    const totalSubmissions = submissionsCount || 0;
    const totalStarts = startsCount || 0;
    
    // Calculate completion rate safely
    const completionRate = totalStarts > 0 
      ? (totalSubmissions / totalStarts) * 100 
      : 0;
    
    const insights: FormInsights = {
      totalViews,
      totalStarts,
      totalSubmissions,
      completionRate,
      averageTimeToComplete: avgTimeToComplete,
      lastUpdated: formMetrics?.last_updated || new Date().toISOString()
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
