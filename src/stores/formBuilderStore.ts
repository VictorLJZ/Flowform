"use client"

import { create } from 'zustand'
import { createNewBlock, FormBlock, getBlockDefinition } from '@/registry/blockRegistry'

interface FormData {
  id: string
  title: string
  description?: string
  settings: {
    showProgressBar: boolean
    requireSignIn: boolean
    theme: string
    primaryColor: string
    fontFamily: string
    estimatedTime?: number
    estimatedTimeUnit?: 'minutes' | 'hours'
    redirectUrl?: string
    customCss?: string
  }
}

interface FormBuilderState {
  // Form data
  formData: FormData
  blocks: FormBlock[]
  currentBlockId: string | null
  isLoading: boolean
  isSaving: boolean
  
  // UI state
  sidebarOpen: boolean
  blockSelectorOpen: boolean
  
  // Actions
  setFormData: (data: Partial<FormData>) => void
  setBlocks: (blocks: FormBlock[]) => void
  addBlock: (blockTypeId: string) => void
  updateBlock: (blockId: string, updates: Partial<FormBlock>) => void
  updateBlockSettings: (blockId: string, settings: Record<string, any>) => void
  removeBlock: (blockId: string) => void
  reorderBlocks: (startIndex: number, endIndex: number) => void
  setCurrentBlockId: (blockId: string | null) => void
  setSidebarOpen: (open: boolean) => void
  setBlockSelectorOpen: (open: boolean) => void
  
  // Form operations
  saveForm: () => Promise<void>
  loadForm: (formId: string) => Promise<void>
  
  // Helper getters
  getCurrentBlock: () => FormBlock | null
}

// Initial empty form data
const defaultFormData: FormData = {
  id: '',
  title: 'Untitled Form',
  description: '',
  settings: {
    showProgressBar: true,
    requireSignIn: false,
    theme: 'default',
    primaryColor: '#0284c7',
    fontFamily: 'inter'
  }
}

export const useFormBuilderStore = create<FormBuilderState>((set, get) => ({
  // Initial state
  formData: { ...defaultFormData },
  blocks: [],
  currentBlockId: null,
  isLoading: false,
  isSaving: false,
  sidebarOpen: true,
  blockSelectorOpen: false,
  
  // Actions
  setFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data }
  })),
  
  setBlocks: (blocks) => set({ blocks }),
  
  addBlock: (blockTypeId) => {
    const { blocks } = get()
    const newBlock = createNewBlock(blockTypeId, blocks.length)
    
    set((state) => ({
      blocks: [...state.blocks, newBlock],
      currentBlockId: newBlock.id
    }))
  },
  
  updateBlock: (blockId, updates) => set((state) => ({
    blocks: state.blocks.map(block => 
      block.id === blockId 
        ? { ...block, ...updates } 
        : block
    )
  })),
  
  updateBlockSettings: (blockId, settings) => set((state) => ({
    blocks: state.blocks.map(block => 
      block.id === blockId 
        ? { ...block, settings: { ...block.settings, ...settings } } 
        : block
    )
  })),
  
  removeBlock: (blockId) => set((state) => {
    const newBlocks = state.blocks.filter(block => block.id !== blockId)
    
    // Recalculate order for all blocks
    const updatedBlocks = newBlocks.map((block, index) => ({
      ...block,
      order: index
    }))
    
    // If we're removing the current block, select the previous one or the next one
    let newCurrentBlockId = state.currentBlockId
    if (state.currentBlockId === blockId) {
      const currentIndex = state.blocks.findIndex(b => b.id === blockId)
      const previousBlock = updatedBlocks[currentIndex - 1]
      const nextBlock = updatedBlocks[currentIndex]
      
      newCurrentBlockId = previousBlock?.id || nextBlock?.id || null
    }
    
    return {
      blocks: updatedBlocks,
      currentBlockId: newCurrentBlockId
    }
  }),
  
  reorderBlocks: (startIndex, endIndex) => set((state) => {
    const result = Array.from(state.blocks)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    
    // Recalculate order for all blocks
    const updatedBlocks = result.map((block, index) => ({
      ...block,
      order: index
    }))
    
    return { blocks: updatedBlocks }
  }),
  
  setCurrentBlockId: (blockId) => set({ currentBlockId: blockId }),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  setBlockSelectorOpen: (open) => set({ blockSelectorOpen: open }),
  
  // Form operations - These would be expanded with actual API calls
  saveForm: async () => {
    set({ isSaving: true })
    
    try {
      // This would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate successful save
      console.log('Form saved:', { formData: get().formData, blocks: get().blocks })
      
    } catch (error) {
      console.error('Error saving form:', error)
    } finally {
      set({ isSaving: false })
    }
  },
  
  loadForm: async (formId) => {
    set({ isLoading: true })
    
    try {
      // This would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For now, just load some sample data if it's not a new form
      if (formId !== 'new') {
        set({
          formData: {
            ...defaultFormData,
            id: formId,
            title: 'Sample Loaded Form',
            description: 'This is a sample form loaded from the API'
          },
          blocks: [
            createNewBlock('short-text', 0),
            createNewBlock('multiple-choice', 1),
            createNewBlock('email', 2)
          ],
          currentBlockId: formId === 'new' ? null : undefined // Will be set to first block below
        })
      } else {
        // New form - just set the formId
        set({
          formData: {
            ...defaultFormData,
            id: 'new'
          }
        })
      }
      
      // Set current block to first block if none selected
      const { blocks, currentBlockId } = get()
      if (blocks.length > 0 && currentBlockId === undefined) {
        set({ currentBlockId: blocks[0].id })
      }
      
    } catch (error) {
      console.error('Error loading form:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  
  // Helper getters
  getCurrentBlock: () => {
    const { blocks, currentBlockId } = get()
    return blocks.find(block => block.id === currentBlockId) || null
  }
}))

// Hook to get block definition for the current block
export const useCurrentBlockDefinition = () => {
  const { getCurrentBlock } = useFormBuilderStore()
  const currentBlock = getCurrentBlock()
  
  if (!currentBlock) return null
  
  try {
    return getBlockDefinition(currentBlock.blockTypeId)
  } catch (error) {
    console.error('Error getting block definition:', error)
    return null
  }
}
