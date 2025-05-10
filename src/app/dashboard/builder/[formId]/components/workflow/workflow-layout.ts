import { Node, Edge } from 'reactflow';
import { WorkflowNodeData, WorkflowEdgeData } from '@/types/workflow-types';

// Constants for layout optimization
const NODE_WIDTH = 260;     // Increased for better spacing
const NODE_HEIGHT = 120;    // Increased for better spacing
const HORIZONTAL_GAP = 400; // Larger horizontal gap for clear separation
const VERTICAL_GAP = 250;   // Larger vertical gap for better branch separation
const BUFFER = 50;          // Increased buffer space between nodes

/**
 * Calculate a professional layout for nodes based on their connections
 * Using Dagre-inspired layered layout approach
 */
export function calculateLayout(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge<WorkflowEdgeData>[]
): { [id: string]: { x: number; y: number } } {
  if (nodes.length === 0) return {};

  // Step 1: Analyze the graph structure
  const graphAnalysis = analyzeGraph(nodes, edges);
  const { 
    rootNodes, 
    childrenMap, 
    // parentMap and nodeRanks are calculated but not directly used in this function
    incomingEdgeCount,
    outgoingEdgeCount 
  } = graphAnalysis;
  
  // Track processed nodes and their positions
  const processed = new Set<string>();
  const positions: { [id: string]: { x: number; y: number } } = {};
  
  // Enhanced collision detection with larger buffer zones
  const wouldOverlap = (x: number, y: number): boolean => {
    for (const id in positions) {
      const pos = positions[id];
      // Check if rectangles overlap with increased buffer
      if (
        x < pos.x + NODE_WIDTH + BUFFER &&
        x + NODE_WIDTH + BUFFER > pos.x &&
        y < pos.y + NODE_HEIGHT + BUFFER &&
        y + NODE_HEIGHT + BUFFER > pos.y
      ) {
        return true;
      }
    }
    return false;
  };

  // Improved function to find non-overlapping positions
  const findNonOverlappingPosition = (targetX: number, targetY: number): { x: number, y: number } => {
    if (!wouldOverlap(targetX, targetY)) return { x: targetX, y: targetY };
    
    // Try positions in a more effective spiraling pattern with increased radius
    for (let radius = 1; radius <= 12; radius++) { // Increased max radius
      // More granular angles for better distribution
      const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
      
      for (const angle of angles) {
        const radian = (angle * Math.PI) / 180;
        // Increased offset factors for better separation
        const offsetX = Math.cos(radian) * radius * HORIZONTAL_GAP * 0.5; // Increased from 0.3
        const offsetY = Math.sin(radian) * radius * VERTICAL_GAP * 0.5;  // Increased from 0.3
        
        const newX = targetX + offsetX;
        const newY = targetY + offsetY;
        
        if (!wouldOverlap(newX, newY)) {
          return { x: newX, y: newY };
        }
      }
    }
    
    // Last resort - place far away from other nodes with increased spacing
    const maxY = Object.values(positions).reduce((max, pos) => Math.max(max, pos.y), 0);
    const maxX = Object.values(positions).reduce((max, pos) => Math.max(max, pos.x), 0);
    return { 
      x: maxX + HORIZONTAL_GAP * 1.5, 
      y: maxY + VERTICAL_GAP * 2 
    };
  };

  // Track branch hierarchies to prevent overlap
  const branchTracks = new Map<number, Set<number>>();
  
  // Process node layout with professional force-directed approach
  const processNode = (
    nodeId: string,
    level: number = 0,
    track: number = 0,
    visited = new Set<string>()
  ) => {
    if (processed.has(nodeId) || visited.has(nodeId)) return;
    visited.add(nodeId);
    
    if (!processed.has(nodeId)) {
      // Reserve this track at this level
      if (!branchTracks.has(level)) {
        branchTracks.set(level, new Set<number>());
      }
      branchTracks.get(level)?.add(track);
      
      // Calculate initial position based on level (x) and track (y)
      const initialX = level * HORIZONTAL_GAP + 100;
      const initialY = track * VERTICAL_GAP + 100;
      
      // Find a position that doesn't conflict
      const position = findNonOverlappingPosition(initialX, initialY);
      
      // Store position and mark as processed
      positions[nodeId] = position;
      processed.add(nodeId);
      
      // Get all children for this node
      const children = childrenMap.get(nodeId) || [];
      
      if (children.length > 0) {
        // Calculate optimal child positioning - professional layout algorithms
        // sort complex nodes first for better distribution
        const childWeights = new Map<string, number>();
        
        // Calculate "weight" as combination of descendants and connections
        children.forEach(childId => {
          const descendants = getDescendantCount(childId, childrenMap);
          const connections = outgoingEdgeCount.get(childId) || 0;
          const weight = descendants * 10 + connections;
          childWeights.set(childId, weight);
        });
        
        // Sort by weight (descending) for better tree balance
        const sortedChildren = [...children].sort((a, b) => {
          return (childWeights.get(b) || 0) - (childWeights.get(a) || 0);
        });
        
        // Determine if we have a simple linear flow or a branching flow
        const isLinearFlow = children.length === 1 && (outgoingEdgeCount.get(children[0]) || 0) <= 1;
        
        if (isLinearFlow) {
          // For linear flow, continue in the same track
          processNode(
            children[0],
            level + 1,
            track,
            new Set(visited)
          );
        } else {
          // For branching flow, distribute children symmetrically
          const totalChildren = sortedChildren.length;
          
          // Center children around parent for balanced tree
          // Professional tree layouts center children below parent
          const centerTrack = track;
          const trackSpread = Math.floor(totalChildren / 2);
          
          sortedChildren.forEach((childId, index) => {
            // Calculate track offset from center, odd/even handling for symmetry
            let trackOffset = 0;
            
            if (totalChildren % 2 === 0) {
              // Even number of children - spread evenly
              trackOffset = index - trackSpread + 0.5;
            } else {
              // Odd number of children - center the middle one
              trackOffset = index - trackSpread;
            }
            
            // Increase track spacing for better vertical separation
            const childTrack = centerTrack + trackOffset * 1.5; // Increased multiplier for better spacing
            
            // Process the child node
            processNode(
              childId,
              level + 1,
              childTrack,
              new Set(visited)
            );
          });
        }
      }
    }
  };
  
  // Start processing from root nodes with professional spacing
  const effectiveRoots = rootNodes.length > 0 ? rootNodes : [nodes[0]];
  
  // Process roots with increased vertical separation
  effectiveRoots.forEach((rootNode, index) => {
    processNode(rootNode.id, 0, index * 3); // Increased vertical spacing between root branches
  });
  
  // Process any disconnected nodes
  const isolatedNodes = nodes.filter(node => 
    !processed.has(node.id) && 
    (incomingEdgeCount.get(node.id) || 0) === 0 && 
    (outgoingEdgeCount.get(node.id) || 0) === 0
  );
  
  if (isolatedNodes.length > 0) {
    // Find a position for isolated nodes in their own space
    let startX = HORIZONTAL_GAP * Math.max(...graphAnalysis.nodeRanks.values(), 0) + HORIZONTAL_GAP;
    const startY = 100;
    
    isolatedNodes.forEach((node) => {
      if (!processed.has(node.id)) {
        const pos = findNonOverlappingPosition(startX, startY);
        positions[node.id] = pos;
        startX = pos.x + HORIZONTAL_GAP;
      }
    });
  }
  
  // Final pass - check for any remaining nodes and place them
  nodes.forEach(node => {
    if (!processed.has(node.id)) {
      const pos = findNonOverlappingPosition(100, 100);
      positions[node.id] = pos;
    }
  });
  
  return positions;
}

