"use client"

import React from 'react'
import { FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getBlockDefinition } from '@/registry/blockRegistry'

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
export function BlockPill({ block, index, compact = false, fallbackText = "Select block..." }: BlockPillProps) {
  // Return fallback text if block is null or undefined
  if (!block) {
    return <span className="text-muted-foreground text-sm">{fallbackText}</span>;
  }
  
  // Get block definition directly from registry
  const blockDef = getBlockDefinition(block.blockTypeId || '');
  
  // Set default colors based on block category
  let bgColor = "#3b82f620"; // Default blue (input) background
  let textColor = "#3b82f6"; // Default blue (input) text
  
  // Set colors based on category from block definition
  if (blockDef?.category) {
    const category = blockDef.category;
    
    if (category === 'input') {
      bgColor = "#3b82f620";
      textColor = "#3b82f6"; // Blue
    } else if (category === 'choice') {
      bgColor = "#8b5cf620";
      textColor = "#8b5cf6"; // Purple
    } else if (category === 'advanced') {
      bgColor = "#22c55e20";
      textColor = "#22c55e"; // Green
    } else if (category === 'integration') {
      bgColor = "#f9731620";
      textColor = "#f97316"; // Orange
    } else if (category === 'layout') {
      bgColor = "#6366f120";
      textColor = "#6366f1"; // Indigo
    } else if (category === 'recommended') {
      bgColor = "#f43f5e20";
      textColor = "#f43f5e"; // Rose
    }
  }
  
  // Use icon directly from block definition
  const Icon = blockDef?.icon || FileText;
  
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
        <Icon 
          size={compact ? 14 : 16} 
          style={{ color: textColor }} 
        />
      </div>
    </div>
  )
}
