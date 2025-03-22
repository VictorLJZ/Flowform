import { NextRequest, NextResponse } from 'next/server';
import { QuestionGenerator } from '@/lib/form-generation/question-generator';
import { FormStorageService } from '@/lib/form-generation/form-storage-service';
import { FormGenerationConfig } from '@/types/form-generation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract form configuration from the request body
    const { title, description, starterQuestion, instructions, temperature, maxQuestions } = body;
    
    // Validate required fields
    if (!title || !starterQuestion || !instructions || temperature === undefined || maxQuestions === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Create form config object
    const config: FormGenerationConfig = {
      starterQuestion,
      instructions,
      temperature: parseFloat(temperature),
      maxQuestions: parseInt(maxQuestions)
    };
    
    // Initialize the generator and create the form
    const generator = new QuestionGenerator(config);
    const formId = await generator.initializeForm(title, description);
    
    return NextResponse.json({ 
      success: true, 
      formId,
      message: 'Form created successfully'
    });
  } catch (error) {
    console.error('Error creating form:', error);
    return NextResponse.json({ 
      error: 'Failed to create form', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Create an instance of the storage service to fetch forms
    const storageService = new FormStorageService();
    
    // Get all forms
    const forms = await storageService.getAllForms();
    
    return NextResponse.json({ forms });
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch forms',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
