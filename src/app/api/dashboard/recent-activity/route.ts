import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

interface FormData {
  id: string;
  title: string;
}

interface SessionData {
  id: string;
  form_id: string;
  created_at: string;
  completed: boolean;
}

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get recent form sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('form_sessions')
      .select('id, form_id, created_at, completed')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (sessionsError) throw sessionsError;
    
    // No sessions found
    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ activity: [] });
    }
    
    // Get form titles for each session
    const formIds = [...new Set(sessions.map(session => session.form_id))];
    const { data: forms, error: formsError } = await supabase
      .from('forms')
      .select('id, title')
      .in('id', formIds);
      
    if (formsError) throw formsError;
    
    // Create a map of form IDs to titles
    const formTitles: Record<string, string> = {};
    forms?.forEach((form: FormData) => {
      formTitles[form.id] = form.title;
    });
    
    // Combine the data
    const activity = sessions.map((session: SessionData) => ({
      id: session.id,
      form_id: session.form_id,
      created_at: session.created_at,
      completed: session.completed,
      form_title: formTitles[session.form_id] || 'Unknown Form'
    }));
    
    return NextResponse.json({ activity });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}
