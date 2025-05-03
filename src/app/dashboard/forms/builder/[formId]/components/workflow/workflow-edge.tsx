"use client"

import { memo, useMemo, useCallback } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, EdgeProps, MarkerType, useReactFlow } from 'reactflow'
import { WorkflowEdgeData } from '@/types/workflow-types'
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { Check, ArrowRight, Hash, AlertCircle, X, ChevronUp, ChevronDown, ListFilter, Trash2 } from 'lucide-react'

const WorkflowEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  selected,
}: EdgeProps<WorkflowEdgeData>) => {
  const blocks = useFormBuilderStore(state => state.blocks)
  const removeConnection = useFormBuilderStore(state => state.removeConnection)
  
  // Get the source block details to determine edge style
  const sourceBlock = useMemo(() => {
    if (!data?.connection?.sourceId) return null
    return blocks.find(block => block.id === data.connection.sourceId)
  }, [blocks, data?.connection?.sourceId])
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  // Handle edge deletion
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering other click handlers
    if (id) {
      removeConnection(id);
    }
  }, [id, removeConnection]);

  // Determine edge style based on block type and condition
  const getEdgeStyles = () => {
    const sourceBlockType = sourceBlock?.blockTypeId || 'unknown'
    const hasCondition = !!data?.connection?.condition?.field
    const conditionType = data?.connection?.condition?.field || ''
    const operatorType = data?.connection?.condition?.operator || ''
    
    // Always use black color for edges
    const baseColor = '#000000' // Pure black for all edges
    
    // Style settings
    let dashArray = '0' // solid line by default
    let edgeWidth = selected ? 3 : 2 // Increased width for better visibility
    
    // Style based on condition presence/type
    if (!hasCondition) {
      dashArray = '0' // solid line = "always" connection
    } else if (operatorType === 'equals') {
      dashArray = '0' // solid line for "equals" conditions
    } else if (operatorType === 'not_equals') {
      dashArray = '5,3' // dotted for "not equals"
    } else if (operatorType.includes('greater') || operatorType.includes('less')) {
      dashArray = '10,3' // dashed for comparison
    }
    
    // Override with selection state
    const edgeColor = selected ? '#f59e0b' : baseColor

    return {
      stroke: edgeColor,
      strokeWidth: edgeWidth,
      strokeDasharray: dashArray,
      transition: 'stroke 0.2s, stroke-width 0.2s',
      sourceBlockType,
      hasCondition,
      conditionType,
      operatorType,
      baseColor: '#000000' // Always black for text color consistency
    }
  }
  
  const edgeStyles = getEdgeStyles()
  
  // Format the condition to be more human-readable
  const formatCondition = () => {
    if (!data?.connection?.condition) return null
    
    const { field, operator, value } = data.connection.condition
    
    // Format field name nicely
    let fieldDisplay = field
    if (field === 'answer') {
      fieldDisplay = 'Answer'
    } else if (field === 'selected') {
      fieldDisplay = 'Selected'
    } else if (field === 'rating') {
      fieldDisplay = 'Rating'
    } else if (field.startsWith('choice:')) {
      // For choice fields, extract just the choice value
      const choiceValue = field.split(':')[1]
      fieldDisplay = `Option "${choiceValue}"`
    }
    
    // Format operator
    let operatorDisplay
    switch (operator) {
      case 'equals': operatorDisplay = 'is'; break
      case 'not_equals': operatorDisplay = 'is not'; break
      case 'contains': operatorDisplay = 'contains'; break
      case 'greater_than': operatorDisplay = 'is greater than'; break
      case 'less_than': operatorDisplay = 'is less than'; break
      default: operatorDisplay = operator
    }
    
    // Format based on field and operator
    if (field.startsWith('choice:')) {
      return operator === 'equals' ? 'When selected' : 'When not selected'
    }
    
    // Handle special cases
    if (field === 'selected' && operator === 'equals') {
      return value ? 'When checked' : 'When unchecked'
    }
    
    return `When ${fieldDisplay.toLowerCase()} ${operatorDisplay} ${value}`
  }
  
  // Get the appropriate icon for the condition
  const getConditionIcon = () => {
    if (!data?.connection?.condition) return ArrowRight
    
    const { field, operator } = data.connection.condition
    
    if (field.startsWith('choice:')) {
      return operator === 'equals' ? Check : X
    }
    
    if (field === 'selected') {
      return operator === 'equals' ? Check : X
    }
    
    if (field === 'rating' || field === 'answer') {
      if (operator === 'greater_than') return ChevronUp
      if (operator === 'less_than') return ChevronDown
      if (operator === 'equals') return Check
      if (operator === 'not_equals') return X
    }
    
    return ListFilter // default icon
  }
  
  const ConditionIcon = getConditionIcon()
  const condition = formatCondition()
  const labelBgColor = selected ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'
  const labelTextColor = selected ? 'text-amber-800' : `text-${edgeStyles.baseColor}`

  // Calculate position for the delete button
  // If there's a label, position it near the label, otherwise near the middle of the edge
  const deleteButtonX = condition ? labelX + 85 : (sourceX + targetX) / 2;
  const deleteButtonY = condition ? labelY - 22 : (sourceY + targetY) / 2 - 18;

  return (
    <>
      {/* Add a glow effect when selected */}
      {selected && (
        <BaseEdge 
          path={edgePath} 
          id={`${id}-glow`} 
          style={{
            stroke: '#f8e0a8', // amber-100/200
            strokeWidth: 8,
            strokeOpacity: 0.6,
            filter: 'blur(3px)',
          }} 
        />
      )}

      <BaseEdge 
        path={edgePath} 
        id={id} 
        style={{
          ...style,
          strokeWidth: edgeStyles.strokeWidth,
          stroke: edgeStyles.stroke,
          strokeDasharray: edgeStyles.strokeDasharray,
          transition: edgeStyles.transition,
        }} 
        markerEnd={`url(#${id}-marker)`}
        data-edge-id={id}
      />
      <svg>
        <defs>
          <marker
            id={`${id}-marker`}
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6" // Smaller marker
            markerHeight="6" // Smaller marker
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={edgeStyles.stroke} />
          </marker>
        </defs>
      </svg>
      
      {/* Enhanced label with icon and clearer formatting with multi-line support */}
      {condition && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              color: edgeStyles.stroke,
              backgroundColor: selected ? '#fff8e6' : 'white',
              borderColor: selected ? edgeStyles.stroke : '#e2e8f0',
              maxWidth: '200px', // Limit width to force wrapping on long text
            }}
            className={`
              nodrag nopan px-2 py-1.5 rounded-md text-xs shadow-md border 
              transition-colors flex gap-1.5 font-medium
              ${labelBgColor}
            `}
            data-edge-id={id}
          >
            <ConditionIcon size={14} className="flex-shrink-0 mt-0.5" />
            <div className="overflow-hidden flex flex-col">
              <span className="whitespace-normal hyphens-auto break-words">
                {condition}
              </span>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Delete button - shown on hover/selection */}
      <EdgeLabelRenderer>
        <button
          type="button"
          onClick={handleDelete}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX + 110}px,${labelY}px)`,
            pointerEvents: 'all',
            zIndex: 50,
            opacity: selected ? 1 : 0,
            transition: 'opacity 0.2s, background-color 0.2s, transform 0.2s',
          }}
          className="nodrag nopan w-7 h-7 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-full shadow-md border border-red-300 group edge-delete-button"
          aria-label="Delete connection"
          title="Delete connection"
          data-edge-id={id}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            if (!selected) {
              e.currentTarget.style.opacity = '0';
            }
          }}
        >
          <Trash2 size={16} className="group-hover:text-red-700" />
        </button>
      </EdgeLabelRenderer>
    </>
  )
}

export default memo(WorkflowEdge)