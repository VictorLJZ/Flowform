"use client"

import React from 'react'
import { iconMap, getBlockTypeColors } from '@/utils/block-utils'
import { FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BlockPillProps {
  block: {
    id: string;
    blockTypeId?: string;
    order_index?: number;
    title?: string;
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
export function BlockPill({ block, index, selected = false, compact = false, fallbackText = "Select block..." }: BlockPillProps) {
  // Return fallback text if block is null or undefined
  if (!block) {
    return <span className="text-muted-foreground text-sm">{fallbackText}</span>;
  }
  
  const blockColors = getBlockTypeColors(block.blockTypeId || '');
  const Icon = iconMap[block.blockTypeId as keyof typeof iconMap] || FileText;
  
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
        style={selected 
          ? { backgroundColor: "#fef3c7", color: "#b45309" } 
          : { backgroundColor: blockColors.bg, color: blockColors.text }}
      >
        <span className={cn(
          "font-medium",
          compact ? "text-[10px]" : "text-xs"
        )}>
          {displayIndex}
        </span>
        <Icon size={compact ? 14 : 16} />
      </div>
    </div>
  )
}
