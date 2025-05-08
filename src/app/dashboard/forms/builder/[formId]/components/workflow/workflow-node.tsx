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
  Sparkles
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
      {/* Source handle (output) - right side - Small grey dot */}
      <div 
        className={cn(
          "absolute right-[-10px] top-1/2 transform -translate-y-1/2 z-10",
          isHovered || isOutputHandleHovered ? "opacity-100" : "opacity-70"
        )}
        onMouseEnter={() => setIsOutputHandleHovered(true)}
        onMouseLeave={() => setIsOutputHandleHovered(false)}
      >
        {/* Handle container with grey dot */}
        <div 
          className={cn(
            "relative flex items-center justify-center",
            "w-5 h-5 rounded-full shadow-sm", // Smaller size with drop shadow
            isOutputHandleHovered ? "bg-gray-200" : "bg-gray-100",
            selected && "bg-amber-100"
          )}
          style={{
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
          }}
        >
          {/* Grey dot */}
          <div 
            className={cn(
              "w-2 h-2 rounded-full",
              selected ? "bg-amber-500" : "bg-gray-400"
            )}
          />
          {/* Actual ReactFlow handle - invisible but functional */}
          <Handle 
            type="source" 
            position={Position.Right} 
            className="!opacity-0 !border-0 !bg-transparent !w-5 !h-5"
            style={{ right: 0, zIndex: 20 }}
          />
        </div>
      </div>
      
      {/* Target handle (input) - completely disabled for cursor effects but still functional */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2" style={{ pointerEvents: 'none' }}>
        {/* Only the functional handle, no visual element and no hover effects */}
        <Handle 
          type="target" 
          position={Position.Left} 
          className="!opacity-0 !border-0 !bg-transparent !w-8 !h-8"
          style={{ 
            left: -5, 
            zIndex: 20,
            cursor: 'default',
            pointerEvents: 'none'
          }}
          isConnectable={true} /* Enable connecting TO this handle */
        />
      </div>
      
      {/* Block content */}
      <div className="flex gap-3 items-center w-full">
        <div className="flex-shrink-0 flex items-center">
          <div
            className={cn(
              "rounded-full flex items-center justify-between h-6 px-2 w-11"
            )}
            style={selected ? 
              { backgroundColor: "#fef3c7", color: "#b45309" } : 
              { backgroundColor: `${blockColors.bg}`, color: blockColors.text }
            }
          >
            <span className="font-medium text-xs">{block.order_index + 1}</span>
            <Icon size={16} />
          </div>
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