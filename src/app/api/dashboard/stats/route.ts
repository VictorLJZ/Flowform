import { NextResponse } from 'next/server';
import { supabase } from '@/supabase/supabase_client';

export async function GET() {
  try {
    // Get total forms count
    const { count: formsCount, error: formsError } = await supabase
      .from('forms')
      .select('*', { count: 'exact', head: true });
    
    if (formsError) throw formsError;
    
    // Get total responses count
    const { count: responsesCount, error: responsesError } = await supabase
      .from('form_sessions')
      .select('*', { count: 'exact', head: true });
    
    if (responsesError) throw responsesError;
    
    return NextResponse.json({
      totalForms: formsCount || 0,
      totalResponses: responsesCount || 0,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}
