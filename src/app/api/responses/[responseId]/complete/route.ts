import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Mark a form response as completed
export async function POST(
  request: Request,
  { params }: { params: { responseId: string } }
) {
  try {
    console.log('Starting /api/responses/[responseId]/complete POST request');
    const { responseId } = params;
    
    if (!responseId) {
      console.error('Response ID is required but not provided in URL parameters');
      return NextResponse.json(
        { error: 'Response ID is required' },
        { status: 400 }
      );
    }
    
    console.log('Completing response with ID:', responseId);
    const supabase = await createClient();
    
    // Check if response exists first
    console.log('Checking if response exists');
    const { data: checkData, error: checkError } = await supabase
      .from('form_responses')
      .select('id, status')
      .eq('id', responseId)
      .single();
      
    if (checkError) {
      console.error('Error checking response:', checkError);
      return NextResponse.json(
        { error: 'Response not found or error retrieving it', details: checkError.message },
        { status: 404 }
      );
    }
    
    if (checkData.status === 'completed') {
      console.log('Response already completed, no action needed');
      return NextResponse.json({
        message: 'Response already marked as completed',
        response_id: checkData.id,
        status: checkData.status
      });
    }
    
    // Update the response status to completed
    console.log('Updating response status to completed');
    const { data, error } = await supabase
      .from('form_responses')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', responseId)
      .select()
      .single();
      
    if (error) {
      console.error('Error completing form response:', error);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: 500 }
      );
    }
    
    if (!data) {
      console.error('No response found with ID:', responseId);
      return NextResponse.json(
        { error: 'No response found with the given ID' },
        { status: 404 }
      );
    }
    
    console.log('Response completed successfully');
    return NextResponse.json({
      message: 'Form response marked as completed',
      response_id: data.id,
      status: data.status,
      completed_at: data.completed_at
    });
    
  } catch (error: unknown) {
    console.error('Unexpected error in complete response API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 