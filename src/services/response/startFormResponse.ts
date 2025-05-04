import { createClient } from '@/lib/supabase/client';
import { createPublicClient } from '@/lib/supabase/publicClient';
import { FormResponse } from '@/types/supabase-types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Start a new form response session
 * 
 * @param formId - The ID of the form being responded to
 * @param metadata - Optional metadata about the respondent (device, browser, etc.)
 * @param mode - Optional mode flag ('builder' or 'viewer') - uses public client when in viewer mode
 * @returns The created response record and starter question
 */
export async function startFormResponse(
  formId: string,
  metadata: Record<string, unknown> = {},
  mode: 'builder' | 'viewer' = 'viewer' // Default to viewer mode for public access
): Promise<{ response: FormResponse; starterQuestion: string }> {
  // Use public client for viewer mode, standard client for builder mode
  const supabase = mode === 'viewer' ? createPublicClient() : createClient();

  // Generate a unique respondent ID - this should be stored in the browser
  // for returning users to continue their response
  const respondentId = uuidv4();
  
  // Get the latest form version if it exists
  const { data: latestVersion, error: versionError } = await supabase
    .from('form_versions')
    .select('id')
    .eq('form_id', formId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
    
  // If there's an error fetching versions, log it but continue (non-critical)
  if (versionError) {
    console.warn('Error checking for form versions:', versionError);
  }
  
  // Create a new form response with the version ID if available
  const { data: response, error: responseError } = await supabase
    .from('form_responses')
    .insert({
      form_id: formId,
      respondent_id: respondentId,
      status: 'in_progress',
      // Include the form version ID if we found one
      form_version_id: latestVersion?.id || null,
      metadata: {
        ...metadata,
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
        timestamp: new Date().toISOString(),
      }
    })
    .select()
    .single();

  if (responseError) {
    console.error('Error creating form response:', responseError);
    throw responseError;
  }

  // Get the first block (should be a dynamic block with a starter question)
  const { data: blocks, error: blocksError } = await supabase
    .from('form_blocks')
    .select('*')
    .eq('form_id', formId)
    .order('order_index')
    .limit(1);

  if (blocksError || !blocks || blocks.length === 0) {
    console.error('Error fetching form blocks:', blocksError);
    throw blocksError || new Error('No blocks found for this form');
  }

  const firstBlock = blocks[0];
  let starterQuestion = '';

  if (firstBlock.type === 'dynamic') {
    // Get the dynamic block config to get the starter question
    const { data: config, error: configError } = await supabase
      .from('dynamic_block_configs')
      .select('*')
      .eq('block_id', firstBlock.id)
      .single();

    if (configError) {
      console.error('Error fetching dynamic block config:', configError);
      throw configError;
    }

    starterQuestion = config.starter_question;
  } else {
    // If the first block is static, use its title as the question
    starterQuestion = firstBlock.title;
  }

  return {
    response,
    starterQuestion
  };
}
