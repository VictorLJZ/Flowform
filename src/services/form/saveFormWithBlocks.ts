import { createClient } from '@/lib/supabase/client';
import { Form, FormBlock } from '@/types/supabase-types';
import { FormBlock as FrontendFormBlock } from '@/registry/blockRegistry';
import { mapToDbBlockType } from '@/utils/blockTypeMapping';
import { v4 as uuidv4 } from 'uuid';

// Input types for saveFormWithBlocks
interface SaveFormInput {
  form_id: string;
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
      form_id,
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
    // Make sure to include an 'id' field that matches 'form_id' since the PostgreSQL function
    // looks for 'id' but our frontend uses 'form_id'
    const formDataObj = {
      id: form_id, // Add 'id' matching the form_id to fix the database function compatibility
      form_id,
      title,
      description,
      workspace_id,
      created_by,
      status,
      theme,
      settings
    };
    
    console.log('===== DEBUG: saveFormWithBlocks =====');
    console.log('Input formData:', JSON.stringify(formDataObj, null, 2));
    console.log('Input blocks count:', blocks.length);
    if (blocks.length > 0) {
      console.log('Sample block input:', JSON.stringify(blocks[0], null, 2));
    }
    
    // Map blocks to database format with proper UUID handling
    const blocksData = blocks.map((frontendBlock, index) => {
      // Check for any unexpected structure in block settings
      const blockSettings = frontendBlock.settings || {};
      console.log(`Block ${index} settings keys:`, Object.keys(blockSettings));
      
      // Look for potential presentation settings that might cause problems
      if (blockSettings.presentation) {
        console.log(`Block ${index} has presentation settings:`, blockSettings.presentation);
      }
      
      const { type, subtype } = mapToDbBlockType(frontendBlock.blockTypeId);
      
      // Generate a proper UUID if the ID isn't already a UUID format
      const blockId = frontendBlock.id.includes('-') && 
                     frontendBlock.id.length === 36 ? 
                     frontendBlock.id : uuidv4();
      
      // Create the DB-ready block object
      const dbBlock = {
        id: blockId,
        type,
        subtype,
        title: frontendBlock.title || '',
        description: frontendBlock.description || null,
        required: !!frontendBlock.required,
        order_index: frontendBlock.order || 0,
        settings: blockSettings
      };
      
      console.log(`Block ${index} transformed for DB:`, JSON.stringify(dbBlock, null, 2));
      return dbBlock;
    });
    
    // Log the exact payload being sent to the database function
    console.log('Payload being sent to database function:');
    console.log('p_form_data:', JSON.stringify(formDataObj, null, 2));
    console.log('p_blocks_data:', JSON.stringify(blocksData, null, 2));

    // Call the PostgreSQL function that handles empty arrays and UUID conversion
    console.log('Calling database function save_form_with_blocks_empty_safe...');
    const { data, error } = await supabase.rpc('save_form_with_blocks_empty_safe', {
      p_form_data: formDataObj,
      p_blocks_data: blocksData
    });
    
    // Handle errors if any
    if (error) {
      console.error('Error saving form with blocks:', error);
      throw error;
    }
    
    // Log the response from database function
    console.log('Response from database function:', JSON.stringify(data, null, 2));
    
    // Ensure data exists before accessing properties
    if (!data || !data.form) {
      console.error('Invalid data structure received:', JSON.stringify(data, null, 2));
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
