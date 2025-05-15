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
  Sparkles,
  AlertTriangle
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
  // If block.subtype exists and block.subtype is not in blockDefinitions, use subtype
  // This handles cases where a new block type (subtype) was created based on an existing blockTypeId
  // but the blockTypeId itself hasn't been updated yet, or was reverted during development.
  let effectiveBlockTypeId = block.subtype;
  if (block.subtype && (!block.subtype || !getBlockDefinition(block.subtype))) {
    effectiveBlockTypeId = block.subtype as string;
  }

  // If effectiveBlockTypeId is still undefined, it's an unknown block
  if (effectiveBlockTypeId === undefined) {
    return (
      <div className="flex items-center space-x-2">
        <div className={cn(
          "flex items-center justify-center rounded-full bg-destructive text-destructive-foreground",
          compact ? "h-6 w-6" : "h-7 w-7"
        )}>
          <AlertTriangle size={compact ? 14 : 16} />
        </div>
        <span className={cn(
          "font-medium text-destructive",
          compact ? "text-xs" : "text-sm"
        )}>
          Unknown Block (No ID)
        </span>
      </div>
    );
  }

  const blockTypeId = effectiveBlockTypeId; // Now guaranteed to be a string
  
  const blockDef = getBlockDefinition(blockTypeId);

  // If block definition is not found, display a fallback or error state
  if (!blockDef) {
    return (
      <div className="flex items-center space-x-2">
        <div className={cn(
          "flex items-center justify-center rounded-full bg-destructive text-destructive-foreground",
          compact ? "h-6 w-6" : "h-7 w-7"
        )}>
          <AlertTriangle size={compact ? 14 : 16} />
        </div>
        <span className={cn(
          "font-medium text-destructive",
          compact ? "text-xs" : "text-sm"
        )}>
          Unknown Block
        </span>
      </div>
    );
  }

  const coreType = blockTypeId.split('/').pop() as string;
  
  // Get colors using the utility function from block-utils
  // This is more consistent than the inline logic and will work even without a blockDef
  const colorScheme = getBlockTypeColors(blockTypeId);
  const bgColor = colorScheme.bg;
  const textColor = colorScheme.text;
  
  const renderIcon = (size: number) => {
    // Check block definition icon first (highest priority)
    if (blockDef?.icon) {
      const DefinedIcon = blockDef.icon;
      // Use type assertion to handle icon props properly
      return <DefinedIcon 
        {...{ size, style: { color: textColor } } as React.ComponentProps<typeof DefinedIcon>} 
      />;
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
