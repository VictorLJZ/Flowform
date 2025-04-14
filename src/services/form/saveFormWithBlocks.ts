import { createClient } from '@/lib/supabase/client';
import { Form, FormBlock } from '@/types/supabase-types';
import { FormBlock as FrontendFormBlock } from '@/registry/blockRegistry';
import { mapToDbBlockType } from '@/utils/blockTypeMapping';
import { v4 as uuidv4 } from 'uuid';

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
 * @param formData Form data to save
 * @param blocks Form blocks to save
 * @returns Object containing saved form, blocks, and success status
 */
export async function saveFormWithBlocks(
  formData: SaveFormInput, 
  blocks: FrontendFormBlock[]
): Promise<SaveFormOutput> {
  const supabase = createClient();
  
  try {
    // Extract and ensure critical fields with proper types
    const {
      id,
      title = 'Untitled Form',
      description = '',
      workspace_id,
      created_by,
      status = 'draft',
      theme = { name: 'default', primaryColor: '#0284c7', fontFamily: 'inter' },
      settings = { showProgressBar: true, requireSignIn: false }
    } = formData;
    
    if (!workspace_id) {
      throw new Error('workspace_id is required for saving forms');
    }
    
    // Prepare the form data object
    const formDataObj = {
      id,
      title,
      description,
      workspace_id,
      created_by,
      status,
      theme,
      settings
    };
    
    // Map blocks to database format with proper UUID handling
    const blocksData = blocks.map(frontendBlock => {
      const { type, subtype } = mapToDbBlockType(frontendBlock.blockTypeId);
      
      // Generate a proper UUID if the ID isn't already a UUID format
      const blockId = frontendBlock.id.includes('-') && 
                     frontendBlock.id.length === 36 ? 
                     frontendBlock.id : uuidv4();
      
      return {
        id: blockId,
        type,
        subtype,
        title: frontendBlock.title || '',
        description: frontendBlock.description || null,
        required: !!frontendBlock.required,
        order_index: frontendBlock.order || 0,
        settings: frontendBlock.settings || {}
      };
    });
    
    // Call the PostgreSQL function that handles empty arrays and UUID conversion
    const { data, error } = await supabase.rpc('save_form_with_blocks_empty_safe', {
      p_form_data: formDataObj,
      p_blocks_data: blocksData
    });
    
    // Handle errors if any
    if (error) {
      console.error('Error saving form with blocks:', error);
      throw error;
    }
    
    // Ensure data exists before accessing properties
    if (!data || !data.form) {
      throw new Error('Invalid response format from database function');
    }
    
    return {
      form: data.form as Form,
      blocks: Array.isArray(data.blocks) ? data.blocks : [],
      success: true
    };
  } catch (error) {
    // Final error handling
    console.error('Failed to save form with blocks:', error);
    throw error;
  }
}
