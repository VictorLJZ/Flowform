import { NextResponse } from 'next/server';
import { supabase } from '@/supabase/supabase_client';

export async function GET() {
  try {
    // First, get forms that have sessions with aggregated data
    const { data: activityData, error: activityError } = await supabase
      .from('form_sessions')
      .select('form_id, created_at')
      .order('created_at', { ascending: false });
    
    if (activityError) throw activityError;

    // No activity found
    if (!activityData || activityData.length === 0) {
      return NextResponse.json({ recentActivity: [] });
    }

    // Process the data to get counts and latest activity
    // Group by form_id, count occurrences, and find the latest date
    const formActivityMap: Record<string, { count: number; latestActivity: string }> = {};
    
    activityData.forEach((session: { form_id: string; created_at: string }) => {
      const { form_id, created_at } = session;
      
      if (!formActivityMap[form_id]) {
        formActivityMap[form_id] = { count: 0, latestActivity: created_at };
      }
      
      formActivityMap[form_id].count += 1;
      
      // Update latest activity if this session is newer
      if (new Date(created_at) > new Date(formActivityMap[form_id].latestActivity)) {
        formActivityMap[form_id].latestActivity = created_at;
      }
    });
    
    // Convert to array and sort by latest activity
    const formActivity = Object.entries(formActivityMap)
      .map(([form_id, { count, latestActivity }]) => ({
        form_id,
        count,
        latest_activity: latestActivity
      }))
      .sort((a, b) => new Date(b.latest_activity).getTime() - new Date(a.latest_activity).getTime())
      .slice(0, 5); // Get top 5
    

    
    // Get form details for the form IDs we found
    const formIds = formActivity.map(item => item.form_id);
    const { data: formsData, error: formsError } = await supabase
      .from('forms')
      .select('id, title')
      .in('id', formIds);
    
    if (formsError) throw formsError;
    
    // Create a map of form id -> title for easy lookup
    const formTitleMap: Record<string, string> = {};
    formsData?.forEach((form: { id: string; title?: string }) => {
      formTitleMap[form.id] = form.title || 'Unnamed Form';
    });
    
    // Format the data for the frontend
    const recentActivity = formActivity.map((activity: { form_id: string; count: number; latest_activity: string }) => {
      // Calculate relative time
      const date = new Date(activity.latest_activity);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      let relativeTime;
      if (diffInHours < 1) {
        relativeTime = 'Just now';
      } else if (diffInHours < 24) {
        relativeTime = `${diffInHours} hours ago`;
      } else if (diffInHours < 48) {
        relativeTime = 'Yesterday';
      } else {
        relativeTime = `${Math.floor(diffInHours / 24)} days ago`;
      }
      
      return {
        id: activity.form_id, // Using form_id as the id since we're grouping by form
        formId: activity.form_id,
        form: formTitleMap[activity.form_id] || 'Unnamed Form',
        responses: activity.count, // Actual count of responses
        date: relativeTime
      };
    });
    
    return NextResponse.json({ recentActivity });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}
