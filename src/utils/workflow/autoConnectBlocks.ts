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
    // Return existing connections if any, or empty if none (and no blocks to connect)
    return connections.filter(conn => {
      // Keep connections that are not solely between blocks in the current `sortedBlocks` set
      // This is to preserve connections to external/global blocks if any exist
      const sourceInSorted = sortedBlocks.some(b => b.id === conn.sourceId);
      const targetInSorted = sortedBlocks.some(b => b.id === conn.defaultTargetId);
      return !(sourceInSorted && targetInSorted);
    });
  }
  
  // Debug log the sorted blocks
  console.log(`🔗🔍 [AutoConnect] Sorted blocks:`, 
    sortedBlocks.map(b => `${b.title || 'Untitled'} (${b.id}): index ${b.order_index}`).join(', '));
  
  let updatedConnections: Connection[] = [...connections];
  
  // When a specific block is targeted (like a newly added block),
  // we use a specific logic to connect it to its immediate neighbors.
  if (targetBlockId) {
    console.log(`🔗⚙️ [AutoConnect] Targeted processing for specific block: ${targetBlockId}`);
    const newConnectionsFromTargetedProcessing: Connection[] = [];

    const targetBlockIndex = sortedBlocks.findIndex(block => block.id === targetBlockId);
    if (targetBlockIndex === -1) {
      console.log(`🔗❌ [AutoConnect] Target block ${targetBlockId} not found in sorted blocks!`);
      return updatedConnections; // Return current connections if target not found
    }
    
    console.log(`🔗💾 [AutoConnect] Target block found at index ${targetBlockIndex}`);
    
    // Check if there should be an incoming connection TO the target block
    if (targetBlockIndex > 0) {
      const prevBlock = sortedBlocks[targetBlockIndex - 1];
      const targetBlock = sortedBlocks[targetBlockIndex];
      
      console.log(`🔗⬅️ [AutoConnect] Checking for incoming connection: ${prevBlock.id} -> ${targetBlock.id}`);
      
      const hasIncomingConnection = updatedConnections.some(
        conn => conn.sourceId === prevBlock.id && conn.defaultTargetId === targetBlock.id
      );
      
      // Does the previous block already have outgoing connections (to any other block)?
      const prevHasAnyOutgoing = updatedConnections.some(
        conn => conn.sourceId === prevBlock.id
      );
      
      console.log(`🔗📊 [AutoConnect] Incoming status for target: exists=${hasIncomingConnection}, prevHasAnyOutgoing=${prevHasAnyOutgoing}`);
      
      // Create the incoming connection if it doesn't exist AND prev block has NO outgoing connections at all.
      // This ensures we only add a default connection if the prev block isn't already connected elsewhere.
      if (!hasIncomingConnection && !prevHasAnyOutgoing) {
        const newConnection: Connection = {
          id: uuidv4(),
          sourceId: prevBlock.id,
          defaultTargetId: targetBlock.id,
          order_index: updatedConnections.length + newConnectionsFromTargetedProcessing.length, // Ensure unique order_index for new connections
          rules: [],
          is_explicit: false // System-generated default connection
        };
        newConnectionsFromTargetedProcessing.push(newConnection);
        console.log(`🔗✅ [AutoConnect] Created new INCOMING connection for target: ${prevBlock.id} -> ${targetBlock.id}`);
      }
    }
    
    // Check if there should be an outgoing connection FROM the target block
    if (targetBlockIndex < sortedBlocks.length - 1) {
      const targetBlock = sortedBlocks[targetBlockIndex];
      const nextBlock = sortedBlocks[targetBlockIndex + 1];
      
      console.log(`🔗➡️ [AutoConnect] Checking for outgoing connection: ${targetBlock.id} -> ${nextBlock.id}`);
      
      const hasOutgoingConnection = updatedConnections.some(
        conn => conn.sourceId === targetBlock.id && conn.defaultTargetId === nextBlock.id
      );

      // Does the target block already have any outgoing connections?
      const targetHasAnyOutgoing = updatedConnections.some(
        conn => conn.sourceId === targetBlock.id
      );
      
      console.log(`🔗📊 [AutoConnect] Outgoing status for target: exists=${hasOutgoingConnection}, targetHasAnyOutgoing=${targetHasAnyOutgoing}`);
      
      // Create the outgoing connection if it doesn't exist AND target block has NO outgoing connections at all.
      if (!hasOutgoingConnection && !targetHasAnyOutgoing) {
        const newConnection: Connection = {
          id: uuidv4(),
          sourceId: targetBlock.id,
          defaultTargetId: nextBlock.id,
          order_index: updatedConnections.length + newConnectionsFromTargetedProcessing.length, // Ensure unique order_index
          rules: [],
          is_explicit: false // System-generated default connection
        };
        newConnectionsFromTargetedProcessing.push(newConnection);
        console.log(`🔗✅ [AutoConnect] Created new OUTGOING connection for target: ${targetBlock.id} -> ${nextBlock.id}`);
      }
    }
    updatedConnections.push(...newConnectionsFromTargetedProcessing);
    console.log(`🔗📊 [AutoConnect] Targeted processing added ${newConnectionsFromTargetedProcessing.length} new connections. Total connections now: ${updatedConnections.length}`);
    return updatedConnections;
  }
  
  // This branch handles bulk processing for all blocks (e.g., reordering or initial setup without a target)
  console.log(`🔗⚙️ [AutoConnect] Bulk processing for ${sortedBlocks.length} blocks.`);

  // Get IDs of all blocks currently being processed
  const currentBlockIds = new Set(sortedBlocks.map(b => b.id));

  // 1. Remove all existing *default* connections *between* the blocks currently being processed.
  // Default connections are those with no rules.
  // Connections to blocks *outside* this current set (e.g. a global Start/End node) or connections with rules are preserved.
  updatedConnections = updatedConnections.filter(conn => {
    const isDefaultConnectionByRules = conn.rules.length === 0;
    const sourceIsCurrent = currentBlockIds.has(conn.sourceId);
    const targetIsCurrent = conn.defaultTargetId ? currentBlockIds.has(conn.defaultTargetId) : false;

    // Keep connection if:
    // - It's an explicit user-defined connection
    // - OR It's NOT a default connection (i.e., it has rules)
    // - OR It's a default connection (no rules, not explicit), but NOT strictly between two blocks in the current processing set.
    if (conn.is_explicit) {
      console.log(`🔗🔒 [AutoConnect] Preserving explicit connection: ${conn.sourceId} -> ${conn.defaultTargetId}`);
      return true; // Always keep explicit connections
    }
    if (!isDefaultConnectionByRules) {
      console.log(`🔗📜 [AutoConnect] Preserving rule-based connection: ${conn.sourceId} -> ${conn.defaultTargetId}`);
      return true; // Keep non-default (rule-based) connections (these should ideally also be explicit)
    }
    // If it is a default connection (no rules, not explicit), only remove it if both source and target are within the current set of blocks.
    if (sourceIsCurrent && targetIsCurrent) {
      console.log(`🔗🗑️ [AutoConnect] Removing old auto-generated connection: ${conn.sourceId} -> ${conn.defaultTargetId}`);
      return false; // Remove this old auto-generated default connection
    }
    return true; // Keep default connections not involving two blocks from the current set
  });
  console.log(`🔗📊 [AutoConnect] Connections after removing old defaults within current set: ${updatedConnections.length}`);

  // 2. Create new default connections for adjacent blocks in the sorted list.
  const newDefaultConnectionsToAdd: Connection[] = [];
  for (let i = 0; i < sortedBlocks.length - 1; i++) {
    const currentBlock = sortedBlocks[i];
    const nextBlock = sortedBlocks[i + 1];

    console.log(`🔗🔎 [AutoConnect] Checking for new default connection: ${currentBlock.id} -> ${nextBlock.id}`);

    // Check if this exact default connection already exists (it shouldn't if removal was correct, but good for safety)
    // OR if currentBlock already has a rule-based outgoing connection (we don't want to override that with a default)
    const connectionAlreadyExistsOrHasRules = updatedConnections.some(conn => 
        conn.sourceId === currentBlock.id && 
        (conn.defaultTargetId === nextBlock.id || conn.rules.length > 0)
    );

    if (!connectionAlreadyExistsOrHasRules) {
      const newConnection: Connection = {
        id: uuidv4(),
        sourceId: currentBlock.id,
        defaultTargetId: nextBlock.id,
        order_index: updatedConnections.length + newDefaultConnectionsToAdd.length, // Maintain order for new connections
        rules: [],
        is_explicit: false // System-generated default connection
      };
      newDefaultConnectionsToAdd.push(newConnection);
      console.log(`🔗✅ [AutoConnect] Creating new default connection: ${currentBlock.id} -> ${nextBlock.id}`);
    } else {
      console.log(`🔗ℹ️ [AutoConnect] Skipping default connection creation for ${currentBlock.id} -> ${nextBlock.id}: already exists or source has rule-based outgoing.`);
    }
  }

  updatedConnections.push(...newDefaultConnectionsToAdd);
  
  console.log(`🔗📊 [AutoConnect] Bulk processing finished. Total connections: ${updatedConnections.length}. Added ${newDefaultConnectionsToAdd.length} new default connections.`);
  return updatedConnections;
}
