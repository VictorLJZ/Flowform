"use client"

import { memo, useMemo } from 'react'
import { getBezierPath, EdgeProps } from 'reactflow'
import { WorkflowEdgeData, Connection, Rule } from '@/types/workflow-types' 
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { FormBlock } from '@/types/block-types'; 

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
  const blocks = useFormBuilderStore(state => state.blocks)
  
  const connection = data?.connection || null;
  const isRulePath = data?.isRulePath || false;
  const rule = data?.rule || null;
  
  const sourceBlock = useMemo(() => {
    if (!connection?.sourceId) return null
    return blocks.find(block => block.id === connection.sourceId)
  }, [blocks, connection?.sourceId])
  
  const targetBlock = useMemo(() => {
    if (isRulePath && rule?.target_block_id) {
      return blocks.find(block => block.id === rule.target_block_id)
    } else if (!isRulePath && connection?.defaultTargetId) {
      return blocks.find(block => block.id === connection.defaultTargetId)
    }
    return null
  }, [blocks, connection?.defaultTargetId, isRulePath, rule?.target_block_id])
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.15
  })

  // Completely unified edge styles with no distinctions
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
  
  const edgeStyles = getEdgeStyles()
  // No condition text needed since we removed the labels

  if (!connection) return null; 

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
            fill="#000000" 
          />
        </marker>
      </defs>

      {/* Edge wrapper - completely non-interactive */}
      <g className="edge-wrapper">
        {/* Simple edge path without interaction elements */}
        
        {/* Main visible edge path with arrow */}
        <path
          id={id}
          d={edgePath}
          fill="none"
          markerEnd={`url(#arrow-${id})`}
          strokeDasharray="0" // Always solid line
          className="transition-colors duration-200"
          style={{
            strokeWidth: 1, // Consistent width
            stroke: '#000000', // Black for all paths
            strokeOpacity: 1,
            visibility: 'visible',
            pointerEvents: 'none' // Make non-interactive
          }}
        />
      </g>
      
      {/* Labels removed as requested */}
    </>
  )
}

export default memo(WorkflowEdge)