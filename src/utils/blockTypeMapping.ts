"use client"

import { StaticBlockSubtype, BlockType } from '@/types/supabase-types';

/**
 * Map frontend block types to database subtypes
 * 
 * @param blockTypeId - The block type from the registry
 * @returns Object with database type and subtype
 */
export function mapToDbBlockType(blockTypeId: string): { 
  type: BlockType, 
  subtype: StaticBlockSubtype | 'dynamic' 
} {
  // Dynamic blocks
  if (blockTypeId === 'ai-conversation') {
    return { type: 'dynamic', subtype: 'dynamic' };
  }

  // Static blocks
  const staticMappings: Record<string, StaticBlockSubtype> = {
    'short-text': 'text_short',
    'long-text': 'text_long',
    'email': 'email',
    'number': 'number',
    'date': 'date',
    'multiple-choice': 'multiple_choice',
    'checkbox': 'multiple_choice',
    'dropdown': 'multiple_choice',
    'redirect': 'text_short',
    'page-break': 'text_short',
  };

  const subtype = staticMappings[blockTypeId] || 'text_short';
  return { type: 'static', subtype };
}

/**
 * Map database subtypes back to frontend block types
 * 
 * @param type - The database block type
 * @param subtype - The database block subtype
 * @returns Block type ID for the registry
 */
export function mapFromDbBlockType(type: BlockType, subtype: StaticBlockSubtype | 'dynamic'): string {
  if (type === 'dynamic' && subtype === 'dynamic') {
    return 'ai-conversation';
  }

  const reverseStaticMappings: Record<string, string> = {
    'text_short': 'short-text',
    'text_long': 'long-text',
    'email': 'email',
    'number': 'number',
    'date': 'date',
    'multiple_choice': 'multiple-choice',
  };

  return reverseStaticMappings[subtype] || 'short-text';
}
