"use client"

import { v4 as uuidv4 } from 'uuid'
import { StateCreator } from 'zustand'
import type { FormBlocksSlice } from '@/types/form-store-slices-types'
import type { FormBuilderState } from '@/types/store-types'
import type { UiBlock } from '@/types/block'
import { ApiBlockSubtype, ApiBlockType } from '@/types/block/ApiBlock'
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
  setBlocks: (blocks: UiBlock[]) => set({ blocks }),
  
  addBlock: (blockTypeId: string) => {
    const { blocks } = get()
    const newBlockId = uuidv4()
    const newOrder = blocks.length
    const blockDef = getBlockDefinition(blockTypeId)
 
    if (!blockDef) {
      console.error(`Block definition not found for type: ${blockTypeId}`)
      return
    }
 
    const newBlock: UiBlock = { 
      id: newBlockId,
      formId: '', // Will be set when form is saved
      type: (blockDef.type as ApiBlockType) || 'static',
      subtype: blockTypeId as ApiBlockSubtype,
      title: blockDef.defaultTitle || '',
      description: blockDef.defaultDescription || '',
      required: false,
      orderIndex: newOrder,
      settings: blockDef.getDefaultValues ? blockDef.getDefaultValues() : {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
 
    const updatedBlocks = [...blocks, newBlock].sort((a, b) => a.orderIndex - b.orderIndex)
    
    // Block system no longer directly manages connections
    // But we will notify the workflow system about the new block
    
    set(() => ({
      blocks: updatedBlocks,
      currentBlockId: newBlockId
    }))
    
    // Notify the workflow system about the new block
    // This is done after the state update to ensure the block exists
    // when the workflow system processes it
    console.log(`🧩🧩 [BlocksSlice] Added new block with ID: ${newBlockId}, now notifying workflow system`);
    
    // Use a direct method call instead of importing the store to avoid circular dependencies
    // This approach is safer and prevents initialization order issues
    setTimeout(() => {
      try {
        // Access the workflow functions directly from the combined store
        // We use the get() from Zustand's StateCreator to access the full store
        const fullStore = get();
        
        console.log(`🧩🔔 [BlocksSlice] Checking for onBlockAdded in store...`);
        if (typeof fullStore.onBlockAdded === 'function') {
          console.log(`🧩🔔 [BlocksSlice] Calling onBlockAdded(${newBlockId})...`);
          fullStore.onBlockAdded(newBlockId);
        } else {
          console.error(`🚨🧩 [BlocksSlice] onBlockAdded is not a function on the store!`);
          // Log available functions on the store for debugging
          console.log(`🔍🧩 [BlocksSlice] Available store methods:`, 
            Object.keys(fullStore)
              .filter(k => typeof fullStore[k as keyof typeof fullStore] === 'function')
              .join(', '));
        }
      } catch (error) {
        console.error(`🚨🚨 [BlocksSlice] Failed to notify workflow system of new block:`, error);
      }
    }, 0);
  },
  
  updateBlock: (blockId: string, updates: Partial<UiBlock>) => {
    set((state) => ({
      blocks: state.blocks.map(block => 
        block.id === blockId 
          ? { ...block, ...updates, updatedAt: new Date().toISOString() } 
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
    const { blocks, currentBlockId } = get()
    
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
        
    // Remove the block and update block order
    const updatedBlocks = blocks
      .filter(block => block.id !== blockId)
      .map((block, index) => ({ ...block, orderIndex: index }))
    
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
    
    // We no longer create bypass connections automatically
    // This responsibility is now moved to the workflow system
    
    set({
      blocks: updatedBlocks,
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
    
    // Update orderIndex property for all blocks
    // Note: We do not update connections here anymore; this is now
    // the responsibility of the workflow system
    const updatedBlocks = reorderedBlocks.map((block, index) => ({
      ...block,
      orderIndex: index,
      updatedAt: new Date().toISOString()
    }))
    
    // Store the ID of the moved block before updating state
    const movedBlockId = movedBlock.id
    
    set({ blocks: updatedBlocks })
    
    // Notify workflow slice about the reordering
    console.log(`🧩🔎 [BlocksSlice] Blocks reordered, moving block ${movedBlockId} to position ${endIndex}`);
    
    // Use the same safe approach to access the store without circular dependencies
    setTimeout(() => {
      try {
        const fullStore = get();
        
        if (typeof fullStore.onBlocksReordered === 'function') {
          console.log(`🧩🔔 [BlocksSlice] Calling onBlocksReordered(${movedBlockId})...`);
          fullStore.onBlocksReordered(movedBlockId);
        } else {
          console.error(`🚨🧩 [BlocksSlice] onBlocksReordered is not a function on the store!`);
        }
      } catch (error) {
        console.error(`🚨🚨 [BlocksSlice] Failed to notify workflow system of block reordering:`, error);
      }
    }, 0);
  },
  
  setCurrentBlockId: (blockId: string | null) => set({ currentBlockId: blockId }),
  
  getCurrentBlock: () => {
    const { blocks, currentBlockId } = get()
    return blocks.find(block => block.id === currentBlockId) || null
  }
})
