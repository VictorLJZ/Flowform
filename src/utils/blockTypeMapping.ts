"use client"

import { BlockType } from '@/types/block-types';
import { StaticBlockSubtype } from '@/types/supabase-types';

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
  console.log('DEBUG - mapToDbBlockType called with:', blockTypeId);
  
  // Handle null or undefined blockTypeId (defensive programming)
  if (!blockTypeId) {
    console.warn('WARNING: mapToDbBlockType received null/undefined blockTypeId, defaulting to static/short_text');
    return { type: 'static', subtype: 'short_text' };
  }
  
  // Dynamic blocks
  if (blockTypeId === 'ai_conversation') {
    console.log('DEBUG - Mapping ai_conversation to dynamic/dynamic');
    return { type: 'dynamic', subtype: 'dynamic' };
  }

  // Use distinct subtypes for each choice block type
  if (blockTypeId === 'dropdown') {
    console.log('DEBUG - Mapping dropdown to static/dropdown');
    return { type: 'static', subtype: 'dropdown' };
  }
  
  if (blockTypeId === 'checkbox_group') {
    console.log('DEBUG - Mapping checkbox_group to static/checkbox_group');
    return { type: 'static', subtype: 'checkbox_group' };
  }

  // For layout blocks that might use a generic subtype
  if (blockTypeId === 'redirect' || blockTypeId === 'page_break') {
    console.log(`DEBUG - Mapping layout block ${blockTypeId} to layout/short_text`);
    return { type: 'layout', subtype: 'short_text' };
  }

  // Validate if blockTypeId is a valid StaticBlockSubtype
  const validSubtypes = [
    'short_text', 'long_text', 'email', 'date', 'multiple_choice', 
    'checkbox_group', 'dropdown', 'number', 'scale', 'yes_no'
  ];
  
  if (!validSubtypes.includes(blockTypeId)) {
    console.warn(`WARNING: Unknown blockTypeId '${blockTypeId}', defaulting to static/short_text`);
    return { type: 'static', subtype: 'short_text' };
  }
  
  // For most other blocks, the blockTypeId is already the subtype
  console.log(`DEBUG - Using ${blockTypeId} directly as static/${blockTypeId}`);
  return { 
    type: 'static', 
    subtype: blockTypeId as StaticBlockSubtype 
  };
}

/**
 * Map database type and subtype to the block type ID
 * This is the reverse of mapToDbBlockType and handles the
 * special case of mapping dynamic blocks back to their specific types
 * 
 * @param type - The database block type
 * @param subtype - The database block subtype
 * @returns Block type ID for the registry
 */
export function mapFromDbBlockType(type: BlockType, subtype: string | StaticBlockSubtype | 'dynamic'): string {
  // Log input values for debugging
  console.log('Mapping DB -> Frontend:', { type, subtype });
  
  // Check for dynamic blocks with more permissive matching
  // This covers case variations and whitespace issues
  if (String(type).toLowerCase().trim() === 'dynamic' && 
      String(subtype).toLowerCase().trim() === 'dynamic') {
    console.log('Dynamic block identified, mapping to ai_conversation');
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
