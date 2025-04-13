"use client"

import { create } from 'zustand'
import { createNewBlock, FormBlock, getBlockDefinition } from '@/registry/blockRegistry'
import { saveFormWithBlocks } from '@/services/form/saveFormWithBlocks'
import { Form as SupabaseForm, FormBlock as DbFormBlock } from '@/types/supabase-types'
import { createClient } from '@/lib/supabase/client'

interface FormData {
  id: string
  title: string
  description?: string
  workspace_id?: string  // Added for Supabase integration
  created_by?: string    // Added for Supabase integration
  status?: 'draft' | 'published' | 'archived' // Added for Supabase integration
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
  
  // Form operations with actual Supabase API calls
  saveForm: async () => {
    set({ isSaving: true })
    
    try {
      const { formData, blocks } = get()
      
      // Prepare form data for saving - format for RPC function
      const saveData = {
        id: formData.id,
        title: formData.title,
        description: formData.description || '',
        // We always include workspace_id and created_by now since forms 
        // are created with real UUIDs from the start
        workspace_id: formData.workspace_id,
        created_by: formData.created_by,
        status: formData.status || 'draft',
        theme: formData.settings ? {
          name: formData.settings.theme,
          primaryColor: formData.settings.primaryColor,
          fontFamily: formData.settings.fontFamily
        } : {},
        settings: {
          showProgressBar: formData.settings?.showProgressBar ?? true,
          requireSignIn: formData.settings?.requireSignIn ?? false,
          estimatedTime: formData.settings?.estimatedTime,
          estimatedTimeUnit: formData.settings?.estimatedTimeUnit,
          redirectUrl: formData.settings?.redirectUrl,
          customCss: formData.settings?.customCss
        }
      }
      
      // Debug logs before saving
      console.log('==== DEBUG: FormBuilder saveForm ====');
      console.log('Save Data being prepared:', saveData);
      console.log('Blocks to save:', blocks);
      
      // Additional logging to check for any empty arrays in settings
      blocks.forEach((block, index) => {
        console.log(`FormBuilder Block ${index} settings:`, block.settings);
        // Check if any values in settings are empty arrays
        if (block.settings) {
          Object.entries(block.settings).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length === 0) {
              console.log(`Empty array found in block ${index} settings.${key}`);
            }
          });
        }
      });
      
      // Save the form and blocks using RPC transaction
      const result = await saveFormWithBlocks(saveData, blocks)
      
      console.log('Form saved successfully with transaction:', result)
    } catch (error) {
      console.error('Error saving form:', error)
    } finally {
      set({ isSaving: false })
    }
  },
  
  loadForm: async (formId) => {
    set({ isLoading: true })
    
    try {
      const supabase = createClient()
      
      // Fetch the form data
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('form_id', formId)
        .single()
      
      if (formError) {
        console.error('Error fetching form:', formError)
        throw formError
      }
      
      // Fetch the form blocks
      const { data: blocksData, error: blocksError } = await supabase
        .from('form_blocks')
        .select('*')
        .eq('form_id', formId)
        .order('order_index', { ascending: true })
      
      if (blocksError) {
        console.error('Error fetching blocks:', blocksError)
        throw blocksError
      }
      
      // Map database blocks to frontend format
      const frontendBlocks = blocksData && blocksData.length > 0
        ? blocksData.map((block: DbFormBlock, index: number) => {
            // Here we'd convert from DB format to frontend format
            // For now, just create generic blocks
            return createNewBlock(block.subtype || 'short-text', index) 
          })
        : []
      
      // Update the store with form and blocks
      set({
        formData: {
          id: formData.form_id,
          title: formData.title || 'Untitled Form',
          description: formData.description || '',
          workspace_id: formData.workspace_id,
          created_by: formData.created_by,
          status: formData.status || 'draft',
          settings: formData.settings || defaultFormData.settings
        },
        blocks: frontendBlocks,
        currentBlockId: frontendBlocks.length > 0 ? frontendBlocks[0].id : null
      })
      
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
