// src/app/dashboard/forms/builder/[formId]/components/workflow/workflow-controls.tsx
"use client"

import { Panel } from 'reactflow'
import { LayoutGrid, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Add type definition
interface WorkflowControlsProps {
  onAutoLayout: () => void;
  onClearSelection?: () => void;
}

export default function WorkflowControls({ onAutoLayout }: WorkflowControlsProps) {
  return (
    <Panel position="top-right">
      <div className="bg-background shadow-md rounded-md p-2 flex gap-2">
        <Button 
          size="sm" 
          variant="outline"
          onClick={onAutoLayout}
        >
          <LayoutGrid size={14} className="mr-1" />
          Auto Layout
        </Button>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Show a brief tutorial
                  alert("Workflow Tips:\n\n1. Connect blocks by dragging from right handle to left handle\n2. Double-click a connection to delete it\n3. Click a connection to edit its conditions\n4. Use Auto Layout to organize your flow");
                }}
              >
                <HelpCircle size={14} className="mr-1" />
                Workflow Help
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Learn how to use the workflow editor</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </Panel>
  )
}