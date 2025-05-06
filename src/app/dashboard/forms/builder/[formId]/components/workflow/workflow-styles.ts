/**
 * CSS animation styles for the flow canvas
 * This centralizes all ReactFlow style customizations
 */
export const flowAnimationStyles = `
  /* Performance optimization: use hardware acceleration for all animated elements */
  .react-flow__node,
  .react-flow__edge,
  .react-flow__edge-path,
  .react-flow__connection-path {
    will-change: transform;
    transform: translateZ(0);
  }
  
  /* Make all connection paths highly visible */
  .react-flow__connection-path {
    stroke: #000000 !important; 
    stroke-width: 1px !important;
    stroke-opacity: 0.7 !important;
  }
  
  /* Ensure workflow edge paths are clearly visible */
  .workflow-edge-path {
    stroke: #000 !important;
    stroke-width: 1px !important;
    stroke-opacity: 0.7 !important;
    z-index: 1000 !important;
    pointer-events: all !important;
    visibility: visible !important;
  }

  /* Invisible handles for better UX */
  .react-flow__handle {
    opacity: 0; 
    cursor: pointer;
    width: 28px !important;
    height: 28px !important;
    border: none !important;
    background: transparent !important;
    position: absolute;
    z-index: 10;
  }
  
  /* Custom handle hit area */
  .handle-hit-area {
    width: 40px;
    height: 40px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
  }
  
  .handle-hit-area-left {
    left: -20px;
  }
  
  .handle-hit-area-right {
    right: -20px;
  }
  
  /* When connecting, improve visibility */
  .react-flow__handle.connecting {
    opacity: 0 !important;
    background-color: transparent !important;
  }
  
  /* When handle is valid, improve visibility */
  .react-flow__handle.valid {
    opacity: 0 !important;
    background-color: transparent !important;
  }

  /* For selection state */
  .react-flow__node.selected .react-flow__handle {
    background-color: transparent !important;
    opacity: 0 !important;
  }

  /* Ensure handles are perfectly centered */
  .react-flow__handle-top {
    top: -5px !important;
    left: 50% !important;
    transform: translate(-50%, 0);
  }
  
  .react-flow__handle-bottom {
    bottom: -5px !important;
    left: 50% !important;
    transform: translate(-50%, 0);
  }
  
  .react-flow__handle-left {
    left: -5px !important;
    top: 50% !important;
    transform: translate(0, -50%);
  }
  
  .react-flow__handle-right {
    right: -5px !important;
    top: 50% !important;
    transform: translate(0, -50%);
  }

  /* Edge delete animations */
  @keyframes deleteButtonPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.03); }
    100% { transform: scale(1); }
  }

  /* Apply animation to delete button on hover - but keep it subtle */
  .edge-delete-button:hover {
    animation: none;
  }

  /* Feedback toast animation */
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  /* Edge removal animation */
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  /* Toast notification styles */
  .delete-toast, .create-toast {
    animation: slideInRight 0.3s ease-out forwards;
  }
  
  /* Connection created toast */
  .create-toast {
    background-color: #dcfce7 !important;
    color: #15803d !important;
    border: 1px solid #15803d !important;
  }

  /* Add transition to edges for smooth deletion - but keep it minimal */
  .react-flow__edge {
    transition: opacity 0.1s linear;
    visibility: visible !important;
    z-index: 1000 !important;
  }
  .react-flow__edge.deleting {
    opacity: 0;
  }

  /* When connecting, highlight valid connection targets - simplified */
  .react-flow__node[data-connecting="true"] {
    filter: drop-shadow(0 0 3px rgba(16, 185, 129, 0.4));
  }

  /* Highlight nodes on connection drag approach - simplified */
  .connection-target {
    filter: drop-shadow(0 0 3px rgba(16, 185, 129, 0.4)) !important;
    box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.4);
  }

  /* Ensure edge paths are always visible with strong dark color */
  .react-flow__edge-path {
    stroke: #000000 !important;
    stroke-width: 1px !important; 
    stroke-opacity: 0.7 !important;
    z-index: 1000 !important;
    visibility: visible !important;
    pointer-events: all !important;
  }
  
  /* Selected edges should be amber/gold */
  .react-flow__edge.selected .react-flow__edge-path {
    stroke: #f59e0b !important; /* amber-500 */
    stroke-width: 1.5px !important;
  }
  
  /* Make edge paths connect closer to nodes */
  .react-flow__edge {
    --edge-stroke-width: 1px;
    --edge-path-stroke: #000000;
    z-index: 1000;
    visibility: visible !important;
  }
  
  /* Minimal curvature for very straight lines */
  .react-flow__edge-bezier {
    --edge-curvature: 0.05;
  }
  
  /* Ensure markers (arrowheads) are visible and large */
  .react-flow__edge-marker {
    stroke: none !important;
    fill: #000 !important;
    visibility: visible !important;
  }
  
  /* Selected edge markers should match edge color */
  .react-flow__edge.selected .react-flow__edge-marker {
    fill: #f59e0b !important;
  }
  
  /* Fix any SVG rendering issues */
  svg.react-flow__edges {
    z-index: 999 !important;
    visibility: visible !important;
  }
  
  /* Ensure all edge SVG elements are visible */
  .react-flow__edge svg,
  .react-flow__edge path,
  .react-flow__edge marker {
    visibility: visible !important;
  }

  /* Connection styling - simplified for performance */
  .workflow-canvas .react-flow__edge-path {
    stroke-width: 1px;
    transition: stroke 0.1s linear;
  }
  
  /* Node animations - minimal for performance */
  .workflow-canvas .react-flow__node {
    transition: box-shadow 0.1s linear;
  }
  
  /* Highlight target node - simplified */
  .workflow-canvas .react-flow__node[data-is-target="true"] {
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.4);
  }
  
  /* Custom path animations for connection type */
  .workflow-canvas .react-flow__edge.condition .react-flow__edge-path {
    stroke-dasharray: 5 5;
  }
  
  /* Connection highlight on hover */
  .workflow-canvas .react-flow__edge.react-flow__edge-interaction:hover .react-flow__edge-path,
  .workflow-canvas .react-flow__edge.selected .react-flow__edge-path {
    stroke-width: 1.5px;
  }
  
  /* Edge interaction states */
  .workflow-canvas .react-flow__edge.deletable .react-flow__edge-path {
    stroke-width: 1px;
    stroke-dasharray: 5 2;
  }
  
  /* Edge label animations */
  .workflow-canvas .edge-label-container {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  
  .workflow-canvas .edge-label-container:hover {
    transform: scale(1.05);
  }
  
  /* Connection line animation */
  .workflow-canvas .react-flow__connection-path {
    stroke-width: 3;
    animation: connection-dash 1s infinite linear;
    stroke-dasharray: 5 5;
  }
  
  @keyframes connection-dash {
    from {
      stroke-dashoffset: 20;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
  
  /* Fix for panel and button interaction */
  .react-flow__panel {
    z-index: 1000 !important;
    pointer-events: auto !important;
  }
  
  .react-flow__panel button {
    pointer-events: auto !important;
    position: relative;
    z-index: 1000;
  }
  
  /* Make sure controls are above canvas */
  .react-flow__controls {
    z-index: 1000 !important;
    pointer-events: auto !important;
  }
  
  /* Ensure sidebar doesn't get hidden */
  .workflow-sidebar {
    z-index: 1100 !important;
  }
  
  /* Fix for control panels to ensure they're clickable */
  .react-flow__panel-top {
    pointer-events: auto !important;
    z-index: 1000 !important;
  }
  
  .react-flow__panel-top > div {
    pointer-events: auto !important;
  }
  
  /* Ensure workflow controls are always on top */
  .workflow-controls {
    z-index: 1500 !important;
    pointer-events: auto !important;
    position: relative !important;
  }
  
  .workflow-controls button {
    pointer-events: auto !important;
  }

  /* Smooth enter animations for elements */
  .workflow-node-enter {
    opacity: 0;
    transform: scale(0.8);
  }
  
  .workflow-node-enter-active {
    opacity: 1;
    transform: scale(1);
    transition: opacity 300ms, transform 300ms;
  }
  
  /* Ensure workflow edges are always visible */
  .workflow-edge-path {
    stroke-width: 2px !important;
    fill: none !important;
    pointer-events: all !important;
  }
  
  /* Fix for edge styling */
  .react-flow__edge-path {
    stroke-width: 2px !important;
    fill: none !important;
  }
  
  /* Enhanced edge highlight */
  .react-flow__edge.selected .react-flow__edge-path {
    stroke-width: 3px !important;
  }
  
  /* Style for edge markers */
  marker {
    fill: currentColor;
  }
  
  /* Style hover states */
  .react-flow__node:hover {
    filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07));
  }
  
  /* Improved handle styling */
  .react-flow__handle {
    width: 8px !important;
    height: 8px !important;
    background-color: #ffffff !important;
    border: 2px solid #000000 !important;
  }
  
  .react-flow__handle-connecting {
    background-color: #f97316 !important;
    border: 2px solid #f97316 !important;
  }
  
  .react-flow__handle-valid {
    background-color: #22c55e !important;
    border: 2px solid #22c55e !important;
  }
  
  /* Connection target highlight */
  .connection-target {
    outline: 2px solid #22c55e !important;
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.6) !important;
  }
`; 