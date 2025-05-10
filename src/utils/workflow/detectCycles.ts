/**
 * Cycle Detection Utility
 * 
 * Detects cycles (infinite loops) in form workflow connections using a depth-first search algorithm.
 * This helps identify problematic connection patterns that could cause infinite loops during form execution.
 */

import { FormBlock } from '@/types/block-types';
import { Connection } from '@/types/workflow-types';

export interface CycleDetectionResult {
  // Maps connection IDs to a boolean indicating if they're part of a cycle
  cycleConnections: Record<string, boolean>;
  // Whether any cycles were detected at all
  hasCycles: boolean;
}

/**
 * Detects cycles in the workflow graph using DFS algorithm.
 * 
 * @param blocks - Form blocks that are the nodes in the workflow graph
 * @param connections - Connections between blocks that form the edges of the graph
 * @returns Object containing cycle detection results and affected connections
 */
export function detectCycles(
  blocks: FormBlock[], 
  connections: Connection[]
): CycleDetectionResult {
  console.log('🔄 [Cycle Detection] Analyzing workflow for cycles');
  
  const cycleConnections: Record<string, boolean> = {};
  let hasCycles = false;
  
  // Create adjacency list representation of the graph
  const graph: Record<string, {targetId: string, connectionId: string}[]> = {};
  
  // Initialize graph with all blocks
  blocks.forEach(block => {
    graph[block.id] = [];
  });
  
  // Add all edges to the graph (both default connections and rule-based ones)
  connections.forEach(conn => {
    // Add default target connection if it exists
    if (conn.sourceId && conn.defaultTargetId) {
      if (graph[conn.sourceId]) {
        graph[conn.sourceId].push({
          targetId: conn.defaultTargetId,
          connectionId: conn.id
        });
      }
    }
    
    // Add rule-based target connections
    if (conn.rules && conn.rules.length > 0) {
      conn.rules.forEach(rule => {
        if (rule.target_block_id && graph[conn.sourceId]) {
          graph[conn.sourceId].push({
            targetId: rule.target_block_id,
            connectionId: conn.id
          });
        }
      });
    }
  });
  
  // Used to track nodes in the current DFS path
  const visited = new Set<string>();
  // Used to track all visited nodes across all DFS calls
  const globalVisited = new Set<string>();
  
  // DFS to detect cycles
  function dfs(nodeId: string, path: Set<string>, pathEdges: string[]) {
    // Mark node as visited in this path
    path.add(nodeId);
    
    // Process all adjacent nodes
    for (const { targetId, connectionId } of graph[nodeId] || []) {
      // If target is already in current path, we found a cycle
      if (path.has(targetId)) {
        hasCycles = true;
        console.log(`🔄🚨 [Cycle Detection] Found cycle involving connection: ${nodeId} -> ${targetId}`);
        
        // Mark the connection as part of a cycle
        cycleConnections[connectionId] = true;
        
        // Also mark the "return edge" to complete the cycle
        const returnEdgeIdx = pathEdges.length - 1;
        if (returnEdgeIdx >= 0) {
          cycleConnections[pathEdges[returnEdgeIdx]] = true;
        }
        
        continue; // Don't recurse further on this branch
      }
      
      // If not already visited, recurse
      if (!globalVisited.has(targetId)) {
        // Track the edge we're following
        pathEdges.push(connectionId);
        
        // Recursively explore
        dfs(targetId, new Set(path), [...pathEdges]);
        
        // Remove edge from path when backtracking
        pathEdges.pop();
      }
    }
    
    // Mark node as fully explored
    globalVisited.add(nodeId);
  }
  
  // Start DFS from each node that hasn't been visited yet
  blocks.forEach(block => {
    if (!globalVisited.has(block.id)) {
      dfs(block.id, new Set<string>(), []);
    }
  });
  
  console.log(`🔄 [Cycle Detection] Results: ${hasCycles ? 'Cycles found!' : 'No cycles detected'}, ${Object.keys(cycleConnections).length} problem connections`);
  
  return {
    cycleConnections,
    hasCycles
  };
}
