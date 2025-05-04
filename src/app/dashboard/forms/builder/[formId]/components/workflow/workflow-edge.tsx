"use client"

import { memo, useMemo, useCallback, useState } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, EdgeProps } from 'reactflow'
import { WorkflowEdgeData } from '@/types/workflow-types'
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { Check, ArrowRight, X, ChevronUp, ChevronDown, ListFilter, Trash2 } from 'lucide-react'

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
    curvature: 0.2 // Even lower curvature for almost straight lines
  })

  // Handle edge deletion
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Prevent triggering other click handlers
    
    if (id) {
      console.log(`Deleting connection with id: ${id}`); // Add logging
      
      // Use setTimeout to ensure the event completes before we modify state
      setTimeout(() => {
        removeConnection(id);
      }, 0);
      
      // Show feedback directly
      const feedback = document.createElement('div');
      feedback.textContent = 'Connection deleted';
      feedback.className = 'fixed z-50 top-4 right-4 bg-red-100 text-red-700 px-4 py-2 rounded-md shadow-md text-sm font-medium delete-toast';
      document.body.appendChild(feedback);
      
      // Remove feedback after delay
      setTimeout(() => {
        if (document.body.contains(feedback)) {
          document.body.removeChild(feedback);
        }
      }, 2000);
    }
  }, [id, removeConnection]);

  // Determine edge style based on block type and condition
  const getEdgeStyles = () => {
    const sourceBlockType = sourceBlock?.blockTypeId || 'unknown'
    const hasCondition = !!data?.connection?.condition?.field
    const conditionType = data?.connection?.condition?.field || ''
    const operatorType = data?.connection?.condition?.operator || ''
    
    // Edge colors
    const baseColor = '#000000' // Pure black for normal edges
    const selectedColor = '#f59e0b' // Amber-500 for selected edges
    
    // Style settings
    let dashArray = '0' // solid line by default
    const edgeWidth = selected ? 3 : 2 // Increased width for better visibility
    
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
    
    // Use amber color when selected
    const edgeColor = selected ? selectedColor : baseColor

    return {
      stroke: edgeColor,
      strokeWidth: edgeWidth,
      strokeDasharray: dashArray,
      transition: 'stroke 0.2s, stroke-width 0.2s',
      sourceBlockType,
      hasCondition,
      conditionType,
      operatorType,
      baseColor: selected ? selectedColor : baseColor // Use amber when selected
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
  // Remove unused variables
  
  // Track hover state for the edge
  const [, setIsHovered] = useState(false);

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

      <div 
        className="edge-wrapper"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
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
      </div>
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
            transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px,${(sourceY + targetY) / 2 - 30}px)`,
            pointerEvents: 'all',
            zIndex: 50,
            opacity: selected ? 1 : 0,
            transition: 'opacity 0.2s, background-color 0.2s',
          }}
          className="nodrag nopan w-6 h-6 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-full shadow-md border border-red-300 group edge-delete-button"
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
          <Trash2 size={12} className="group-hover:text-red-700" />
        </button>
      </EdgeLabelRenderer>
    </>
  )
}

export default memo(WorkflowEdge)