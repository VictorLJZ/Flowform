import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Get the context of a form including all questions
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const formId = url.searchParams.get('formId');
    const currentBlockId = url.searchParams.get('currentBlockId') || '';

    if (!formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    try {
      // 1. Get form info
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('form_id, title')
        .eq('form_id', formId)
        .single();
      
      if (formError) {
        console.error('[API] Error fetching form:', formError);
        return NextResponse.json(
          { error: formError.message },
          { status: 500 }
        );
      }
      
      // 2. Get all blocks for this form
      const { data: blocks, error: blocksError } = await supabase
        .from('form_blocks')
        .select('*')
        .eq('form_id', formId)
        .order('order_index');
      
      if (blocksError) {
        console.error('[API] Error fetching form blocks:', blocksError);
        return NextResponse.json(
          { error: blocksError.message },
          { status: 500 }
        );
      }
      
      // 3. Extract dynamic block information directly from the blocks
      const dynamicBlocks = blocks.filter(block => block.type === 'dynamic');
      
      // 4. Format data
      const staticQuestions = blocks
        .filter(block => block.type === 'static')
        .map(block => ({
          id: block.id,
          title: block.title,
          description: block.description,
          type: 'static' as const,
          subtype: block.subtype
        }));
      
      const dynamicBlocksFormatted = dynamicBlocks.map(block => {
        // Extract starter question from title
        const starterQuestion = block.title || '';
        
        return {
          id: block.id,
          title: block.title,
          description: block.description,
          type: 'dynamic' as const,
          starter_question: starterQuestion
        };
      });
      
      // 5. Construct complete form context
      const formContext = {
        formId,
        formTitle: form.title,
        staticQuestions,
        dynamicBlocks: dynamicBlocksFormatted
      };
      
      // 6. Filter out the current block if specified
      const filteredContext = {
        ...formContext,
        staticQuestions: formContext.staticQuestions.filter(q => q.id !== currentBlockId),
        dynamicBlocks: formContext.dynamicBlocks.filter(b => b.id !== currentBlockId)
      };
      
      return NextResponse.json(filteredContext);
      
    } catch (error: unknown) {
      console.error('[API] Error getting form context:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error occurred' },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('[API] Unexpected error in form context API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
