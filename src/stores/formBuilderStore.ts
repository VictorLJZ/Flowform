"use client"

import { create } from 'zustand'
import { useAuthStore } from '@/stores/authStore'
import { FormBlock, getBlockDefinition, BlockType } from '@/registry/blockRegistry'
import { saveFormWithBlocks } from '@/services/form/saveFormWithBlocks'
import { saveDynamicBlockConfig } from '@/services/form/saveDynamicBlockConfig'
import { getFormWithBlocksClient } from '@/services/form/getFormWithBlocksClient'
import { FormBlock as DbFormBlock, StaticBlockSubtype } from '@/types/supabase-types'
import { FormTheme, BlockPresentation, defaultFormTheme, defaultBlockPresentation } from '@/types/theme-types'
import { SlideLayout, getDefaultLayoutByType } from '@/types/layout-types'

interface FormData {
  form_id: string
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
  // WYSIWYG theme data
  theme?: FormTheme
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
  
  // WYSIWYG state
  mode: 'builder' | 'viewer'
  defaultBlockPresentation: BlockPresentation
  getBlockPresentation: (blockId: string) => BlockPresentation
  setBlockPresentation: (blockId: string, presentation: Partial<BlockPresentation>) => void
  setFormTheme: (theme: Partial<FormTheme>) => void
  setMode: (mode: 'builder' | 'viewer') => void
  
  // Actions
  setFormData: (data: Partial<FormData>) => void
  setBlocks: (blocks: FormBlock[]) => void
  addBlock: (blockTypeId: string) => void
  updateBlock: (blockId: string, updates: Partial<FormBlock>) => void
  updateBlockSettings: (blockId: string, settings: Record<string, unknown>) => void
  updateBlockLayout: (blockId: string, layoutConfig: Partial<SlideLayout>) => void
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
  form_id: '',
  title: 'Untitled Form',
  description: '',
  settings: {
    showProgressBar: true,
    requireSignIn: false,
    theme: 'default',
    primaryColor: '#0284c7',
    fontFamily: 'inter'
  },
  theme: defaultFormTheme
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
  
  // WYSIWYG state
  mode: 'builder',
  defaultBlockPresentation: defaultBlockPresentation,
  
