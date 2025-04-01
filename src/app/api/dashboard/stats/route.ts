import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get form count
    const { count: formCount, error: formError } = await supabase
      .from('forms')
      .select('*', { count: 'exact', head: true });
      
    if (formError) throw formError;
    
    // Get session count
    const { count: sessionCount, error: sessionError } = await supabase
      .from('form_sessions')
      .select('*', { count: 'exact', head: true });
      
    if (sessionError) throw sessionError;
    
    // Get total responses (answers)
    const { count: responseCount, error: responseError } = await supabase
      .from('answers')
      .select('*', { count: 'exact', head: true });
      
    if (responseError) throw responseError;
    
    return NextResponse.json({
      forms: formCount || 0,
      sessions: sessionCount || 0,
      responses: responseCount || 0
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
