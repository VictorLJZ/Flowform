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
  
  // Get colors based on block type
  const blockColors = getBlockTypeColors(block.blockTypeId);
  
  return (
    <div 
      className={cn(
        "p-4 rounded-md border shadow-sm bg-white",
        "min-w-[220px]",
        "relative",
        "transition-all duration-200",
        isConnectionTarget && "ring-2 ring-black ring-opacity-70 shadow-md",
        selected && "ring-2 ring-amber-400 ring-opacity-80 shadow-lg shadow-amber-100"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Source handle (output) - right side - Larger fixed size */}
      <div className="absolute right-[-8px] top-1/2 transform -translate-y-1/2 z-10">
        {/* Semi-transparent background circle for better visibility */}
        <div className="absolute rounded-full bg-black/10 w-6 h-6 -right-1 -top-3"></div>
        <Handle 
          type="source" 
          position={Position.Right} 
          className={cn(
            "!w-4 !h-4 !min-w-[16px] !min-h-[16px] bg-black border-[1.5px] border-white",
            selected && "bg-amber-500"
          )}
          style={{ zIndex: 20, right: -4 }}
        />
      </div>
      
      {/* Target handle (input) - left side - Larger fixed size */}
      <div className="absolute left-[-8px] top-1/2 transform -translate-y-1/2 z-10">
        {/* Semi-transparent background circle for better visibility */}
        <div className="absolute rounded-full bg-black/10 w-6 h-6 -left-1 -top-3"></div>
        <Handle 
          type="target" 
          position={Position.Left} 
          className={cn(
            "!w-4 !h-4 !min-w-[16px] !min-h-[16px] bg-black border-[1.5px] border-white",
            selected && "bg-amber-500"
          )}
          style={{ zIndex: 20, left: -4 }}
        />
      </div>
      
      {/* Block content */}
      <div className="flex gap-2 items-center">
        <div 
          className={cn(
            "h-8 w-8 rounded-md flex items-center justify-center",
            selected && "bg-amber-100 text-amber-700"
          )}
          style={selected ? {} : { backgroundColor: blockColors.bg, color: blockColors.text }}
        >
          <Icon size={16} />
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
        </div>
      </div>

      {/* Selection glow effect */}
      {selected && (
        <div className="absolute inset-0 rounded-md pointer-events-none" 
          style={{
            background: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.15), transparent 70%)',
            zIndex: -1
          }}
        />
      )}
    </div>
  )
}

export default memo(WorkflowNode)