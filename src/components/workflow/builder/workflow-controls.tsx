// src/app/dashboard/forms/builder/[formId]/components/workflow/workflow-controls.tsx
"use client"

import { Button } from '@/components/ui/button'
import { HelpCircle, Layout } from 'lucide-react'

interface WorkflowControlsProps {
  onAutoLayout: () => void;
  onHelp: () => void;
}

export default function WorkflowControls({ onAutoLayout, onHelp }: WorkflowControlsProps) {
  // Helper to prevent event propagation to the canvas
  const handleControlClick = (e: React.MouseEvent, callback: () => void) => {
    e.stopPropagation();
    e.preventDefault();
    callback();
  };
  
  return (
    <div className="workflow-controls absolute top-4 right-4 flex items-center gap-2 z-50">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1.5 shadow-sm bg-white" 
        onClick={(e) => handleControlClick(e, onAutoLayout)}
      >
        <Layout size={14} />
        <span>Auto-Layout</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        className="shadow-sm bg-white" 
        onClick={(e) => handleControlClick(e, onHelp)}
      >
        <HelpCircle size={16} />
      </Button>
    </div>
  )
}