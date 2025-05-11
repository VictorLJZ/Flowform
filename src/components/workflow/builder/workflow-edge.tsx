"use client"

import React from 'react';
import { getBezierPath, EdgeProps } from 'reactflow';
import { memo } from 'react';
import { WorkflowEdgeData } from '@/types/workflow-types'; 
import { AlertTriangle } from 'lucide-react';

const WorkflowEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<WorkflowEdgeData>) => {
  // const blocks = useFormBuilderStore(state => state.blocks) // Not currently used
  
  const connection = data?.connection || null;
  // These variables are not currently used in the component
  // const isRulePath = data?.isRulePath || false
  // const rule = data?.rule || null;
  
  // This variable is not directly used in the component
  /*
  const sourceBlock = useMemo(() => {
    if (!connection?.sourceId) return null
    return blocks.find(block => block.id === connection.sourceId)
  }, [blocks, connection?.sourceId])
  */
  
  // We don't need to use targetBlock in this component, but keeping the logic for future reference
  // const targetBlock = useMemo(() => {
  //   if (isRulePath && rule?.target_block_id) {
  //     return blocks.find(block => block.id === rule.target_block_id)
  //   } else if (!isRulePath && connection?.defaultTargetId) {
  //     return blocks.find(block => block.id === connection.defaultTargetId)
  //   }
  //   return null
  // }, [blocks, connection?.defaultTargetId, isRulePath, rule?.target_block_id])
  
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.15
  })

  // Completely unified edge styles with no distinctions
  // This function is not currently used in the component
  /*
  const getEdgeStyles = () => {
    const sourceBlockType = sourceBlock?.blockTypeId || 'unknown'
    
    // All paths look identical - no visual distinctions
    return {
      stroke: '#000000', // black color
      strokeWidth: 1, // consistent line width
      strokeDasharray: '0', // solid line
      sourceBlockType
    }
  }
  */
  
  // We can use getEdgeStyles() directly in the JSX if needed
  // No condition text needed since we removed the labels

  if (!connection) return null; 

  // Check if this edge is part of a cycle (infinite loop) in the workflow
  const isInCycle = data?.inCycle || false;
  
  // Calculate midpoint of the path for placing the warning icon
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  
  return (
    <>
      {/* Define a unique marker for this edge */}
      <defs>
        <marker
          id={`arrow-${id}`}
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="4" 
          markerHeight="4"
          orient="auto"
        >
          <path 
            d="M 0 0 L 10 5 L 0 10 z" 
            fill={isInCycle ? '#ef4444' : '#000000'} 
          />
        </marker>
      </defs>

      {/* Edge wrapper */}
      <g className="edge-wrapper">
        {/* Main visible edge path with arrow */}
        <path
          id={id}
          d={edgePath}
          fill="none"
          markerEnd={`url(#arrow-${id})`}
          strokeDasharray={isInCycle ? '5,3' : '0'} // Dashed line for cycles
          className="transition-colors duration-200"
          style={{
            strokeWidth: isInCycle ? 2 : 1, // Thicker line for cycles
            stroke: isInCycle ? '#ef4444' : '#000000', // Red for cycles
            strokeOpacity: 1,
            visibility: 'visible',
            pointerEvents: 'none'
          }}
        />
        
        {/* Warning icon for cycle detection */}
        {isInCycle && (
          <foreignObject
            width={22}
            height={22}
            x={midX - 11}
            y={midY - 11}
            className="overflow-visible pointer-events-none"
          >
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white border border-red-500 shadow-sm">
              <AlertTriangle size={14} className="text-red-500" />
            </div>
          </foreignObject>
        )}
      </g>
    </>
  )
}

export default memo(WorkflowEdge)