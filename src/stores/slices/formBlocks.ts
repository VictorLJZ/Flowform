"use client"

import { StateCreator } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { FormBlocksSlice } from '@/types/form-store-slices'
import type { FormBuilderState } from '@/types/store-types'
import type { FormBlock } from '@/types/block-types'
import { getBlockDefinition } from '@/registry/blockRegistry'

export const createFormBlocksSlice: StateCreator<
  FormBuilderState,
  [],
  [],
  FormBlocksSlice
> = (set, get) => ({
  // State
  blocks: [],
  currentBlockId: null,
  
  // Actions
  setBlocks: (blocks: FormBlock[]) => set({ blocks }),
  
  addBlock: (blockTypeId: string) => {
    const { blocks, connections } = get()
    const newBlockId = uuidv4()
    const newOrder = blocks.length
    const blockDef = getBlockDefinition(blockTypeId)
 
    if (!blockDef) {
      console.error(`Block definition not found for type: ${blockTypeId}`)
      return
    }
 
    const newBlock: FormBlock = { 
      id: newBlockId,
      blockTypeId: blockTypeId,
      type: blockDef.type || 'static',
      title: blockDef.defaultTitle || '',
      description: blockDef.defaultDescription || '',
      required: false,
      order: newOrder,
      settings: blockDef.getDefaultValues() || {}
    }
 
    const updatedBlocks = [...blocks, newBlock].sort((a, b) => a.order - b.order)
    
    // Create a new connection from the last block to this new block
    let updatedConnections = [...connections]
    
    // Only add linear connection if blocks exist
    if (blocks.length > 0) {
      try {
        // Find the block with the highest order (the current last block)
        const lastBlock = blocks.reduce((prev, current) => 
          prev.order > current.order ? prev : current
        );
        
        // Create a new connection from the last block to the new block
        const newConnection = {
          id: uuidv4(),
          sourceId: lastBlock.id,
          targetId: newBlockId,
          order: connections.length
        };
        
        updatedConnections = [...connections, newConnection];
        console.log(`Created new linear connection from block ${lastBlock.id} to ${newBlockId}`);
      } catch (error) {
        console.error("Error creating connection for new block:", error);
      }
    }
    
    set(() => ({
      blocks: updatedBlocks,
      connections: updatedConnections,
      currentBlockId: newBlockId
    }))
  },
  
  updateBlock: (blockId: string, updates: Partial<FormBlock>) => {
    const blockDef = getBlockDefinition(updates.blockTypeId || get().blocks.find(b => b.id === blockId)?.blockTypeId || '')
    
    set((state) => ({
      blocks: state.blocks.map(block => 
        block.id === blockId 
          ? { ...block, ...updates } 
          : block
      )
    }))
  },
  
  updateBlockSettings: (blockId: string, settings: Record<string, unknown>) => {
    set((state) => ({
      blocks: state.blocks.map(block => 
        block.id === blockId 
          ? { ...block, settings: { ...block.settings, ...settings } } 
          : block
      )
    }))
  },
  
  removeBlock: (blockId: string) => {
    const { blocks, connections, currentBlockId } = get()
    
    // Check if this is the currently selected block
    const isCurrentBlock = currentBlockId === blockId
    
    // Find the block to be removed
    const blockToRemove = blocks.find(block => block.id === blockId)
    
    if (!blockToRemove) {
      console.error(`Block not found with ID: ${blockId}`)
      return
    }
    
    // Find the index of the block to be removed
    const blockIndex = blocks.findIndex(block => block.id === blockId)
    
    // Find all connections involving this block
    const incomingConnections = connections.filter(conn => conn.targetId === blockId)
    const outgoingConnections = connections.filter(conn => conn.sourceId === blockId)
    
    // Create new connections that bypass the removed block
    const bypassConnections = []
    
    // If the block has both incoming and outgoing connections, create bypass connections
    if (incomingConnections.length > 0 && outgoingConnections.length > 0) {
      try {
        // For each incoming connection, connect it to each outgoing connection
        for (const incoming of incomingConnections) {
          for (const outgoing of outgoingConnections) {
            bypassConnections.push({
              id: uuidv4(),
              sourceId: incoming.sourceId,
              targetId: outgoing.targetId,
              condition: incoming.condition || outgoing.condition, // Keep any conditions
              order: connections.length
            })
          }
        }
      } catch (error) {
        console.error('Error creating bypass connections:', error)
      }
    }
    
    // Filter out connections that involve the removed block
    const filteredConnections = connections.filter(conn => 
      conn.sourceId !== blockId && conn.targetId !== blockId
    )
    
    // Add the bypass connections
    const updatedConnections = [...filteredConnections, ...bypassConnections]
    
    // Remove the block and update block order
    const updatedBlocks = blocks
      .filter(block => block.id !== blockId)
      .map((block, index) => ({ ...block, order: index }))
    
    // Determine the new currentBlockId
    let newCurrentBlockId = currentBlockId
    
    if (isCurrentBlock) {
      // If we're removing the current block, select the previous block if it exists,
      // otherwise the next block, or null if neither exists
      if (blockIndex > 0) {
        // Select the previous block
        newCurrentBlockId = updatedBlocks[blockIndex - 1]?.id || null
      } else if (updatedBlocks.length > 0) {
        // Select the first block
        newCurrentBlockId = updatedBlocks[0].id
      } else {
        // No blocks left
        newCurrentBlockId = null
      }
    }
    
    set({
      blocks: updatedBlocks,
      connections: updatedConnections,
      currentBlockId: newCurrentBlockId
    })
  },
  
  reorderBlocks: (startIndex: number, endIndex: number) => {
    const { blocks } = get()
    
    // Make a copy of the blocks array
    const reorderedBlocks = [...blocks]
    
    // Remove the item from its original position
    const [movedBlock] = reorderedBlocks.splice(startIndex, 1)
    
    // Insert the item at the new position
    reorderedBlocks.splice(endIndex, 0, movedBlock)
    
    // Update order property for all blocks
    const updatedBlocks = reorderedBlocks.map((block, index) => ({
      ...block,
      order: index
    }))
    
    set({ blocks: updatedBlocks })
  },
  
  setCurrentBlockId: (blockId: string | null) => set({ currentBlockId: blockId }),
  
  getCurrentBlock: () => {
    const { blocks, currentBlockId } = get()
    return blocks.find(block => block.id === currentBlockId) || null
  }
})
