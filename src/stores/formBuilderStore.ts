"use client"

// zustand imports
import { create, StateCreator } from 'zustand'
import { getBlockDefinition } from '@/registry/blockRegistry'

// service imports
import { saveFormWithBlocks } from '@/services/form/saveFormWithBlocks'
import { saveDynamicBlockConfig } from '@/services/form/saveDynamicBlockConfig'
import { getFormWithBlocksClient } from '@/services/form/getFormWithBlocksClient'

// type imports
import { mapFromDbBlockType, mapToDbBlockType } from '@/utils/blockTypeMapping'
import type { CompleteForm } from '@/types/supabase-types'
import { FormTheme, BlockPresentation, defaultFormTheme, defaultBlockPresentation } from '@/types/theme-types'
import { SlideLayout, getDefaultLayoutByType } from '@/types/layout-types'
import type { FormBlock, BlockType } from '@/types/block-types'
import type { FormData } from '@/types/form-builder-types'
import type { FormBuilderState } from '@/types/store-types'




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

export const formBuilderStoreInitializer: StateCreator<FormBuilderState> = (set, get) => ({
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
  setFormData: (data: Partial<FormData>) => set((state: FormBuilderState) => ({
    formData: { ...state.formData, ...data }
  })),
  
  setBlocks: (blocks: FormBlock[]) => set({ blocks }),
  
  addBlock: (blockTypeId: string) => {
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
    const blockDef = getBlockDefinition(updates.blockTypeId || get().blocks.find((b: FormBlock) => b.id === blockId)?.blockTypeId || '')
    set((state: FormBuilderState) => ({
      blocks: state.blocks.map((block: FormBlock) => {
        if ((block as FormBlock).id === blockId) {
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
  
  updateBlockSettings: (blockId: string, settings: Record<string, unknown>) => set((state: FormBuilderState) => ({
    blocks: state.blocks.map((block: FormBlock) => 
      block.id === blockId 
        ? { 
            ...block, 
            settings: { 
              ...block.settings, 
              ...settings 
            } 
          } 
        : block
    )
  })),
  
  updateBlockLayout: (blockId: string, layoutConfig: Partial<SlideLayout>) => set((state: FormBuilderState) => {
    return {
      blocks: state.blocks.map((block: FormBlock) => {
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
  
  removeBlock: (blockId: string) => set((state: FormBuilderState) => {
    const newBlocks = state.blocks.filter((block: FormBlock) => block.id !== blockId)
    
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
  
  reorderBlocks: (startIndex: number, endIndex: number) => set((state: FormBuilderState) => {
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
  
  setCurrentBlockId: (blockId: string | null) => set({ currentBlockId: blockId }),
  
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  
  setBlockSelectorOpen: (open: boolean) => set({ blockSelectorOpen: open }),
  
  // WYSIWYG methods
  getBlockPresentation: (blockId: string) => {
    const block = get().blocks.find((b: FormBlock) => b.id === blockId)
    return (block?.settings?.presentation as BlockPresentation | undefined) || get().defaultBlockPresentation
  },
  
  setBlockPresentation: (blockId: string, presentation: Partial<BlockPresentation>) => set((state: FormBuilderState) => ({
    blocks: state.blocks.map((block: FormBlock) => 
      block.id === blockId 
        ? { 
            ...block, 
            settings: { 
              ...block.settings, 
              presentation: { 
                ...((block.settings.presentation as BlockPresentation) || defaultBlockPresentation), 
                ...presentation 
              } 
            } 
          } 
        : block
    )
  })),
  
  setFormTheme: (theme: Partial<FormTheme>) => set((state: FormBuilderState) => ({
    formData: { 
      ...state.formData, 
      theme: { 
        ...(state.formData.theme || defaultFormTheme), 
        ...theme 
      } 
    }
  })),
  
  setMode: (mode: 'builder' | 'viewer') => set({ mode }),
  
  // Form operations with actual Supabase API calls
  saveForm: async () => {
    const { formData, blocks, isSaving } = get()
    
    // Prevent multiple save operations
    if (isSaving) {
      return
    }
    
    set({ isSaving: true })
    
    try {
      // Make a copy of the blocks with only the essential properties
      // and map frontend block types to database types
      const blocksToSave = blocks.map((block: FormBlock, index: number) => {
        // Map the block type to database format
        const { type, subtype } = mapToDbBlockType(block.blockTypeId)
        
        return {
          id: block.id,
          form_id: formData.form_id,
          type,
          subtype,
          title: block.title,
          description: block.description,
          required: block.required,
          order_index: index, // Use index directly for order
          settings: block.settings,
          blockTypeId: block.blockTypeId,
          order: index
        }
      })
      
      const result = await saveFormWithBlocks({
        form_id: formData.form_id,
        title: formData.title,
        description: formData.description || '',
        workspace_id: formData.workspace_id,
        created_by: formData.created_by,
        status: formData.status || 'draft',
        theme: formData.theme as unknown as Record<string, unknown>,
        settings: formData.settings
      }, blocksToSave)
      
      // After saving the form, also save any dynamic block configurations separately
      if (result.success) {
        console.log('Form saved successfully')
        
        // Find any dynamic blocks that need their config saved separately
        const dynamicBlocks = blocks.filter(block => 
          block.type === 'dynamic' || block.blockTypeId === 'ai_conversation')
        
        if (dynamicBlocks.length > 0) {
          console.log(`Saving configurations for ${dynamicBlocks.length} dynamic blocks`)
          
          // Save each dynamic block's configuration
          for (const block of dynamicBlocks) {
            await saveDynamicBlockConfig(block.id, block.settings)
            console.log(`Saved configuration for dynamic block: ${block.id}`)
          }
        }
      } else {
        console.error('Error saving form')
      }
    } catch (error) {
      console.error('Error in saveForm:', error)
    } finally {
      set({ isSaving: false })
    }
  },
  
  loadForm: async (formId: string) => {
    set({ isLoading: true })
    
    try {
      // Use the getFormWithBlocks service to get the form and its blocks
      const completeForm = await getFormWithBlocksClient(formId)
      
      if (!completeForm) {
        console.error('Form not found')
        return
      }
      
      const { blocks: blocksData, ...formData } = completeForm as CompleteForm
      
      // Map blocks from database blocks to frontend blocks
      const frontendBlocks = Array.isArray(blocksData)
        ? blocksData.map((block, index: number) => {
            // Map database block type/subtype to correct frontend blockTypeId
            const blockTypeId = mapFromDbBlockType(block.type as BlockType, block.subtype);
            
            // Get the block definition using the mapped blockTypeId
            const blockDef = getBlockDefinition(blockTypeId);
            
            // Get base settings from block or fallback to defaults
            let baseSettings = block.settings || (blockDef?.getDefaultValues ? blockDef.getDefaultValues() : {}) || {};
            
            // For dynamic blocks, merge in the dynamic_config properties with appropriate name mapping
            if (block.type === 'dynamic' && block.dynamic_config) {
              const dynamicSettings = {
                startingPrompt: block.dynamic_config.starter_question || "How can I help you today?",
                temperature: block.dynamic_config.temperature || 0.7,
                maxQuestions: block.dynamic_config.max_questions || 5,
                contextInstructions: block.dynamic_config.ai_instructions || ''
              };
              
              // Merge dynamic settings with any existing settings
              baseSettings = {
                ...baseSettings,
                ...dynamicSettings
              };
              
              console.log('Dynamic block settings loaded for block:', block.id);
            }
            
            // Create a block preserving original properties
            const frontendBlock = {
              id: block.id,
              blockTypeId: blockTypeId, // This is the key ID used to look up in the registry
              type: blockDef?.type || block.type || 'static', // Use registry type if available or preserve DB type
              title: block.title || blockDef?.defaultTitle || '', // Fallback title
              description: block.description || blockDef?.defaultDescription || '',
              required: block.required || false,
              order: block.order_index || index,
              settings: baseSettings // Use settings with dynamic config merged in if applicable
            };
            
            return frontendBlock
          })
        : [] // Handle case where blocksData is null or empty
      
      // Update the store with form and blocks
      set({
        formData: {
          form_id: formData.form_id,
          title: formData.title || 'Untitled Form',
          description: formData.description || '',
          workspace_id: formData.workspace_id,
          created_by: formData.created_by,
          status: formData.status || 'draft',
          // Always use defaultFormTheme as the base and merge with any available theme properties
          theme: defaultFormTheme,
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
    return blocks.find((block: FormBlock) => block.id === currentBlockId) || null
  }
})

// Singleton store hook
export const useFormBuilderStore = create<FormBuilderState>(formBuilderStoreInitializer)

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
