"use client"

import { memo, useMemo, useCallback, useState } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, EdgeProps } from 'reactflow'
import { WorkflowEdgeData } from '@/types/workflow-types'
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { Check, ArrowRight, X, ChevronUp, ChevronDown, ListFilter, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getConditionSummary } from '@/utils/workflow/condition-utils'

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
  const saveForm = useFormBuilderStore(state => state.saveForm)
  
  // Get the connection data for consistent access
  const connection = data?.connection || null;
  
  // Get the source block details to determine edge style
  const sourceBlock = useMemo(() => {
    if (!connection?.sourceId) return null
    return blocks.find(block => block.id === connection.sourceId)
  }, [blocks, connection?.sourceId])
  
  // Get the target block details for condition display
  const targetBlock = useMemo(() => {
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
    const hasCondition = !!connection?.condition?.field
    const conditionType = connection?.condition?.field || ''
    const operatorType = connection?.condition?.operator || ''
    
    // Edge colors - always use gold for selected state
    const baseColor = '#000000' // Black for normal edges
    const goldColor = '#f59e0b' // Amber-500 for selected/hovered edges
    
    // Style settings - make edges more visible
    let dashArray = '0' // solid line by default
    const edgeWidth = selected ? 3 : 2 // Increase thickness for better visibility
    
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

    return {
      stroke: baseColor, // Always use base color for normal state
      goldColor, // Store gold color for selected/hover states
      strokeWidth: edgeWidth,
      strokeDasharray: dashArray,
      transition: 'stroke 0.2s, stroke-width 0.2s',
      sourceBlockType,
      hasCondition,
      conditionType,
      operatorType
    }
  }
  
  const edgeStyles = getEdgeStyles()
  
  // Format condition text
  const formatCondition = () => {
    if (!connection?.condition) return "Always proceed";
    
    const { field, operator, value } = connection.condition;
    
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
  
  // Get the appropriate icon for the condition
  const getConditionIcon = () => {
    if (!connection?.condition) return ArrowRight;
    
    const { field, operator } = connection.condition;
    
    if (field.startsWith('choice:')) {
      return operator === 'equals' ? Check : X;
    }
    
    if (field === 'selected') {
      return operator === 'equals' ? Check : X;
    }
    
    if (field === 'rating' || field === 'answer') {
      if (operator === 'greater_than') return ChevronUp;
      if (operator === 'less_than') return ChevronDown;
      if (operator === 'equals') return Check;
      if (operator === 'not_equals') return X;
    }
    
    return ListFilter; // default icon
  }
  
  const ConditionIcon = getConditionIcon();
  const condition = formatCondition();
  const labelBgColor = selected ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200';
  
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
          markerWidth="6"
          markerHeight="6"
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
          className="workflow-edge-path"
          stroke={selected || isHovered ? edgeStyles.goldColor : edgeStyles.stroke}
          strokeWidth={selected || isHovered ? edgeStyles.strokeWidth + 1 : edgeStyles.strokeWidth}
          strokeDasharray={edgeStyles.strokeDasharray}
          fill="none"
          markerEnd={`url(#arrow-${id})`}
          style={{
            pointerEvents: 'stroke',
            cursor: 'pointer',
            transition: 'stroke 0.2s',
            // Force the stroke color via inline style to override any class styles
            stroke: selected || isHovered ? '#f59e0b' : '#000000'
          }}
        />
      </g>
      
      {/* Enhanced label with clearer formatting - position ABOVE the edge */}
      <EdgeLabelRenderer>
        <div 
          style={{
            position: 'absolute',
            transform: `translate(-50%, -100%) translate(${labelX}px,${labelY}px)`, // Position directly above the edge
            pointerEvents: 'all',
            color: selected || isHovered ? '#f59e0b' : edgeStyles.stroke,
            backgroundColor: selected ? '#fff8e6' : 'white',
            borderColor: selected ? '#f59e0b' : isHovered ? '#f59e0b80' : '#e2e8f0',
            maxWidth: '280px',
            zIndex: 1000, // Very high z-index to ensure it's always on top
            opacity: 1, // Always visible
          }}
          className={`
            nodrag nopan px-3 py-2 rounded-md text-xs shadow-md border 
            transition-colors flex gap-2 font-medium
            ${selected ? 'shadow-md' : isHovered ? 'shadow-lg' : ''}
          `}
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
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px,${(sourceY + targetY) / 2 - 60}px)`,
            pointerEvents: 'all',
            zIndex: 20,
            opacity: selected || isHovered ? 1 : 0,
            transition: 'opacity 0.2s, background-color 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
          className="nodrag nopan w-7 h-7 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-full border border-red-300 group edge-delete-button"
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

// Add CSS globally to ensure workflow edge paths are always visible
const globalStyles = `
.workflow-edge-path {
  stroke-opacity: 1 !important;
  visibility: visible !important;
  fill: none !important;
}

.edge-wrapper.selected .workflow-edge-path,
.edge-wrapper:hover .workflow-edge-path {
  stroke: #f59e0b !important;
}

.edge-wrapper.selected marker path,
.edge-wrapper:hover marker path {
  fill: #f59e0b !important;
}
`;

// Insert styles into document head to ensure they are applied
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = globalStyles;
  document.head.appendChild(styleElement);
}