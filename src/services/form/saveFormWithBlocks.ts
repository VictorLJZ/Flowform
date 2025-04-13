import { createClient } from '@/lib/supabase/client';
import { Form, FormBlock } from '@/types/supabase-types';
import { FormBlock as FrontendFormBlock } from '@/registry/blockRegistry';
import { mapToDbBlockType } from '@/utils/blockTypeMapping';

// Input types for saveFormWithBlocks
interface SaveFormInput {
  id: string;
  title: string;
  description?: string;
  workspace_id?: string;
  created_by?: string;
  status?: 'draft' | 'published' | 'archived';
  theme?: Record<string, any>;
  settings?: Record<string, any>;
}

interface SaveFormOutput {
  form: Form;
  blocks: FormBlock[];
  success: boolean;
}

/**
 * Save a complete form with all its blocks
 * Handles creating a new form or updating an existing one
 * Synchronizes blocks by adding new ones, updating changed ones, and removing deleted ones
 * Uses a database transaction via RPC for data consistency
 * 
 * @param formData - Basic form data
 * @param blocks - Array of form blocks from the frontend
 * @returns The saved form and blocks
 */
export async function saveFormWithBlocks(
  formData: SaveFormInput, 
  blocks: FrontendFormBlock[]
): Promise<SaveFormOutput> {
  const supabase = createClient();
  
  try {
    // Prepare blocks data with proper type/subtype mapping
    const blocksData = blocks.map(frontendBlock => {
      const { type, subtype } = mapToDbBlockType(frontendBlock.blockTypeId);
      
      const blockData = {
        id: frontendBlock.id,
        type,
        subtype,
        title: frontendBlock.title,
        description: frontendBlock.description || null,
        required: frontendBlock.required,
        order_index: frontendBlock.order,
        settings: frontendBlock.settings
      };
      
      // For dynamic blocks, add dynamic config
      if (type === 'dynamic') {
        // Using type assertion to add dynamic_config property
        (blockData as any).dynamic_config = {
          starter_question: frontendBlock.settings?.startingPrompt || 'How can I help you today?',
          temperature: frontendBlock.settings?.temperature || 0.7,
          max_questions: frontendBlock.settings?.maxQuestions || 5,
          ai_instructions: frontendBlock.settings?.contextInstructions || null
        };
      }
      
      return blockData;
    });
    
    // Call the RPC function
    const { data, error } = await supabase.rpc('save_form_with_blocks', {
      p_form_data: formData,
      p_blocks_data: blocksData
    });
    
    if (error) throw error;
    
    return {
      form: data.form,
      blocks: data.blocks,
      success: data.success
    };
  } catch (error) {
    console.error('Error saving form with blocks:', error);
    throw error;
  }
}
