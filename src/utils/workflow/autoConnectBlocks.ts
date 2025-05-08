/**
 * Auto-connect blocks utility
 * 
 * Creates default connections between blocks based on their order_index.
 * Preserves existing connections and only adds missing connections.
 */

import { v4 as uuidv4 } from 'uuid';
import { FormBlock } from '@/types/block-types';
import { Connection } from '@/types/workflow-types';

interface AutoConnectParams {
  blocks: FormBlock[];
  connections: Connection[];
  targetBlockId?: string; // Optional: only process connections for a specific block
}

/**
 * Creates default connections between blocks based on their order_index
 * Only creates connections if they don't already exist, preserving existing connections
 * 
 * @returns Array of new connections that should be added
 */
export function createDefaultConnections({
  blocks,
  connections,
  targetBlockId
}: AutoConnectParams): Connection[] {
  console.log(`🔗🔗 [AutoConnect] Called with ${blocks.length} blocks, ${connections.length} connections, targetBlockId: ${targetBlockId || 'none'}`);
  
  // Sort blocks by order index
  const sortedBlocks = [...blocks].sort((a, b) => a.order_index - b.order_index);
  
  // If no blocks or only one block, no connections needed
  if (sortedBlocks.length <= 1) {
    console.log(`🔗⚠️ [AutoConnect] Not enough blocks to create connections`);
    return [];
  }
  
  // Debug log the sorted blocks
  console.log(`🔗🔍 [AutoConnect] Sorted blocks:`, 
    sortedBlocks.map(b => `${b.title || 'Untitled'} (${b.id}): index ${b.order_index}`).join(', '));
  
  const newConnections: Connection[] = [];
  
  // When a specific block is targeted (like a newly added block),
  // we need a different approach to ensure proper connections
  if (targetBlockId) {
    console.log(`🔗⚙️ [AutoConnect] Targeted processing for specific block: ${targetBlockId}`);
    
    // Find the targeted block
    const targetBlockIndex = sortedBlocks.findIndex(block => block.id === targetBlockId);
    if (targetBlockIndex === -1) {
      console.log(`🔗❌ [AutoConnect] Target block ${targetBlockId} not found in sorted blocks!`);
      return [];
    }
    
    console.log(`🔗💾 [AutoConnect] Target block found at index ${targetBlockIndex}`);
    
    // Check if there should be an incoming connection TO the target block
    if (targetBlockIndex > 0) {
      const prevBlock = sortedBlocks[targetBlockIndex - 1];
      const targetBlock = sortedBlocks[targetBlockIndex];
      
      console.log(`🔗⬅️ [AutoConnect] Checking for incoming connection: ${prevBlock.id} -> ${targetBlock.id}`);
      
      // Check if this connection already exists
      const hasIncomingConnection = connections.some(
        conn => conn.sourceId === prevBlock.id && conn.defaultTargetId === targetBlock.id
      );
      
      // Does the previous block already have outgoing connections?
      const prevHasOutgoing = connections.some(
        conn => conn.sourceId === prevBlock.id
      );
      
      console.log(`🔗📊 [AutoConnect] Incoming status: exists=${hasIncomingConnection}, prevHasOutgoing=${prevHasOutgoing}`);
      
      // Create the incoming connection if it doesn't exist and prev has no outgoing
      if (!hasIncomingConnection && !prevHasOutgoing) {
        const newConnection: Connection = {
          id: uuidv4(),
          sourceId: prevBlock.id,
          defaultTargetId: targetBlock.id,
          order_index: connections.length + newConnections.length,
          rules: []
        };
        
        newConnections.push(newConnection);
        console.log(`🔗✅ [AutoConnect] Created new connection FROM previous block: ${prevBlock.id} -> ${targetBlock.id}`);
      }
    }
    
    // Check if there should be an outgoing connection FROM the target block
    if (targetBlockIndex < sortedBlocks.length - 1) {
      const targetBlock = sortedBlocks[targetBlockIndex];
      const nextBlock = sortedBlocks[targetBlockIndex + 1];
      
      console.log(`🔗➡️ [AutoConnect] Checking for outgoing connection: ${targetBlock.id} -> ${nextBlock.id}`);
      
      // Check if this connection already exists
      const hasOutgoingConnection = connections.some(
        conn => conn.sourceId === targetBlock.id && conn.defaultTargetId === nextBlock.id
      );
      
      // Does the target block already have any outgoing connections?
      const hasAnyOutgoing = connections.some(
        conn => conn.sourceId === targetBlock.id
      );
      
      console.log(`🔗📊 [AutoConnect] Outgoing status: exists=${hasOutgoingConnection}, hasAnyOutgoing=${hasAnyOutgoing}`);
      
      // Create the outgoing connection if it doesn't exist and target has no outgoing
      if (!hasOutgoingConnection && !hasAnyOutgoing) {
        const newConnection: Connection = {
          id: uuidv4(),
          sourceId: targetBlock.id,
          defaultTargetId: nextBlock.id,
          order_index: connections.length + newConnections.length,
          rules: []
        };
        
        newConnections.push(newConnection);
        console.log(`🔗✅ [AutoConnect] Created new connection TO next block: ${targetBlock.id} -> ${nextBlock.id}`);
      }
    }
    
    // If we've processed the target block specifically, return now
    return newConnections;
  }
  
  // This branch handles bulk processing for all blocks (used by reordering)
  console.log(`🔗💾 [AutoConnect] Processing all ${sortedBlocks.length} blocks for default connections`);
  
  // For each block that needs processing
  for (const block of sortedBlocks) {
    const blockIndex = sortedBlocks.findIndex(b => b.id === block.id);
    
    // Skip if block is not found or is the last block (no next connection needed)
    if (blockIndex === -1 || blockIndex === sortedBlocks.length - 1) {
      console.log(`🔗❌ [AutoConnect] Skipping block ${block.id}: ${blockIndex === -1 ? 'not found' : 'is last block'}`);
      continue;
    }
    
    const currentBlock = sortedBlocks[blockIndex];
    const nextBlock = sortedBlocks[blockIndex + 1];
    
    console.log(`🔗🔎 [AutoConnect] Checking connection for reordering: ${currentBlock.id} -> ${nextBlock.id}`);
    
    // Check if a connection already exists from current block to next block
    const hasConnection = connections.some(
      conn => conn.sourceId === currentBlock.id && conn.defaultTargetId === nextBlock.id
    );
    
    // Check if current block already has any outgoing connections
    const hasAnyOutgoing = connections.some(
      conn => conn.sourceId === currentBlock.id
    );
    
    console.log(`🔗📈 [AutoConnect] Status: hasConnection=${hasConnection}, hasAnyOutgoing=${hasAnyOutgoing}`);
    
    // When blocks are reordered, we may need to create new connections
    // We create a connection if it doesn't exist yet and if the block has no outgoing connections
    if (!hasConnection && !hasAnyOutgoing) {
      const newConnection: Connection = {
        id: uuidv4(),
        sourceId: currentBlock.id,
        defaultTargetId: nextBlock.id,
        order_index: connections.length + newConnections.length,
        rules: []
      };
      
      newConnections.push(newConnection);
      console.log(`🔗✅ [AutoConnect] Created new connection during reorder: ${currentBlock.id} -> ${nextBlock.id}`);
    } else {
      console.log(`🔗ℹ️ [AutoConnect] Skipping connection creation: ${hasConnection ? 'connection exists' : 'block has outgoing connections'}`);
    }
    
    // Also check if previous blocks need connections to this block
    // (this helps fix broken flows after reordering)
    if (blockIndex > 0) {
      const prevBlock = sortedBlocks[blockIndex - 1];
      
      // Only check previous block if it's not already connected to anything
      const prevHasOutgoing = connections.some(
        conn => conn.sourceId === prevBlock.id
      );
      
      if (!prevHasOutgoing) {
        // Check if a connection already exists from previous block to current block
        const hasIncomingFromPrev = connections.some(
          conn => conn.sourceId === prevBlock.id && conn.defaultTargetId === currentBlock.id
        );
        
        if (!hasIncomingFromPrev) {
          console.log(`🔗📌 [AutoConnect] Adding missing connection from prev block: ${prevBlock.id} -> ${currentBlock.id}`);
          
          const incomingConnection: Connection = {
            id: uuidv4(),
            sourceId: prevBlock.id,
            defaultTargetId: currentBlock.id,
            order_index: connections.length + newConnections.length,
            rules: []
          };
          
          newConnections.push(incomingConnection);
        }
      }
    }
  }
  
  console.log(`🔗📊 [AutoConnect] Returning ${newConnections.length} new connections`);
  return newConnections;
}
