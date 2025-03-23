import { NextResponse } from 'next/server';
import { supabase } from '@/supabase/supabase_client';

export async function GET() {
  try {
    // Get recent forms
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (error) throw error;
    
    return NextResponse.json({ recentForms: data || [] });
  } catch (error) {
    console.error('Error fetching recent forms:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}
