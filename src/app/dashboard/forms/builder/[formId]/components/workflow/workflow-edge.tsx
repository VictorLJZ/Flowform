"use client"

import { memo, useMemo, useState } from 'react'
import { EdgeLabelRenderer, getBezierPath, EdgeProps } from 'reactflow'
import { WorkflowEdgeData, Connection, Rule } from '@/types/workflow-types' 
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { getConditionSummary } from '@/utils/workflow/condition-utils';
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
  selected,
}: EdgeProps<WorkflowEdgeData>) => {
  const blocks = useFormBuilderStore(state => state.blocks)
  const selectElement = useFormBuilderStore(state => state.selectElement)
  
  const connection = data?.connection || null;
  
  const sourceBlock = useMemo(() => {
    if (!connection?.sourceId) return null
    return blocks.find(block => block.id === connection.sourceId)
  }, [blocks, connection?.sourceId])
  
  const targetBlock = useMemo(() => {
    if (!connection?.defaultTargetId) return null
    return blocks.find(block => block.id === connection.defaultTargetId)
  }, [blocks, connection?.defaultTargetId])
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.15
  })

  const getEdgeStyles = () => {
    const sourceBlockType = sourceBlock?.blockTypeId || 'unknown'
    
    const isConditional = !!(connection?.rules && connection.rules.length > 0);
    const hasActualConditions = isConditional && connection!.rules!.some(rule => 
      rule.condition_group && rule.condition_group.conditions && rule.condition_group.conditions.length > 0
    );

    const firstRuleWithConditions = connection?.rules?.find(rule => rule.condition_group && rule.condition_group.conditions && rule.condition_group.conditions.length > 0);
    const operatorType = firstRuleWithConditions?.condition_group.conditions[0]?.operator || '';

    const baseColor = '#000000'
    const goldColor = '#f59e0b'
    
    let dashArray = '0'
    const edgeWidth = selected ? 1.5 : 1
    
    if (!isConditional || !hasActualConditions) { 
      dashArray = '0' 
    } else if (operatorType === 'equals') {
      dashArray = '0'
    } else if (operatorType === 'not_equals') {
      dashArray = '5,3'
    } else if (operatorType.includes('greater') || operatorType.includes('less')) {
      dashArray = '10,3'
    } else if (isConditional) { 
      dashArray = '3,3';
    }

    return {
      stroke: baseColor,
      goldColor,
      strokeWidth: edgeWidth,
      strokeDasharray: dashArray,
      transition: 'stroke 0.2s, stroke-width 0.2s',
      sourceBlockType,
      hasConditions: hasActualConditions,
      isConditional,
      conditionField: firstRuleWithConditions?.condition_group.conditions[0]?.field || '', 
      operatorType
    }
  }
  
  const edgeStyles = getEdgeStyles()
  
  const conditionText = useMemo(() => {
    if (!connection || !sourceBlock) return 'Connecting...'; 
    return getConditionSummary(connection, sourceBlock, sourceBlock.blockTypeId);
  }, [connection, sourceBlock]);

  if (!connection) return null; 

  const [isHovered, setIsHovered] = useState(false);

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
            fill={selected || isHovered ? edgeStyles.goldColor : edgeStyles.stroke} 
          />
        </marker>
      </defs>

      {/* Edge wrapper for hover detection */}
      <g 
        className={`edge-wrapper ${selected ? 'selected' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => selectElement(id)}
        style={{ cursor: 'pointer' }}
      >
        {/* Enhanced background path for easier interaction */}
        {(selected || isHovered) && (
          <path
            d={edgePath}
            stroke={selected ? '#fff8e6' : '#e5e7eb'}
            strokeWidth={10}
            strokeOpacity={0.5}
            fill="none"
            pointerEvents="stroke"
          />
        )}
        
        {/* Main visible edge path with arrow */}
        <path
          id={id}
          d={edgePath}
          fill="none"
          markerEnd={`url(#arrow-${id})`}
          strokeDasharray={edgeStyles.strokeDasharray}
          className="pointer-events-stroke cursor-pointer transition-colors duration-200"
          style={{
            strokeWidth: selected || isHovered ? edgeStyles.strokeWidth + 1 : edgeStyles.strokeWidth,
            stroke: selected || isHovered ? '#f59e0b' : '#000000',
            strokeOpacity: 1,
            visibility: 'visible'
          }}
        />
      </g>
      
      {/* Enhanced label with clearer formatting - position ABOVE the edge */}
      <EdgeLabelRenderer>
        <div 
          className={`
            nodrag nopan px-3 py-2 rounded-md text-xs border flex gap-2 font-medium
            absolute pointer-events-auto max-w-[280px] z-[9999] opacity-100 transition-colors
            ${selected ? 'bg-amber-50 border-amber-500 text-amber-600 shadow-md' : 
              isHovered ? 'bg-white border-amber-300 text-amber-700 shadow-lg' : 
              'bg-white border-slate-200 text-slate-800 shadow-sm'}
          `}
          style={{
            transform: `translate(-50%, -100%) translate(${labelX}px,${labelY}px)`,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}
          data-edge-id={id}
        >
          <div className="overflow-hidden flex flex-col">
            <span className="whitespace-normal hyphens-auto break-words leading-tight">
              {conditionText}
            </span>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export default memo(WorkflowEdge)