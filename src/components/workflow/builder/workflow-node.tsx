"use client"

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { BlockPill } from '@/components/form/builder/block-pill';
import { WorkflowNodeData } from '@/types/workflow-types';
import { cn } from '@/lib/utils';

// We're extending NodeProps to maintain type safety and for future extensibility
// This is not an empty interface as it inherits all properties from NodeProps with WorkflowNodeData
type WorkflowNodeProps = NodeProps<WorkflowNodeData>;

const WorkflowNode: React.FC<WorkflowNodeProps> = ({ data, selected }) => {
  const { block, isConnectionTarget } = data
  const [isHovered, setIsHovered] = useState(false)
  const [isOutputHandleHovered, setIsOutputHandleHovered] = useState(false)
  
  return (
    <div 
      className={cn(
        "rounded-md border shadow-sm bg-white",
        "min-w-[240px] h-[80px]", // Dimensions with reduced vertical padding
        "relative",
        "flex", // Keep it as flex but don't force center
        isConnectionTarget && "ring-1 ring-green-500 ring-opacity-50",
        isHovered && "shadow-sm" // Add shadow on hover
      )}
      style={{ 
        willChange: 'transform', // Hardware acceleration for dragging
        transform: 'translateZ(0)',
        padding: '10px 16px', // Set padding directly in inline styles
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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
      <div className="flex gap-3 items-center w-full my-auto" style={{ height: '100%' }}>
        <BlockPill 
          block={block} 
          selected={selected} 
        />
        <div className="flex-1 overflow-hidden flex flex-col justify-center" style={{ height: '100%' }}>
          <h4 className={cn(
            "font-medium text-sm truncate",
            selected && "text-amber-800"
          )}>
            {block.title || 'Untitled Block'}
          </h4>
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