"use client"

import { memo, useMemo, useCallback, useState } from 'react'
import { EdgeLabelRenderer, getBezierPath, EdgeProps } from 'reactflow'
import { WorkflowEdgeData } from '@/types/workflow-types'
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { Trash2 } from 'lucide-react'


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
  const removeConnection = useFormBuilderStore(state => state.removeConnection)
  
  // Get the connection data for consistent access
  const connection = data?.connection || null;
  
  // Get the source block details to determine edge style
  const sourceBlock = useMemo(() => {
    if (!connection?.sourceId) return null
    return blocks.find(block => block.id === connection.sourceId)
  }, [blocks, connection?.sourceId])
  
  // Get the target block details for condition display
  useMemo(() => {
    if (!connection?.targetId) return null
    return blocks.find(block => block.id === connection.targetId)
  }, [blocks, connection?.targetId])
  
  // Use straighter lines between nodes
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.15 // Slight curve for better visibility
  })

  // Handle edge deletion
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (id) {
      console.log(`Deleting connection with id: ${id}`);
      removeConnection(id);
    }
  }, [id, removeConnection]);

  // Determine edge style based on block type and condition
  const getEdgeStyles = () => {
    const sourceBlockType = sourceBlock?.blockTypeId || 'unknown'
    const hasConditions = !!(connection?.conditions && connection?.conditions.length > 0)
    const isConditional = connection?.conditionType === 'conditional'
    const conditionField = hasConditions ? connection?.conditions[0]?.field || '' : ''
    const operatorType = hasConditions ? connection?.conditions[0]?.operator || '' : ''
    
    // Edge colors - always use gold for selected state
    const baseColor = '#000000' // Black for normal edges
    const goldColor = '#f59e0b' // Amber-500 for selected/hovered edges
    
    // Style settings - make edges thinner and more subtle
    let dashArray = '0' // solid line by default
    const edgeWidth = selected ? 1.5 : 1 // Thinner lines for better aesthetics
    
    // Style based on condition type and presence
    if (!isConditional || !hasConditions) {
      dashArray = '0' // solid line = "always" connection
    } else if (operatorType === 'equals') {
      dashArray = '0' // solid line for "equals" conditions
    } else if (operatorType === 'not_equals') {
      dashArray = '5,3' // dotted for "not equals"
    } else if (operatorType.includes('greater') || operatorType.includes('less')) {
      dashArray = '10,3' // dashed for comparison
    }

    return {
      stroke: baseColor, // Always use base color for normal state
      goldColor, // Store gold color for selected/hover states
      strokeWidth: edgeWidth,
      strokeDasharray: dashArray,
      transition: 'stroke 0.2s, stroke-width 0.2s',
      sourceBlockType,
      hasConditions,
      isConditional,
      conditionField,
      operatorType
    }
  }
  
  const edgeStyles = getEdgeStyles()
  
  // Format condition text
  const formatCondition = () => {
    // Check if we have any conditions
    if (!connection?.conditions || connection.conditions.length === 0 || connection.conditionType !== 'conditional') {
      return connection?.conditionType === 'fallback' ? 'Fallback path' : 'Always proceed';
    }
    
    // For multiple conditions, just show the first one for simplicity in the edge display
    const primaryCondition = connection.conditions[0];
    const { field, operator, value } = primaryCondition;
    
    // Format field name more clearly
    let fieldDisplay = field;
    let choiceValue = '';
    
    if (field === 'answer') {
      fieldDisplay = 'Answer';
    } else if (field === 'selected') {
      fieldDisplay = 'Selected';
    } else if (field === 'rating') {
      fieldDisplay = 'Rating';
    } else if (field.startsWith('choice:')) {
      // For choice fields, extract the display part, removing the index suffix
      // The format is now choice:value_index
      const choiceWithIndex = field.split(':')[1];
      // Extract just the choice value without the index
      choiceValue = choiceWithIndex.split('_')[0];
      fieldDisplay = `Option "${choiceValue}"`;
    }
    
    // Format operator with more clarity
    let operatorDisplay;
    switch (operator) {
      case 'equals': operatorDisplay = 'is'; break;
      case 'not_equals': operatorDisplay = 'is not'; break;
      case 'contains': operatorDisplay = 'contains'; break;
      case 'greater_than': operatorDisplay = 'is greater than'; break;
      case 'less_than': operatorDisplay = 'is less than'; break;
      default: operatorDisplay = operator;
    }
    
    // Format value more clearly
    let valueDisplay = `${value}`;
    if (typeof value === 'boolean') {
      valueDisplay = value ? 'Yes' : 'No';
    }
    
    // Handle special cases for clearer messaging
    if (field.startsWith('choice:')) {
      return operator === 'equals' 
        ? `"${choiceValue}" is selected`
        : `"${choiceValue}" is not selected`;
    }
    
    // Special case for checkboxes
    if (field === 'selected' && operator === 'equals') {
      return value 
        ? `Checked` 
        : `Not checked`;
    }
    
    // Special case for ratings
    if (field === 'rating') {
      return `Rating ${operatorDisplay} ${valueDisplay}`;
    }
    
    // Default formatting without arrow and target name
    return `${fieldDisplay.toLowerCase()} ${operatorDisplay} ${valueDisplay}`;
  }
  
  const condition = formatCondition();
  
  // Track hover state for the edge
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
              {condition}
            </span>
          </div>
        </div>
      </EdgeLabelRenderer>
      
      {/* Delete button - shown on hover/selection */}
      <EdgeLabelRenderer>
        <button
          type="button"
          onClick={handleDelete}
          className={`
            nodrag nopan w-7 h-7 flex items-center justify-center 
            bg-red-100 hover:bg-red-200 text-red-600 rounded-full border border-red-300 
            group edge-delete-button absolute pointer-events-auto z-20 
            shadow-sm transition-all duration-200
            ${selected || isHovered ? 'opacity-100' : 'opacity-0'}
          `}
          style={{
            transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px,${(sourceY + targetY) / 2 - 60}px)`
          }}
          aria-label="Delete connection"
          title="Delete connection"
          data-edge-id={id}
        >
          <Trash2 size={14} className="group-hover:text-red-700" />
        </button>
      </EdgeLabelRenderer>
    </>
  )
}

export default memo(WorkflowEdge)