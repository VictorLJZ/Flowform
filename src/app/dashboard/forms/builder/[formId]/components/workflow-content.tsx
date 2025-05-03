// src/app/dashboard/forms/builder/[formId]/components/workflow-content.tsx
"use client"

import { ReactFlowProvider } from 'reactflow'
import 'reactflow/dist/style.css'
import WorkflowCanvas from './workflow/workflow-canvas'

export default function WorkflowContent() {
  return (
    <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden">
      <ReactFlowProvider>
        <WorkflowCanvas />
      </ReactFlowProvider>
    </div>
  )
}