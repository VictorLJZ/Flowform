import { createClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  
  try {
    const { workspace_id, user_id } = await request.json();
    
    if (!workspace_id || !user_id) {
      return NextResponse.json(
        { error: 'Workspace ID and User ID are required' }, 
        { status: 400 }
      );
    }
    
    // Create a basic form entry with minimal data
    const { data: form, error } = await supabase
      .from('forms')
      .insert({
        workspace_id,
        created_by: user_id,
        title: 'Untitled Form',
        description: '',
        status: 'draft',
        settings: {
          showProgressBar: true,
          requireSignIn: false,
          theme: 'default',
          primaryColor: '#0284c7',
          fontFamily: 'inter'
        }
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return NextResponse.json({ form_id: form.form_id });
  } catch (error: any) {
    console.error('Error creating form:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create form' }, 
      { status: 500 }
    );
  }
}
