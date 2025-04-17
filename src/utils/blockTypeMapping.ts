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

  // Use distinct subtypes for each choice block type
  if (blockTypeId === 'dropdown') {
    return { type: 'static', subtype: 'dropdown' };
  }
  
  if (blockTypeId === 'checkbox_group') {
    return { type: 'static', subtype: 'checkbox_group' };
  }

  // For layout blocks that might use a generic subtype
  if (blockTypeId === 'redirect' || blockTypeId === 'page_break') {
    return { type: 'layout', subtype: 'short_text' };
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
  
  // Explicitly handle each supported subtype
  switch (subtype) {
    case 'short_text':
    case 'long_text':
    case 'email':
    case 'date':
    case 'multiple_choice':
    case 'checkbox_group':
    case 'dropdown':
    case 'number':
    case 'scale':
    case 'yes_no':
      return subtype;
    default:
      return subtype; // Fallback for unrecognized subtypes
  }
}
