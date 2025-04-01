import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get recent forms
    const { data, error } = await supabase
      .from('forms')
      .select('id, title, created_at, status')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (error) throw error;
    
    return NextResponse.json({ forms: data || [] });
  } catch (error) {
    console.error('Error fetching recent forms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent forms' },
      { status: 500 }
    );
  }
}
