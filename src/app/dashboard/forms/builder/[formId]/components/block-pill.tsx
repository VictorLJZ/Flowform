"use client"

import React from 'react'
import { 
  FileText, 
  MessageSquare, 
  CheckSquare, 
  List, 
  Mail, 
  Hash, 
  Calendar,
  User,
  ArrowUpRight,
  Bookmark,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getBlockDefinition } from '@/registry/blockRegistry'
import { getBlockTypeColors } from '@/utils/block-utils'

interface BlockPillProps {
  block: {
    id: string;
    blockTypeId?: string;
    order_index?: number;
    title?: string;
    type?: string;
    subtype?: string; // Added for block type persistence fix
  } | null | undefined;
  index?: number;
  selected?: boolean;
  compact?: boolean; // For sidebar toggle states
  fallbackText?: string; // Optional fallback text when block is null/undefined
}

/**
 * BlockPill - Consistent UI component for representing blocks throughout the application
 * Used in form-builder-sidebar, workflow-node, and workflow-connection-sidebar
 */
export function BlockPill({ block, index, compact = false, fallbackText = "Select block..." }: BlockPillProps) {
  // Return fallback text if block is null or undefined
  if (!block) {
    return <span className="text-muted-foreground text-sm">{fallbackText}</span>;
  }
  
  // FIX FOR BLOCK TYPE PERSISTENCE ISSUE
  // If blockTypeId is a generic type (like "static"), use block.subtype instead if available
  let blockTypeId = '';
  
  // Check for invalid/generic blockTypeId values that should be substituted with subtype
  if (block.blockTypeId && ['static', 'dynamic', 'layout', 'integration'].includes(block.blockTypeId) && block.subtype) {
    // This is a critical fix: the blockTypeId is incorrectly set to the block type instead of subtype
    console.log(`🔥 CRITICAL FIX: BlockPill received invalid blockTypeId=${block.blockTypeId}, using block.subtype=${block.subtype} instead`);
    blockTypeId = block.subtype;
  } else {
    // Use the blockTypeId normally
    blockTypeId = block.blockTypeId || '';
  }
  
  const blockDef = getBlockDefinition(blockTypeId);
  
  // Console log for debugging
  console.log(`BlockPill rendering for blockTypeId: ${blockTypeId}, found definition:`, !!blockDef);
  
  // Get colors using the utility function from block-utils
  // This is more consistent than the inline logic and will work even without a blockDef
  const colorScheme = getBlockTypeColors(blockTypeId);
  const bgColor = colorScheme.bg;
  const textColor = colorScheme.text;
  
  // Extract the core block type (in case there's a prefix/path)
  let coreType = blockTypeId;
  if (blockTypeId && blockTypeId.includes('/')) {
    const parts = blockTypeId.split('/');
    coreType = parts[parts.length - 1];
  }
  
  // Log the block type for debugging
  console.log(`BlockPill: Finding icon for type ${blockTypeId}, core: ${coreType}`);
  
  // Instead of dynamically assigning different icon components to a variable,
  // we'll use a function that renders the appropriate icon based on the type
  const renderIcon = (size: number) => {
    // Check block definition icon first (highest priority)
    if (blockDef?.icon) {
      const DefinedIcon = blockDef.icon;
      return <DefinedIcon size={size} style={{ color: textColor }} />;
    }
    
    // Then use our switch statement for known types
    switch (coreType) {
      // Input blocks
      case 'short_text':
      case 'long_text':
        return <FileText size={size} style={{ color: textColor }} />;
      case 'email':
        return <Mail size={size} style={{ color: textColor }} />;
      case 'number':
        return <Hash size={size} style={{ color: textColor }} />;
      case 'date':
        return <Calendar size={size} style={{ color: textColor }} />;
      
      // Choice blocks
      case 'multiple_choice':
      case 'dropdown':
        return <List size={size} style={{ color: textColor }} />;
      case 'checkbox_group':
        return <CheckSquare size={size} style={{ color: textColor }} />;
      
      // Dynamic/AI blocks
      case 'ai_conversation':
      case 'dynamic':
        return <MessageSquare size={size} style={{ color: textColor }} />;
      
      // Layout blocks
      case 'page_break':
        return <Bookmark size={size} style={{ color: textColor }} />;
      case 'redirect':
        return <ArrowUpRight size={size} style={{ color: textColor }} />;
      
      // Integration blocks
      case 'hubspot':
        return <User size={size} style={{ color: textColor }} />;
      
      // Default fallback
      default:
        // If type contains "dynamic", use Sparkles icon
        if (coreType?.includes('dynamic')) {
          return <Sparkles size={size} style={{ color: textColor }} />;
        } else {
          console.log(`No icon mapping for ${coreType}, using default`);
          return <FileText size={size} style={{ color: textColor }} />;
        }
    }
  };
  
  // Figure out what number to display
  const displayIndex = index !== undefined 
    ? index + 1 
    : (block.order_index !== undefined ? block.order_index + 1 : 1);
  
  return (
    <div className="flex-shrink-0 flex items-center">
      <div
        className={cn(
          "rounded-full flex items-center justify-between",
          compact ? "h-6 px-1.5 w-9" : "h-6 px-2 w-11" 
        )}
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <span className={cn(
          "font-medium",
          compact ? "text-[10px]" : "text-xs"
        )}>
          {displayIndex}
        </span>
        {renderIcon(compact ? 14 : 16)}
      </div>
    </div>
  )
}
