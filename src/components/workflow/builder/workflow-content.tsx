"use client"

import { ReactFlowProvider } from 'reactflow'
import 'reactflow/dist/style.css'
import WorkflowCanvas from './workflow-canvas'

export default function WorkflowContent() {
  return (
    <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden">
      {/* Add minimal CSS to fix specific issues */}
      <style jsx global>{`
        /* Ensure entire canvas is clickable and draggable */
        .react-flow__pane {
          cursor: grab;
          z-index: 0; /* Lower z-index to ensure it doesn't block other elements */
        }
        
        /* Make sure panel buttons are clickable */
        .react-flow__panel {
          pointer-events: none;
          z-index: 5;
        }
        
        .react-flow__panel button {
          pointer-events: auto;
        }
        
        /* Fix z-index values for proper layering */
        .react-flow__controls {
          pointer-events: auto;
          z-index: 5;
        }
        
        /* Fix workflow controls - ensure transparency and clickability */
        .workflow-controls {
          z-index: 10;
          pointer-events: none;
          background: transparent !important;
          width: auto !important; /* Prevent stretching */
          display: flex;
          justify-content: flex-end;
        }
        
        .workflow-controls button,
        .workflow-controls div {
          pointer-events: auto;
        }
        
        /* Ensure sidebar is above everything */
        .workflow-sidebar {
          z-index: 20;
        }
        
        /* Force visibility of edge elements */
        .react-flow__edge-path {
          visibility: visible;
          stroke: #000;
          stroke-width: 1.5px;
          stroke-opacity: 0.8;
        }
        
        /* Ensure connection lines are visible when dragging */
        .react-flow__connection-path {
          stroke: #000;
          stroke-width: 2px;
        }
        
        /* Fix for ReactFlow wrapper container */
        .react-flow {
          height: 100%;
          width: 100%;
          position: relative;
          z-index: 0;
        }
        
        /* Ensure nodes are above the pane but below controls */
        .react-flow__nodes {
          pointer-events: auto;
          z-index: 2;
        }
        
        /* Ensure edges are visible and clickable */
        .react-flow__edges {
          z-index: 1;
          pointer-events: auto;
        }
      `}</style>
      
      <ReactFlowProvider>
        <WorkflowCanvas />
      </ReactFlowProvider>
    </div>
  )
}