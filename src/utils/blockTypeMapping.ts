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
  console.log('💼🔢🖇👓🚀 MAP FUNCTION: Mapping DB -> Frontend:', { type, subtype });
  console.log(`💼🔢🖇👓🚀 MAP FUNCTION: DB type=${type}, subtype=${subtype}, type of subtype=${typeof subtype}`);
  
  // Special case for dynamic blocks
  if (String(type).toLowerCase().trim() === 'dynamic' && 
      String(subtype).toLowerCase().trim() === 'dynamic') {
    console.log('Dynamic block identified, mapping to ai_conversation');
    return 'ai_conversation';
  }
  
  // Special case for layout blocks
  if (String(type).toLowerCase().trim() === 'layout') {
    if (subtype === 'short_text') {
      // Check for specific layout block types
      // We'll need to make an educated guess based on the registry's allowed values
      // This is a limitation since we're losing information in the DB mapping
      // Better would be to store the original blockTypeId in the DB
      console.log('Layout block detected, checking for specific layout type');
      return 'page_break'; // Default to page_break - consider enhancing this logic
    }
  }
  
  // Map special cases for choice blocks that need specific IDs
  if (type === 'static') {
    switch (String(subtype).toLowerCase().trim()) {
      // Direct mappings where subtype matches blockTypeId
      case 'short_text':
      case 'long_text':
      case 'email':
      case 'date':
      case 'number':
      case 'multiple_choice':
      case 'checkbox_group':
      case 'dropdown':
      case 'scale':
      case 'yes_no':
        console.log(`Direct mapping for ${subtype}`);
        return subtype;
      
      // Handle any other cases here
      default:
        console.log(`Unknown subtype: ${subtype}, using as-is`);
        return String(subtype);
    }
  }
  
  // If we can't determine a specific mapping, return the subtype
  // This is a fallback that keeps existing behavior
  return String(subtype);
}
