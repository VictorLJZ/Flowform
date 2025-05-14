"use client"

import { StateCreator } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { FormPersistenceSlice } from '@/types/form-store-slices-types'
import type { FormBuilderState } from '@/types/store-types'
import { saveFormWithBlocks } from '@/services/form/saveFormWithBlocks'
import { saveDynamicBlockConfig } from '@/services/form/saveDynamicBlockConfig'
import { saveWorkflowEdges } from '@/services/form/saveWorkflowEdges'
import { loadFormComplete, loadVersionedFormComplete } from '@/services/viewer'
import type { SaveFormInput } from '@/types/form-service-types'
import type { ApiBlockType, ApiBlockSubtype, UiBlock } from '@/types/block'
import type { Connection } from '@/types/workflow-types'
import type { CustomFormData } from '@/types/form-builder-types'
import type { FormTheme } from '@/types/theme-types'
import type { JsonObject } from '@/types/common-types'

export const createFormPersistenceSlice: StateCreator<
  FormBuilderState,
  [],
  [],
  FormPersistenceSlice
> = (set, get) => ({
  isSaving: false,
  isLoading: false,
  isVersioned: false,

  // Save the form and blocks
  saveFormAndBlocks: async () => {
    const { formData, blocks } = get()
    
    try {
      console.log('⏱️ Saving form and blocks...', {
        formId: formData.form_id,
        blockCount: blocks.length,
      })
      
      // Convert our form data to the SaveFormInput type expected by the service
      const input: SaveFormInput = {
        form_id: formData.form_id,
        title: formData.title || 'Untitled Form',
        description: formData.description,
        workspace_id: typeof formData.workspace_id === 'string' ? formData.workspace_id : '',
        created_by: typeof formData.created_by === 'string' ? formData.created_by : '',
        status: formData.status,
        theme: formData.theme as unknown as Record<string, unknown>,
        settings: formData.settings,
      }

      // Add blocks to match API expectations
      // Convert UiBlock to format expected by saveFormWithBlocks
      // We need to explicitly convert to the format expected by the service
      // The service expects FormBlock format, which has different property names
      const formBlocksForSaving = blocks.map((block) => ({
        id: block.id,
        form_id: formData.form_id,
        type: block.type,
        subtype: block.subtype,
        title: block.title,
        description: block.description,
        required: block.required,
        order_index: block.orderIndex,
        settings: block.settings || {}, // Ensure settings is never null
        blockTypeId: block.subtype, // For backward compatibility with the service
        created_at: block.createdAt,
        updated_at: block.updatedAt
      }));
      
      // Type assertion to satisfy the compiler
      const result = await saveFormWithBlocks(input, formBlocksForSaving as any)

      if (result) {
        console.log('✅ Form saved')
        return {
          result: result as unknown as JsonObject,
          isExistingForm: true
        }
      } else {
        console.error('❌ Form save failed')
        return null
      }
    } catch (error) {
      console.error('Error saving form:', error)
      return null
    }
  },

  // Save workflow edges for a form
  saveWorkflowEdges: async (formId: string): Promise<boolean> => {
    const state = get()
    const { connections } = state

    if (!connections || connections.length === 0) {
      console.log('No connections to save')
      return true
    }

    // Save workflow edges
    try {
      const result = await saveWorkflowEdges(formId, connections)
      return !!result.success // Convert to boolean
    } catch (error) {
      console.error('Error saving workflow edges:', error)
      return false
    }
  },

  // Separate function to save dynamic block configurations
  saveDynamicBlockConfigs: async (result: JsonObject) => {
    // Extract blockId from result
    const blockId = result.id as string || result.blockId as string;
    if (!blockId) {
      console.error('No blockId found in result object');
      return;
    }
    
    const state = get()
    const { blocks } = state
    const block = blocks.find(b => b.id === blockId)

    // Skip if block not found or if it's not dynamic
    if (!block || block.type !== 'dynamic') return

    try {
      set({ isSaving: true })

      // Extract settings from the block based on its subtype
      const dynamicConfig: Record<string, unknown> = {}

      if (block.subtype === 'ai_conversation') {
        // Map AI conversation block settings
        dynamicConfig.temperature = block.settings?.temperature || 0.7
        dynamicConfig.maxQuestions = block.settings?.maxQuestions || 3
        dynamicConfig.contextInstructions = block.settings?.contextInstructions || ''

        // For AI blocks, we store the complete prompt configuration
        if (block.settings?.promptConfig) {
          dynamicConfig.promptConfig = block.settings.promptConfig
        }

        // Store any other AI-specific settings
        if (block.settings?.modelId) {
          dynamicConfig.modelId = block.settings.modelId
        }
      } else if (block.subtype === 'hubspot') {
        // Map Hubspot integration settings
        dynamicConfig.fieldsMapping = block.settings?.fieldsMapping || {}
        dynamicConfig.createContact = block.settings?.createContact !== false
      }

      // Save the dynamic configuration
      // Get formData from state
      const { formData } = get()
      // Use the correct function signature
      await saveDynamicBlockConfig(block.id, dynamicConfig)

      console.log(`\u2705 Saved dynamic block config: ${block.id}, type: ${block.subtype}`)
    } catch (error) {
      console.error('Error saving dynamic block config:', error)
    } finally {
      set({ isSaving: false })
    }
  },

  // Setup the correct subtype and settings when a new block type is selected
  saveBlockType: async (blockId: string, blockTypeId: string, type: ApiBlockType = 'static') => {
    const state = get()
    const { blocks } = state
    
    // Find the block being updated
    const blockIndex = blocks.findIndex(b => b.id === blockId)
    if (blockIndex === -1) return

    // Create a copy of the blocks array
    const updatedBlocks = [...blocks]
    
    // Get default settings for the block type
    let defaultSettings: Record<string, unknown> = {}
    
    // Special handling for AI conversation blocks
    if (blockTypeId === 'ai_conversation') {
      defaultSettings = {
        temperature: 0.7,
        maxQuestions: 3,
        contextInstructions: '',
        promptConfig: {
          systemPrompt: 'You are a helpful assistant.',
          userPrompt: ''
        }
      }
    } else if (blockTypeId === 'choice') {
      defaultSettings = {
        options: [
          { id: uuidv4(), text: 'Option 1', value: '1' },
          { id: uuidv4(), text: 'Option 2', value: '2' }
        ],
        allowMultiple: false,
        displayMode: 'radio'
      }
    }

    // Update the block with new type and settings
    const updatedBlock = {
      id: blockId,
      subtype: blockTypeId as ApiBlockSubtype, // Cast to ensure type compatibility
      type,
      orderIndex: state.blocks.length
    }
    
    // Apply the changes and merge with default settings
    updatedBlocks[blockIndex] = { 
      ...updatedBlocks[blockIndex], 
      ...updatedBlock,
      settings: {
        ...updatedBlocks[blockIndex].settings,
        ...defaultSettings
      }
    }

    // Update state with the new blocks array
    set({ blocks: updatedBlocks })

    // For dynamic blocks, we need to immediately save their configuration
    if (type === 'dynamic') {
      setTimeout(() => {
        get().saveDynamicBlockConfigs({ id: blockId } as JsonObject)
      }, 100)
    }
  },

  // Auto-save form at regular intervals
  startAutoSave: () => {
    const interval = setInterval(() => {
      const state = get()
      
      // Skip auto-save if already saving, loading, or user is viewing a published form
      if (state.isSaving || state.isLoading || state.isVersioned) {
        return
      }

      // Skip auto-save if form has no ID
      if (!state.formData?.form_id) {
        return
      }

      // Perform the save
      console.log('\ud83d\udce6 Auto-saving form...')
      
      // Use our orchestrated saveForm method that returns void
      get().saveForm()
    }, 60000) // Auto-save every 60 seconds

    return () => clearInterval(interval)
  },

  // Save form - orchestrates the entire form saving process
  // Must return Promise<void> per interface definition
  saveForm: async () => {
    const state = get()
    const { formData } = state

    if (state.isSaving) {
      console.log('Already saving, skipping this save request')
      return
    }

    set({ isSaving: true })

    try {
      // First save form and blocks
      const saveResult = await get().saveFormAndBlocks()
      
      // Then save workflow edges
      if (saveResult) {
        await get().saveWorkflowEdges(formData.form_id)
      }
    } catch (error) {
      console.error('Error saving form:', error)
    } finally {
      set({ isSaving: false })
    }
  },

  // Load a published/versioned form
  loadVersionedForm: async (formId: string) => {
    // Set loading state
    set({ isLoading: true, isVersioned: true })
    
    try {
      // Use our new modular service to load everything
      const { formData, blocks, connections, nodePositions } = 
        await loadVersionedFormComplete(formId);
      
      // Update the state with all form data
      set({
        formData,
        // Convert blocks to UiBlock format using type assertions for safety
        blocks: (blocks || []).map(block => {
          // Use type assertion to safely access properties regardless of original type
          const b = block as any
          return {
            id: b.id,
            formId: b.formId || b.form_id || '',
            type: b.type,
            subtype: b.subtype || b.blockTypeId || 'text',
            title: b.title,
            description: b.description,
            required: b.required,
            orderIndex: b.orderIndex || b.order_index || 0,
            settings: b.settings || {},
            createdAt: b.createdAt || b.created_at || new Date().toISOString(),
            updatedAt: b.updatedAt || b.updated_at || new Date().toISOString(),
          }
        }) as UiBlock[],
        connections,
        nodePositions,
        isSaving: false,
        // Set current block to the first block if blocks exist
        currentBlockId: blocks.length > 0 ? blocks[0].id : null
      });
      
    } catch (error) {
      console.error('Error loading versioned form:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Load an editable form
  loadForm: async (formId: string) => {
    // Set loading state
    set({ isLoading: true });
    
    try {
      const { formData, blocks, connections, nodePositions } = 
        await loadFormComplete(formId);
      
      // Create a CustomFormData compatible object from the DbForm returned by loadFormComplete
      const formDataWithFormId: CustomFormData = {
        form_id: formData.id, // Ensure form_id is set from id
        title: formData.title,
        description: formData.description || undefined, // Convert null to undefined for CustomFormData compatibility
        workspace_id: typeof formData.workspace_id === 'string' ? formData.workspace_id : '',
        created_by: typeof formData.created_by === 'string' ? formData.created_by : '',
        status: typeof formData.status === 'string' ? (formData.status as 'draft' | 'published' | 'archived') : 'draft',
        // Convert the settings to the expected format
        settings: {
          showProgressBar: formData.settings?.showProgressBar as boolean || false,
          requireSignIn: formData.settings?.requireSignIn as boolean || false,
          theme: formData.settings?.theme as string || 'default',
          primaryColor: formData.settings?.primaryColor as string || '#3b82f6',
          fontFamily: formData.settings?.fontFamily as string || 'Inter',
          estimatedTime: formData.settings?.estimatedTime as number,
          estimatedTimeUnit: formData.settings?.estimatedTimeUnit as 'minutes' | 'hours',
          redirectUrl: formData.settings?.redirectUrl as string,
          customCss: formData.settings?.customCss as string,
          workflow: formData.settings?.workflow as { connections: Connection[] },
        },
        theme: formData.theme as FormTheme,
      };
      
      // Update form state
      set({
        formData: formDataWithFormId,
        blocks: blocks.map(block => {
          // Use type assertion to safely access properties regardless of original type
          const b = block as any
          return {
            id: b.id,
            formId: b.formId || b.form_id || '',
            type: b.type,
            subtype: b.subtype || b.blockTypeId || 'text',
            title: b.title,
            description: b.description,
            required: b.required,
            orderIndex: b.orderIndex || b.order_index || 0,
            settings: b.settings || {},
            createdAt: b.createdAt || b.created_at || new Date().toISOString(),
            updatedAt: b.updatedAt || b.updated_at || new Date().toISOString(),
          }
        }) as UiBlock[],
        connections,
        nodePositions,
        currentBlockId: blocks.length > 0 ? blocks[0].id : null,
        isSaving: false,
      });
      
    } catch (error) {
      console.error('Error loading form:', error);
    } finally {
      set({ isLoading: false });
    }
  },
})
