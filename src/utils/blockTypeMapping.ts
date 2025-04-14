"use client"

import { StaticBlockSubtype, BlockType } from '@/types/supabase-types';

/**
 * Map block types to database type and subtype
 * 
 * @param blockTypeId - The block type from the registry
 * @returns Object with database type and subtype
 */
export function mapToDbBlockType(blockTypeId: string): { 
  type: BlockType, 
  subtype: StaticBlockSubtype | 'dynamic' 
} {
  // Dynamic blocks
  if (blockTypeId === 'ai_conversation') {
    return { type: 'dynamic', subtype: 'dynamic' };
  }

  // For dropdowns and checkboxes that share the multiple_choice subtype
  if (blockTypeId === 'dropdown' || blockTypeId === 'checkbox_group') {
    return { type: 'static', subtype: 'multiple_choice' };
  }

  // For layout blocks that might use a generic subtype
  if (blockTypeId === 'redirect' || blockTypeId === 'page_break') {
    return { type: 'layout', subtype: 'text_short' };
  }

  // For most other blocks, the blockTypeId is already the subtype
  return { 
    type: 'static', 
    subtype: blockTypeId as StaticBlockSubtype 
  };
}

/**
 * Map database type and subtype to the block type ID
 * This function is for compatibility with any legacy code
 * 
 * @param type - The database block type
 * @param subtype - The database block subtype
 * @returns Block type ID for the registry
 */
export function mapFromDbBlockType(type: BlockType, subtype: StaticBlockSubtype | 'dynamic'): string {
  if (type === 'dynamic' && subtype === 'dynamic') {
    return 'ai_conversation';
  }
  
  // For most cases now, the subtype is directly the block type ID
  return subtype;
}
