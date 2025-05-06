// src/app/dashboard/forms/builder/[formId]/components/workflow/workflow-node.tsx
"use client"

import { memo, useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
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
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { WorkflowNodeData } from '@/types/workflow-types'

// Icon map to match the block registry
const iconMap = {
  // Input blocks
  'short_text': FileText,
  'long_text': FileText,
  'email': Mail,
  'number': Hash,
  'date': Calendar,
  
  // Choice blocks
  'multiple_choice': List,
  'checkbox_group': CheckSquare,
  'dropdown': List,
  
  // Advanced blocks
  'ai_conversation': MessageSquare,
  
  // Integration blocks
  'hubspot': User,
  
  // Layout blocks
  'page_break': Bookmark,
  'redirect': ArrowUpRight,
  
  // Fallback for dynamic content
  'dynamic': Sparkles
} as const

// Category colors matching form-builder-block-selector.tsx
const categoryColors: Record<string, { bg: string, text: string }> = {
  "input": { bg: "#3b82f620", text: "#3b82f6" }, // Blue
  "choice": { bg: "#8b5cf620", text: "#8b5cf6" }, // Purple
  "advanced": { bg: "#22c55e20", text: "#22c55e" }, // Green
  "integration": { bg: "#f9731620", text: "#f97316" }, // Orange
  "layout": { bg: "#6366f120", text: "#6366f1" }, // Indigo
  "recommended": { bg: "#f43f5e20", text: "#f43f5e" }, // Rose
}

// Function to get the appropriate color for a block type
const getBlockTypeColors = (blockTypeId: string) => {
  if (blockTypeId.includes('text') || blockTypeId.includes('email') || 
      blockTypeId.includes('number') || blockTypeId.includes('date')) {
    return categoryColors.input;
  }
  
  if (blockTypeId.includes('multiple_choice') || blockTypeId.includes('checkbox') || 
      blockTypeId.includes('dropdown')) {
    return categoryColors.choice;
  }
  
  if (blockTypeId.includes('ai_conversation')) {
    return categoryColors.advanced;
  }
  
  if (blockTypeId.includes('hubspot')) {
    return categoryColors.integration;
  }
  
  if (blockTypeId.includes('page_break') || blockTypeId.includes('redirect')) {
    return categoryColors.layout;
  }
  
  // Default to input color if no match
  return categoryColors.input;
}

const WorkflowNode = ({ data, selected }: NodeProps<WorkflowNodeData>) => {
  const { block, isConnectionTarget } = data
  const Icon = iconMap[block.blockTypeId as keyof typeof iconMap] || FileText
  const [isHovered, setIsHovered] = useState(false)
  const [isOutputHandleHovered, setIsOutputHandleHovered] = useState(false)
  const [isInputHandleHovered, setIsInputHandleHovered] = useState(false)
  
  // Get colors based on block type
  const blockColors = getBlockTypeColors(block.blockTypeId);
  
  return (
    <div 
      className={cn(
        "p-4 rounded-md border shadow-sm bg-white",
        "min-w-[240px] h-[80px]", // Increased dimensions for better visibility
        "relative",
        "flex items-center", // Center content vertically
        isConnectionTarget && "ring-1 ring-green-500 ring-opacity-50",
        isHovered && "shadow-sm" // Add shadow on hover
      )}
      style={{ 
        willChange: 'transform', // Hardware acceleration for dragging
        transform: 'translateZ(0)' 
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Source handle (output) - right side - Arrow pointing right */}
      <div 
        className={cn(
          "absolute right-[-14px] top-1/2 transform -translate-y-1/2 z-10",
          isHovered || isOutputHandleHovered ? "opacity-100" : "opacity-70"
        )}
        onMouseEnter={() => setIsOutputHandleHovered(true)}
        onMouseLeave={() => setIsOutputHandleHovered(false)}
      >
        {/* Handle container with arrow icon */}
        <div 
          className={cn(
            "relative flex items-center justify-center",
            "w-8 h-8 rounded-full", // Increased size for better touch target
            isOutputHandleHovered ? "bg-black/10" : "bg-black/5",
            selected && "bg-amber-100"
          )}
        >
          <ArrowRight 
            size={16} 
            className={cn(
              selected ? "text-amber-500" : "text-black"
            )} 
          />
          {/* Actual ReactFlow handle - invisible but functional */}
          <Handle 
            type="source" 
            position={Position.Right} 
            className="!opacity-0 !border-0 !bg-transparent !w-8 !h-8"
            style={{ right: 0, zIndex: 20 }}
          />
        </div>
      </div>
      
      {/* Target handle (input) - left side */}
      <div 
        className={cn(
          "absolute left-[-14px] top-1/2 transform -translate-y-1/2 z-10",
          isHovered || isInputHandleHovered ? "opacity-100" : "opacity-70"
        )}
        onMouseEnter={() => setIsInputHandleHovered(true)}
        onMouseLeave={() => setIsInputHandleHovered(false)}
      >
        {/* Handle container with arrow icon */}
        <div 
          className={cn(
            "relative flex items-center justify-center",
            "w-8 h-8 rounded-full", // Increased size
            isInputHandleHovered ? "bg-black/10" : "bg-black/5",
            selected && "bg-amber-100"
          )}
        >
          <ArrowRight 
            size={16}
            className={cn(
              selected ? "text-amber-500" : "text-black"
            )} 
          />
          {/* Actual ReactFlow handle - invisible but functional */}
          <Handle 
            type="target" 
            position={Position.Left} 
            className="!opacity-0 !border-0 !bg-transparent !w-8 !h-8"
            style={{ left: 0, zIndex: 20 }}
          />
        </div>
      </div>
      
      {/* Block content */}
      <div className="flex gap-3 items-center w-full">
        <div 
          className={cn(
            "h-10 w-10 rounded-md flex items-center justify-center flex-shrink-0", // Larger icon
            selected && "bg-amber-100 text-amber-700"
          )}
          style={selected ? {} : { backgroundColor: blockColors.bg, color: blockColors.text }}
        >
          <Icon size={18} />
        </div>
        <div className="flex-1 overflow-hidden">
          <h4 className={cn(
            "font-medium text-sm truncate",
            selected && "text-amber-800"
          )}>
            {block.title || 'Untitled Block'}
          </h4>
          {block.description && (
            <p className="text-xs text-muted-foreground truncate">
              {block.description}
            </p>
          )}
          {/* If no description, add an empty element with same height to maintain consistency */}
          {!block.description && (
            <p className="text-xs text-muted-foreground truncate h-[16px]">
              &nbsp;
            </p>
          )}
        </div>
      </div>

      {/* Selection indicator - simplified */}
      {selected && (
        <div className="absolute inset-0 rounded-md pointer-events-none border border-amber-400" />
      )}
    </div>
  )
}

export default memo(WorkflowNode)