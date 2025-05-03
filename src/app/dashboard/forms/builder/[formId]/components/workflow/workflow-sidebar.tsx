// src/app/dashboard/forms/builder/[formId]/components/workflow/workflow-sidebar.tsx
"use client"

import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Node, Edge } from 'reactflow'
import { WorkflowNodeData, WorkflowEdgeData } from '@/types/workflow-types'
import WorkflowConnectionSidebar from './workflow-connection-sidebar'
import WorkflowBlockSidebar from './workflow-block-sidebar'

interface WorkflowSidebarProps {
  element: Node<WorkflowNodeData> | Edge<WorkflowEdgeData>;
  onClose: () => void;
}

export default function WorkflowSidebar({ element, onClose }: WorkflowSidebarProps) {
  const [hasChanges, setHasChanges] = useState(false)
  const isEdge = 'source' in element && 'target' in element
  
  // Reset when the element changes
  useEffect(() => {
    setHasChanges(false)
  }, [element.id])
  
  return (
    <div className="w-[320px] border-l bg-background flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-medium">
          {isEdge ? 'Connection Settings' : 'Block Settings'}
        </h2>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button variant="outline" size="sm" onClick={() => setHasChanges(false)}>
              <Save size={14} className="mr-1" /> Applied
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>
      </div>
      
      {isEdge ? (
        <WorkflowConnectionSidebar 
          element={element as Edge<WorkflowEdgeData>} 
          onHasChanges={setHasChanges} 
        />
      ) : (
        <WorkflowBlockSidebar 
          element={element as Node<WorkflowNodeData>} 
        />
      )}
    </div>
  )
}