  // Actions
  setFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data }
  })),
  
  setBlocks: (blocks) => set({ blocks }),
  
  addBlock: (blockTypeId) => {
    const { blocks } = get()
    const newBlockId = `block-${Date.now()}` // Generate string ID
    const newOrder = blocks.length // Order is still based on length
    const blockDef = getBlockDefinition(blockTypeId)
 
    if (!blockDef) {
      console.error(`Block definition not found for type: ${blockTypeId}`);
      return // Don't add block if definition is missing
    }
 
    const newBlock: FormBlock = { 
      id: newBlockId,
      blockTypeId: blockTypeId,
      type: blockDef.type || 'static', // Ensure type is valid
      title: blockDef.defaultTitle || '', // Ensure title is string
      description: blockDef.defaultDescription || '',
      required: false,
      order: newOrder,
      settings: blockDef.getDefaultValues() || {}, // Ensure settings is object
    }
 
    const updatedBlocks = [...blocks, newBlock].sort((a, b) => a.order - b.order)
    set(() => ({
      blocks: updatedBlocks,
      currentBlockId: newBlockId
    }))
  },
  
  updateBlock: (blockId: string, updates: Partial<FormBlock>) => {
    const blockDef = getBlockDefinition(updates.blockTypeId || get().blocks.find(b => b.id === blockId)?.blockTypeId || '')
    set((state) => ({
      blocks: state.blocks.map((block) => {
        if (block.id === blockId) {
          return {
            ...block,
            ...updates,
            ...(updates.blockTypeId && {
              type: blockDef?.type || 'static', // Update type based on new def, provide default
              settings: blockDef?.getDefaultValues() || {}, // Reset settings based on new def, provide default
            }),
          }
        }
        return block
      }),
    }))
  },
  
  updateBlockSettings: (blockId: string, settings: Record<string, unknown>) => set((state) => ({
    blocks: state.blocks.map(block => 
      block.id === blockId 
        ? { ...block, settings: { ...block.settings, ...settings } } 
        : block
    )
  })),
  
  updateBlockLayout: (blockId: string, layoutConfig: Partial<SlideLayout>) => set((state) => {
    return {
      blocks: state.blocks.map(block => {
        if (block.id === blockId) {
          // If layout type is changing, get the default settings for the new layout type
          let updatedLayout: SlideLayout;
          
          if (layoutConfig.type && layoutConfig.type !== (block.settings?.layout as SlideLayout | undefined)?.type) {
            // Start with defaults for the new layout type
            updatedLayout = getDefaultLayoutByType(layoutConfig.type);
            // Then apply any specific overrides from layoutConfig
            updatedLayout = { ...updatedLayout, ...layoutConfig } as SlideLayout;
          } else {
            // If we already have a layout or are just updating properties
            const currentLayout = block.settings?.layout || { type: 'standard' };
            updatedLayout = { ...currentLayout, ...layoutConfig } as SlideLayout;
          }
          
          return { 
            ...block, 
            settings: { 
              ...block.settings, 
              layout: updatedLayout 
            } 
          };
        }
        return block;
      })
    };
  }),
  
  removeBlock: (blockId: string) => set((state) => {
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
  
  // WYSIWYG methods
  getBlockPresentation: (blockId) => {
    const block = get().blocks.find(b => b.id === blockId)
    return (block?.settings?.presentation as BlockPresentation | undefined) || get().defaultBlockPresentation
  },
  
  setBlockPresentation: (blockId, presentation) => set((state) => ({
    blocks: state.blocks.map(block => 
      block.id === blockId 
        ? { 
            ...block, 
            settings: { 
              ...block.settings, 
              presentation: { 
                ...(block.settings.presentation || defaultBlockPresentation), 
                ...presentation 
              } 
            } 
          } 
        : block
    )
  })),
  
  setFormTheme: (theme) => set((state) => ({
    formData: { 
      ...state.formData, 
      theme: { 
        ...(state.formData.theme || defaultFormTheme), 
        ...theme 
      } 
    }
  })),
  
  setMode: (mode) => set({ mode }),
  
  // Form operations with actual Supabase API calls
  saveForm: async () => {
    set({ isSaving: true })
    
    try {
      const { formData, blocks } = get()
      const userId = useAuthStore.getState().user?.id
      
      // Prepare form data for saving - format for RPC function
      const saveData = {
        form_id: formData.form_id,
        title: formData.title,
        description: formData.description || '',
        // Always ensure workspace_id and created_by are set
        workspace_id: formData.workspace_id,
        created_by: formData.created_by || userId,
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
      
      // Validate workspace_id is available
      if (!saveData.workspace_id) {
        throw new Error('No workspace selected. Please select a workspace before saving.')
      }
      
      // Debug logs before saving
      console.log('==== DEBUG: FormBuilder saveForm ====');
      console.log('Save Data being prepared:', JSON.stringify(saveData, null, 2));
      console.log('Form theme data:', JSON.stringify(formData.theme, null, 2));
      
      // Log detailed block information
      console.log('Detailed block information:');
      blocks.forEach((block, index) => {
        console.log(`Block ${index} (${block.id}):`, JSON.stringify(block, null, 2));
        
        // Check for non-standard properties that might cause DB issues
        const standardProps = ['id', 'blockTypeId', 'type', 'title', 'description', 'required', 'order', 'settings'];
        const unusualProps = Object.keys(block).filter(key => !standardProps.includes(key));
        
        if (unusualProps.length > 0) {
          console.log(`⚠️ Block ${index} has non-standard properties:`, unusualProps);
        }
      });
      
      console.log('Blocks being sent to database:', blocks);
      
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
      
      // Handle dynamic blocks - save their specialized configuration
      const dynamicBlocksToProcess = blocks.filter(block => block.type === 'dynamic')
      
      // Process dynamic blocks to save their configuration
      if (dynamicBlocksToProcess.length > 0) {
        console.log(`Processing ${dynamicBlocksToProcess.length} dynamic blocks for configuration`)
        
        // Find the corresponding saved blocks with proper UUIDs
        for (const frontendBlock of dynamicBlocksToProcess) {
          // Find the matching saved block by comparing properties, since IDs may have changed
          const savedBlock = result.blocks.find(b => 
            b.title === frontendBlock.title && 
            b.order_index === frontendBlock.order
          )
          
          if (savedBlock) {
            // Save the dynamic block configuration
            await saveDynamicBlockConfig(savedBlock.id, frontendBlock.settings)
            console.log(`Saved configuration for dynamic block: ${savedBlock.id}`)
          }
        }
      }
    } catch (error) {
      console.error('Error saving form:', error)
    } finally {
      set({ isSaving: false })
    }
  },
  
  loadForm: async (formId) => {
    set({ isLoading: true })
    
    try {
      // Use the getFormWithBlocks service to get the form and its blocks
      const completeForm = await getFormWithBlocksClient(formId)
      
      if (!completeForm) {
        console.error('Form not found')
        throw new Error('Form not found')
      }
      
      const formData = completeForm
      const blocksData = completeForm.blocks
      
      console.log('==== DEBUG: FormBuilder loadForm - Block Mapping ====');
      
      // Map database blocks to frontend format preserving their original properties
      const frontendBlocks = blocksData && blocksData.length > 0
        ? blocksData.map((block: DbFormBlock, index: number) => {
            // Get the block definition for validation and default values
            const blockTypeId = block.subtype as StaticBlockSubtype | 'dynamic'; // Use correct subtype union
            const blockDef = getBlockDefinition(blockTypeId)
             
            // Debug logging for this specific block
            console.log(`Block ${index + 1} (${block.id}):`);
            console.log(`  - From DB: subtype = "${block.subtype}"`)
            console.log(`  - Mapped to blockTypeId = "${blockTypeId}"`);
            
            if (!blockDef) {
              console.error(`  - Block definition not found for typeId: ${blockTypeId}. Skipping detailed log.`);
              // Return a minimal valid block if definition is missing
              return {
                id: block.id,
                blockTypeId: blockTypeId,
                type: 'static' as BlockType, // Ensure it matches BlockType
                title: block.title || 'Untitled Block', // Default title
                description: block.description || '',
                required: block.required || false,
                order: block.order_index || index,
                settings: block.settings || {}
              }
            }
            
            console.log(`  - Found Block definition:`, {
              id: blockDef.id, 
              name: blockDef.name,
              type: blockDef.type,
              category: blockDef.category,
              iconExists: blockDef.icon ? 'yes' : 'no',
              iconType: blockDef.icon ? typeof blockDef.icon : 'undefined'
            });
             
            // Create a block preserving original properties
            return {
              id: block.id,
              blockTypeId: blockTypeId,
              type: blockDef.type || 'static', // Fallback type
              title: block.title || blockDef.defaultTitle || '', // Fallback title
              description: block.description || blockDef.defaultDescription || '',
              required: block.required || false,
              order: block.order_index || index,
              settings: block.settings || blockDef.getDefaultValues() || {} // Fallback settings
            }
          })
        : [] // Handle case where blocksData is null or empty
      
      // Theme data is available from formData.theme if needed
      
      // Update the store with form and blocks
      set({
        formData: {
          form_id: formData.form_id,
          title: formData.title || 'Untitled Form',
          description: formData.description || '',
          workspace_id: formData.workspace_id,
          created_by: formData.created_by,
          status: formData.status || 'draft',
          settings: formData.settings ? {
            showProgressBar: typeof formData.settings.showProgressBar === 'boolean' ? formData.settings.showProgressBar : defaultFormData.settings.showProgressBar,
            requireSignIn: typeof formData.settings.requireSignIn === 'boolean' ? formData.settings.requireSignIn : defaultFormData.settings.requireSignIn,
            theme: typeof formData.settings.theme === 'string' ? formData.settings.theme : defaultFormData.settings.theme,
            primaryColor: typeof formData.settings.primaryColor === 'string' ? formData.settings.primaryColor : defaultFormData.settings.primaryColor,
            fontFamily: typeof formData.settings.fontFamily === 'string' ? formData.settings.fontFamily : defaultFormData.settings.fontFamily,
            estimatedTime: typeof formData.settings.estimatedTime === 'number' ? formData.settings.estimatedTime : undefined,
            estimatedTimeUnit: formData.settings.estimatedTimeUnit as 'minutes' | 'hours' | undefined,
            redirectUrl: typeof formData.settings.redirectUrl === 'string' ? formData.settings.redirectUrl : undefined,
            customCss: typeof formData.settings.customCss === 'string' ? formData.settings.customCss : undefined
          } : defaultFormData.settings
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