/**
 * Analyzes the graph structure to extract important information
 * for layout algorithms
 */
function analyzeGraph(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge<WorkflowEdgeData>[]
) {
  const incomingEdgeCount = new Map<string, number>();
  const outgoingEdgeCount = new Map<string, number>();
  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string[]>();
  
  // Initialize maps for all nodes
  nodes.forEach(node => {
    childrenMap.set(node.id, []);
    parentMap.set(node.id, []);
    incomingEdgeCount.set(node.id, 0);
    outgoingEdgeCount.set(node.id, 0);
  });
  
  // Process all edges to build relationships
  edges.forEach(edge => {
    const source = edge.source;
    const target = edge.target;
    
    // Update edge counts
    incomingEdgeCount.set(target, (incomingEdgeCount.get(target) || 0) + 1);
    outgoingEdgeCount.set(source, (outgoingEdgeCount.get(source) || 0) + 1);
    
    // Add to children map
    const children = childrenMap.get(source) || [];
    if (!children.includes(target)) {
      children.push(target);
      childrenMap.set(source, children);
    }
    
    // Add to parent map
    const parents = parentMap.get(target) || [];
    if (!parents.includes(source)) {
      parents.push(source);
      parentMap.set(target, parents);
    }
  });
  
  // Find root nodes (no incoming edges)
  const rootNodes = nodes.filter(node => (incomingEdgeCount.get(node.id) || 0) === 0);
  
  // Calculate node ranks (longest path from any root)
  const nodeRanks = new Map<string, number>();
  calculateNodeRanks(rootNodes, childrenMap, nodeRanks);
  
  return {
    rootNodes,
    childrenMap,
    parentMap,
    incomingEdgeCount,
    outgoingEdgeCount,
    nodeRanks
  };
}

/**
 * Calculates the "rank" or depth of each node from roots
 */
function calculateNodeRanks(
  rootNodes: Node<WorkflowNodeData>[],
  childrenMap: Map<string, string[]>,
  nodeRanks: Map<string, number>,
  visited = new Set<string>()
) {
  // Using topological sort to calculate ranks
  const queue: {nodeId: string, rank: number}[] = 
    rootNodes.map(node => ({nodeId: node.id, rank: 0}));
  
  while (queue.length > 0) {
    const {nodeId, rank} = queue.shift()!;
    
    // Skip if already processed with higher or equal rank
    if (visited.has(nodeId) && (nodeRanks.get(nodeId) || 0) >= rank) continue;
    
    // Update rank and mark as visited
    nodeRanks.set(nodeId, rank);
    visited.add(nodeId);
    
    // Process all children with incremented rank
    const children = childrenMap.get(nodeId) || [];
    children.forEach(childId => {
      queue.push({nodeId: childId, rank: rank + 1});
    });
  }
}

/**
 * Gets a count of descendants for a node
 */
function getDescendantCount(nodeId: string, childrenMap: Map<string, string[]>, visited = new Set<string>()): number {
  if (visited.has(nodeId)) return 0;
  visited.add(nodeId);
  
  const children = childrenMap.get(nodeId) || [];
  if (children.length === 0) return 0;
  
  return children.length + children.reduce((sum, childId) => 
    sum + getDescendantCount(childId, childrenMap, visited), 0);
} 