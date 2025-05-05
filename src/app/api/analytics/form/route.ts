import { createServiceClient } from '@/lib/supabase/serviceClient';
import { NextResponse } from 'next/server';

// Get analytics data for a specific form
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const formId = url.searchParams.get('formId');
    const startDate = url.searchParams.get('startDate') || '1970-01-01';
    const endDate = url.searchParams.get('endDate') || new Date().toISOString();

    if (!formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    
    // Get form views count
    const { count: viewCount, error: viewError } = await supabase
      .from('form_views')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', formId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (viewError) {
      console.error('[API] Error getting form views:', viewError);
      return NextResponse.json(
        { error: viewError.message },
        { status: 500 }
      );
    }

    // Get completed responses count
    const { count: completionCount, error: completionError } = await supabase
      .from('form_responses')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', formId)
      .eq('status', 'completed')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (completionError) {
      console.error('[API] Error getting completed responses:', completionError);
      return NextResponse.json(
        { error: completionError.message },
        { status: 500 }
      );
    }

    // Get form metrics if they exist
    const { data: metrics, error: metricsError } = await supabase
      .from('form_metrics')
      .select('*')
      .eq('form_id', formId)
      .single();

    if (metricsError && metricsError.code !== 'PGRST116') { // Not found is ok
      console.error('[API] Error getting form metrics:', metricsError);
      return NextResponse.json(
        { error: metricsError.message },
        { status: 500 }
      );
    }

    // Get form interactions to calculate average time spent
    const { data: interactions, error: interactionsError } = await supabase
      .from('form_interactions')
      .select('duration')
      .eq('form_id', formId)
      .eq('interaction_type', 'completion')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (interactionsError) {
      console.error('[API] Error getting form interactions:', interactionsError);
      return NextResponse.json(
        { error: interactionsError.message },
        { status: 500 }
      );
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
        start_date_param: startDate,
        end_date_param: endDate 
      });

    if (viewsTimeError) {
      console.error('[API] Error getting views over time:', viewsTimeError);
      // Fall back to an empty array if the function isn't available
      const viewsOverTimeData: { date: string; count: number }[] = [];
      
      const analytics = {
        form_id: formId,
        total_views: viewCount || 0,
        total_completions: completionCount || 0,
        completion_rate: viewCount ? (completionCount || 0) / viewCount : 0,
        average_time_spent: avgTimeSpent,
        metrics: metrics || null,
        views_over_time: viewsOverTimeData
      };
      
      return NextResponse.json(analytics);
    }

    const analytics = {
      form_id: formId,
      total_views: viewCount || 0,
      total_completions: completionCount || 0,
      completion_rate: viewCount ? (completionCount || 0) / viewCount : 0,
      average_time_spent: avgTimeSpent,
      metrics: metrics || null,
      views_over_time: viewsOverTime || []
    };
    
    return NextResponse.json(analytics);
  } catch (error: unknown) {
    console.error('[API] Error in form analytics API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
