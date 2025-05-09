"use client"

import { StateCreator } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { FormPersistenceSlice } from '@/types/form-store-slices-types'
import type { FormBuilderState } from '@/types/store-types'
import { saveFormWithBlocks } from '@/services/form/saveFormWithBlocks'
import { saveDynamicBlockConfig } from '@/services/form/saveDynamicBlockConfig'
import { saveWorkflowEdges } from '@/services/form/saveWorkflowEdges'
import { loadFormComplete, loadVersionedFormComplete } from '@/services/viewer'
import type { SaveFormInput, SaveFormOutput } from '@/types/form-service-types'
import type { BlockType, FormBlock } from '@/types/block-types'
import type { Connection } from '@/types/workflow-types'
import type { FormData } from '@/types/form-builder-types'
import type { FormTheme } from '@/types/theme-types'

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
    
    // Skip empty forms
    if (!formData.form_id || blocks?.length === 0) {
      console.error('Cannot save form: missing form_id or blocks')
      return null
    }

    try {
      console.log('\u23f1\ufe0f Saving form and blocks...', {
        formId: formData.form_id,
        blockCount: blocks.length,
      })
      
      // Convert our form data to the SaveFormInput type expected by the service
      const input: SaveFormInput = {
        form_id: formData.form_id,
        title: formData.title || 'Untitled Form',
        description: formData.description,
        workspace_id: formData.workspace_id,
        created_by: formData.created_by,
        status: formData.status,
        theme: formData.theme as unknown as Record<string, unknown>,
        settings: formData.settings,
      }

      // Add blocks to match API expectations
      const result = await saveFormWithBlocks(
        input,
        blocks.map((block: FormBlock) => ({
          ...block,
          form_id: formData.form_id
        }))
      )

      if (result) {
        console.log('\u2705 Form saved')
        return {
          result,
          isExistingForm: true
        }
      } else {
        console.error('\u274c Form save failed')
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
  saveDynamicBlockConfigs: async (blockId: string) => {
    const state = get()
    const { blocks } = state
    const block = blocks.find(b => b.id === blockId)

    // Skip if block not found or if it's not dynamic
    if (!block || block.type !== 'dynamic') return

    try {
      set({ isSaving: true })

      // Extract settings from the block based on its blockTypeId
      const dynamicConfig: any = {}

      if (block.blockTypeId === 'ai_conversation') {
        // Map AI conversation block settings
        dynamicConfig.temperature = block.settings?.temperature || 0.7
        dynamicConfig.maxQuestions = block.settings?.maxQuestions || 3
        dynamicConfig.contextInstructions = block.settings?.contextInstructions || ''

        // For AI blocks, we store the complete prompt configuration
        if (block.settings?.promptConfig) {
          dynamicConfig.promptConfig = block.settings.promptConfig
        }
      } else if (block.blockTypeId === 'choice') {
        // Map choice block settings
        dynamicConfig.options = block.settings?.options || []
        dynamicConfig.allowMultiple = block.settings?.allowMultiple === true
        dynamicConfig.displayMode = block.settings?.displayMode || 'radio'
      }

      // Save the dynamic configuration
      await saveDynamicBlockConfig(block.id, dynamicConfig)

      console.log(`\u2705 Saved dynamic block config: ${block.id}, type: ${block.blockTypeId}`)
    } catch (error) {
      console.error('Error saving dynamic block config:', error)
    } finally {
      set({ isSaving: false })
    }
  },

  // Setup the correct blockTypeId and settings when a new block type is selected
  saveBlockType: (blockId: string, blockTypeId: string, type: BlockType = 'static') => {
    const state = get()
    const { blocks } = state
    
    // Find the block being updated
    const blockIndex = blocks.findIndex(b => b.id === blockId)
    if (blockIndex === -1) return

    // Create a copy of the blocks array
    const updatedBlocks = [...blocks]
    
    // Get default settings for the block type
    let defaultSettings: any = {}
    
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
    } 
    // Special handling for choice blocks
    else if (blockTypeId === 'choice') {
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
    updatedBlocks[blockIndex] = {
      ...updatedBlocks[blockIndex],
      blockTypeId,
      type,
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
        get().saveDynamicBlockConfigs(blockId)
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

      // Skip auto-save if form has no ID or blocks
      if (!state.formData?.form_id || !state.blocks || state.blocks.length === 0) {
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
    // Skip empty forms
    const state = get()
    const { formData, blocks } = state

    if (!formData.form_id || blocks?.length === 0) {
      console.error('Cannot save form: missing form_id or blocks')
      return
    }

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
      
      // Log key information for debugging
      console.log('\ud83c\udf4d [VERSIONED FORM] Loaded form with:', {
        blockCount: blocks.length,
        connectionCount: connections.length,
        rulesCount: connections.reduce((acc, conn) => acc + (conn.rules?.length || 0), 0)
      });
      
      // When we have connections with rules, log them in detail for debugging
      const connectionsWithRules = connections.filter(c => c.rules && c.rules.length > 0);
      if (connectionsWithRules.length > 0) {
        console.log('\ud83d\udd17\u2696\ufe0f [VERSIONED FORM] Connections with rules:', connectionsWithRules.map(c => ({
          id: c.id,
          sourceId: c.sourceId,
          targetId: c.defaultTargetId,
          rules: c.rules.map(r => ({
            id: r.id,
            target_block_id: r.target_block_id,
            hasConditionGroup: !!r.condition_group,
            conditionCount: r.condition_group?.conditions?.length || 0
          }))
        })));
      }
      
      // Update the state with all form data
      set({
        formData,
        blocks,
        connections,
        nodePositions,
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
      // Use our new modular service to load everything
      const { formData, blocks, connections, nodePositions } = 
        await loadFormComplete(formId);
      
      // Update form state
      set({
        formData,
        blocks,
        connections,
        nodePositions,
        // Set current block to the first block if blocks exist
        currentBlockId: blocks.length > 0 ? blocks[0].id : null
      });
      
      // Add a temporary subscription to watch for connection changes during initial load
      // Using any here because we don't have the store's subscribe type directly available
      // This is just for debugging purposes 
      const storeWithSubscribe = get() as any;
      if (storeWithSubscribe.subscribe) {
        const unsubscribe = storeWithSubscribe.subscribe(
          (state: FormBuilderState, prevState: FormBuilderState) => {
            // Only check if connections changed
            if (state.connections !== prevState.connections) {
              const prev = prevState.connections || [];
              const curr = state.connections || [];
              
              // Check if array length changed - could indicate regeneration
              if (prev.length !== curr.length) {
                console.warn(`\u26a0\ufe0f CONNECTION TRACKING: Connection count changed from ${prev.length} to ${curr.length}`);
              }
              
              // Check specifically for ID changes in connections that maintain the same source/target
              // This would indicate regeneration of connection IDs
              const sourceTargetMap = new Map<string, string>();
              
              // Map source->target to connection ID in previous state
              prev.forEach((conn: Connection) => {
                const key = `${conn.sourceId}->${conn.defaultTargetId}`;
                sourceTargetMap.set(key, conn.id);
              });
              
              // Check current connections against the map
              curr.forEach((conn: Connection) => {
                const key = `${conn.sourceId}->${conn.defaultTargetId}`;
                const prevId = sourceTargetMap.get(key);
                
                if (prevId && prevId !== conn.id) {
                  console.warn(`\u26a0\ufe0f CONNECTION TRACKING: Connection ID changed for ${key}: ${prevId} -> ${conn.id}`);
                }
              });
            }
          }
        );
        
        // Only track for a short time after loading
        setTimeout(() => {
          unsubscribe();
        }, 10000); // 10 seconds
      }
    } catch (error) {
      console.error('Error loading form:', error);
    } finally {
      set({ isLoading: false });
    }
  },
})
