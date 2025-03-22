import { NextResponse } from 'next/server';
import { QuestionGenerator } from '@/lib/form-generation/question-generator';
import { FormGenerationConfig } from '@/types/form-generation';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate the form configuration
    const config: FormGenerationConfig = {
      starterQuestion: body.starterQuestion,
      instructions: body.instructions,
      temperature: body.temperature || 0.7,
      maxQuestions: body.maxQuestions || 5,
    };
    
    if (!config.starterQuestion || !config.instructions) {
      return NextResponse.json(
        { message: 'Starter question and instructions are required' },
        { status: 400 }
      );
    }
    
    // Generate a form ID
    const formId = `form_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    // Store the form configuration in a database (placeholder for now)
    // In a real implementation, you would save this to your Supabase database
    
    return NextResponse.json({ 
      message: 'Form created successfully',
      formId,
      config
    });
    
  } catch (error) {
    console.error('Error creating form:', error);
    return NextResponse.json(
      { message: 'Failed to create form' },
      { status: 500 }
    );
  }
}
