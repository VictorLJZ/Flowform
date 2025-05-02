import { createClient } from '@/lib/supabase/client';
import { mapToDbBlockType } from '@/utils/blockTypeMapping';
import type { FormBlock as FrontendFormBlock } from '@/types/block-types';
import { FormVersion, FormBlockVersion } from '@/types/form-version-types';

/**
 * Create a new form version and associated block versions
 * @param formId The ID of the form
 * @param createdBy User ID of version creator
 * @param blocks Current blocks in the form
 * @returns The newly created form version
 */
export async function createFormVersion(
  formId: string,
  createdBy: string,
  blocks: FrontendFormBlock[]
): Promise<FormVersion | null> {
  const supabase = createClient();
  
  try {
    // Get the last version number
    const { data: lastVersion } = await supabase
      .from('form_versions')
      .select('version_number')
      .eq('form_id', formId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();
      
    const newVersionNumber = lastVersion ? lastVersion.version_number + 1 : 1;
    
    // Create a new form version
    const { data: formVersion, error: insertError } = await supabase
      .from('form_versions')
      .insert({
        form_id: formId,
        version_number: newVersionNumber,
        created_by: createdBy
      })
      .select()
      .single();
      
    if (insertError) {
      console.error('Error creating form version:', insertError);
      return null;
    }
    
    // Get current blocks from database (to handle deleted blocks)
    const { data: existingBlocks, error: blocksError } = await supabase
      .from('form_blocks')
      .select('id')
      .eq('form_id', formId);
      
    if (blocksError) {
      console.error('Error fetching existing blocks:', blocksError);
      return null;
    }
    
    // Prepare block versions for all current blocks
    const blockVersions: Partial<FormBlockVersion>[] = blocks.map(block => {
      const { type, subtype } = mapToDbBlockType(block.blockTypeId);
      return {
        block_id: block.id,
        form_version_id: formVersion.id,
        title: block.title || '',
        description: block.description || null,
        type,
        subtype,
        required: !!block.required,
        order_index: block.order || 0,
        settings: block.settings || {},
        is_deleted: false
      };
    });
    
    // Handle deleted blocks (ones that existed in previous version but not in this one)
    if (existingBlocks && existingBlocks.length > 0) {
      const currentBlockIds = new Set(blocks.map(b => b.id));
      
      const deletedBlocks = existingBlocks
        .filter(b => !currentBlockIds.has(b.id))
        .map(b => ({
          block_id: b.id,
          form_version_id: formVersion.id,
          title: '',        // These fields will be populated from the database
          description: null, // in a follow-up query
          type: 'unknown',  // Placeholder
          subtype: 'unknown', // Placeholder
          required: false,
          order_index: 0,
          settings: {},
          is_deleted: true
        }));
        
      if (deletedBlocks.length > 0) {
        // Fetch actual data for deleted blocks
        const { data: deletedBlocksData } = await supabase
          .from('form_blocks')
          .select('*')
          .in('id', deletedBlocks.map(b => b.block_id));
          
        if (deletedBlocksData && deletedBlocksData.length > 0) {
          // Update deleted blocks with actual data
          deletedBlocks.forEach(deletedBlock => {
            const blockData = deletedBlocksData.find(b => b.id === deletedBlock.block_id);
            if (blockData) {
              deletedBlock.title = blockData.title;
              deletedBlock.description = blockData.description;
              deletedBlock.type = blockData.type;
              deletedBlock.subtype = blockData.subtype;
              deletedBlock.required = blockData.required;
              deletedBlock.order_index = blockData.order_index;
              deletedBlock.settings = blockData.settings;
            }
          });
        }
        
        blockVersions.push(...deletedBlocks);
      }
    }
    
    // Insert block versions
    if (blockVersions.length > 0) {
      const { error: blockVersionError } = await supabase
        .from('form_block_versions')
        .insert(blockVersions);
        
      if (blockVersionError) {
        console.error('Error creating block versions:', blockVersionError);
      }
    }
    
    return formVersion;
  } catch (error) {
    console.error('Error in createFormVersion:', error);
    return null;
  }
}
