"use client"

import { StateCreator } from 'zustand'
import type { FormPersistenceSlice } from '@/types/form-store-slices-types'
import type { FormBuilderState } from '@/types/store-types'
import { saveFormWithBlocks } from '@/services/form/saveFormWithBlocks'
import { saveDynamicBlockConfig } from '@/services/form/saveDynamicBlockConfig'
import { saveWorkflowEdges } from '@/services/form/saveWorkflowEdges'
import { loadFormComplete, loadVersionedFormComplete } from '@/services/viewer'
import type { SaveFormInput } from '@/types/form-service-types'
import type { ApiBlockType, ApiBlockSubtype, UiBlock } from '@/types/block'
import type { DbBlock } from '@/types/block/DbBlock'
import type { Connection } from '@/types/workflow-types'
import type { CustomFormData } from '@/types/form-builder-types'
import type { FormTheme } from '@/types/theme-types'
import type { JsonObject } from '@/types/common-types'

// Mixed block type that can handle both database and API property names
// This helps during the transition between the different layer formats
type MixedBlock = {
  id: string;
  // Allow both API and DB property names
  formId?: string;
  form_id?: string;
  type: string;
  subtype?: string;
  blockTypeId?: string; // Legacy property name
  title: string;
  description?: string;
  required?: boolean;
  // Allow both API and DB property names for ordering
  orderIndex?: number;
  order_index?: number;
  settings?: Record<string, unknown>;
  // Allow both API and DB property names for timestamps
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
};

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
      // The service expects UiBlock format, which has different property names
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
      
      // We're using DbBlock format for the API, so the cast is safe
      const result = await saveFormWithBlocks(input, formBlocksForSaving as DbBlock[])

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
      console.error('No block ID in save result');
      return;
    }

    // Get the current state
    const state = get();
    const { blocks } = state;
    
    // Find the target block
    const block = blocks.find(b => b.id === blockId);
    if (!block) {
      console.error(`Block ${blockId} not found in current blocks`);
      return;
    }

    // Only save dynamic block config if it's a dynamic block
    if (block.type !== 'dynamic') {
      // No need to save config for static blocks
      return;
    }

    set({ isSaving: true });

    try {
      console.log(`\u{1F504} Saving dynamic config for block: ${block.id}`);
      
      // Always initialize with an empty object
      const dynamicConfig: Record<string, unknown> = {};
      
      // For AI conversation blocks, convert the settings from the UI schema
      // to the database schema expected by the API
      if (block.subtype === 'ai_conversation') {
        // Map basic settings
        if (block.settings?.initialQuestion) {
          dynamicConfig.starterQuestion = block.settings.initialQuestion;
        }
        
        if (block.settings?.temperature !== undefined) {
          dynamicConfig.temperature = parseFloat(block.settings.temperature as string);
        }
        
        if (block.settings?.maxQuestions !== undefined) {
          dynamicConfig.max_questions = parseInt(block.settings.maxQuestions as string, 10);
        }
        
        // Map AI instructions (system prompt)
        if (block.settings?.promptConfig?.systemPrompt) {
          dynamicConfig.ai_instructions = block.settings.promptConfig.systemPrompt;
        } else if (block.settings?.systemPrompt) {
          dynamicConfig.ai_instructions = block.settings.systemPrompt;
        }
        
        // Map prompt configuration
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
    
    // Find the target block index
    const blockIndex = blocks.findIndex(b => b.id === blockId)
    if (blockIndex === -1) {
      console.error(`Block ${blockId} not found`)
      return false
    }
    
    // Get block definition for this type
    const blockDef = window.blockRegistry?.[blockTypeId]
    if (!blockDef) {
      console.error(`Block definition for ${blockTypeId} not found`)
      return false
    }
    
    try {
      set({ isSaving: true })
      
      // Create a copy of the blocks array
      const updatedBlocks = [...blocks]
      
      // Get default settings from block definition or use empty object
      const defaultSettings = blockDef.getDefaultValues ? blockDef.getDefaultValues() : {}
      
      // Update the specific block
      updatedBlocks[blockIndex] = {
        ...updatedBlocks[blockIndex],
        type, // 'static', 'dynamic', etc.
        subtype: blockTypeId as ApiBlockSubtype, // 'text', 'checkbox', etc.
        title: blockDef.defaultTitle || updatedBlocks[blockIndex].title,
        description: blockDef.defaultDescription || updatedBlocks[blockIndex].description,
        settings: defaultSettings,
        updatedAt: new Date().toISOString()
      }
      
      // Update state with the new blocks array
      set({ blocks: updatedBlocks })
      
      console.log(`\u2705 Block type updated: ${blockId} -> ${type}/${blockTypeId}`)
      
      return true
    } catch (error) {
      console.error('Error updating block type:', error)
      return false
    } finally {
      set({ isSaving: false })
    }
  },
  
  // Auto-save form at regular intervals
  startAutoSave: () => {
    // Check if window is available (client-side only)
    if (typeof window === 'undefined') return
    
    // Clear any existing interval
    if (window.autoSaveInterval) {
      clearInterval(window.autoSaveInterval)
    }
    
    // Set up a new interval for auto-saving
    window.autoSaveInterval = setInterval(() => {
      const state = get()
      const { isSaving } = state
      
      // Don't trigger auto-save if already saving
      if (!isSaving) {
        console.log('\u23F1 Auto-save triggered')
        get().saveForm()
      }
    }, 60000) // Auto-save every 60 seconds
    
    console.log('\u23F3 Auto-save enabled')
  },
  
  // Save form - orchestrates the entire form saving process
  // Must return Promise<void> per interface definition
  saveForm: async () => {
    // Prevent saving if no form data
    const { formData, isSaving } = get()
    if (!formData || isSaving) return
    
    // Set saving state
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
          // Use MixedBlock type to safely access properties from both DB and API formats
          const b = block as MixedBlock
          return {
            id: b.id,
            formId: b.formId || b.form_id || '',
            type: b.type,
            subtype: b.subtype || b.subtype || 'text',
            title: b.title,
            description: b.description,
            required: b.required,
            orderIndex: b.orderIndex || b.orderIndex || 0,
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
          // Use MixedBlock type to safely access properties from both DB and API formats
          const b = block as MixedBlock
          return {
            id: b.id,
            formId: b.formId || b.form_id || '',
            type: b.type,
            subtype: b.subtype || b.subtype || 'text',
            title: b.title,
            description: b.description,
            required: b.required,
            orderIndex: b.orderIndex || b.orderIndex || 0,
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
