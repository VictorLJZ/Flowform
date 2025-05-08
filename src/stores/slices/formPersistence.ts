"use client"

import { StateCreator } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { FormPersistenceSlice } from '@/types/form-store-slices-types'
import type { FormBuilderState } from '@/types/store-types'
import { saveFormWithBlocks } from '@/services/form/saveFormWithBlocks'
import { saveDynamicBlockConfig } from '@/services/form/saveDynamicBlockConfig'
import { getFormWithBlocksClient } from '@/services/form/getFormWithBlocksClient'
import { getVersionedFormWithBlocksClient } from '@/services/form/getVersionedFormWithBlocksClient'
import { transformVersionedFormData } from '@/services/form/transformVersionedFormData'
// Import used as a function reference for the edgeUpdateFn variable in saveForm
// The TypeScript compiler doesn't detect this dynamic usage
/* eslint-disable @typescript-eslint/no-unused-vars */
import { saveWorkflowEdges } from '@/services/form/saveWorkflowEdges'
/* eslint-enable @typescript-eslint/no-unused-vars */
import { createClient } from '@/lib/supabase/client'
import { mapFromDbBlockType } from '@/utils/blockTypeMapping'
import { defaultFormTheme } from '@/types/theme-types'
import { defaultFormData } from './formCore'
import type { SaveFormInput } from '@/types/form-service-types'
import type { BlockType } from '@/types/block-types'
// FormBlock type is used for the DbFormBlock interface definition
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { FormBlock } from '@/types/block-types'
/* eslint-enable @typescript-eslint/no-unused-vars */

// Define proper interfaces for database-returned blocks and workflow conditions

// Interface for workflow condition objects that matches ConditionRule
interface WorkflowCondition {
  id: string;  // Required by ConditionRule
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number | boolean;
  // Optional additional properties that might be in the DB
  condition_id?: string;
  condition_value?: string | number | boolean | null;
  condition_operator?: string;
}

// Define a proper interface for database-returned blocks to avoid 'any' types
interface DbFormBlock {
  id: string;
  blockTypeId: string;
  type: BlockType;
  title: string;
  description?: string;
  required: boolean;
  order_index: number;
  settings?: {
    temperature?: number;
    maxQuestions?: number;
    contextInstructions?: string;
    options?: unknown[];
    [key: string]: unknown;
  };
  // Additional fields that might exist in database blocks
  subtype?: string;
  form_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const createFormPersistenceSlice: StateCreator<
  FormBuilderState,
  [],
  [],
  FormPersistenceSlice
> = (set, get) => ({
  // Initial state
  isSaving: false,
  isLoading: false,
  isVersioned: false,
  
  // Actions
  saveFormAndBlocks: async (): Promise<{ result: any, isExistingForm: boolean } | null> => {
    const { formData, blocks } = get()
    
    try {
      // We will submit to Supabase

      
      // Get authenticated user
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.error('User not authenticated')
        throw new Error('User not authenticated')
      }
      
      // Check if we're editing an existing form or creating a new one
      const isExistingForm = !!formData.form_id && formData.form_id !== ''
      
      // Update form data with user ID if not set
      const updatedFormData = {
        ...formData,
        created_by: formData.created_by || user.id,
        status: formData.status || 'draft'
      }
      
      // Include node positions in settings but not connections
      // Connections will be saved separately to workflow_edges table
      const formSettings = {
        ...updatedFormData.settings,
        workflow: {
          nodePositions: get().nodePositions
        }
      }
      

      
      // IMPORTANT: saveFormWithBlocks does its own type mapping internally
      // Instead of manually setting type/subtype, we need to ensure blockTypeId is correct
      // since saveFormWithBlocks will call mapToDbBlockType again with these blockTypeId values
      const backendBlocks = blocks.map((block, index) => {
        // Ensure blockTypeId is properly set for different block types
        let fixedBlockTypeId = block.blockTypeId
        
        // For dynamic blocks, ensure blockTypeId is 'ai_conversation'
        if (block.type === 'dynamic' && block.blockTypeId !== 'ai_conversation') {

          fixedBlockTypeId = 'ai_conversation'
        }
        // For multiple choice blocks, ensure correct blockTypeId
        else if (block.blockTypeId === 'multiple_choice' || 
                 (block.settings?.options && Array.isArray(block.settings.options))) {

          fixedBlockTypeId = 'multiple_choice'
        }
        

        
        // Return the minimal version that saveFormWithBlocks expects
        return {
          id: block.id,
          blockTypeId: fixedBlockTypeId,  // Critical - saveFormWithBlocks will map this
          title: block.title,
          description: block.description || '',
          required: block.required,
          order_index: block.order_index,
          settings: block.settings || {},
          type: block.type  // Add the required type property
        }
      })
      

      
      // Create input for the saveFormWithBlocks service
      const formInput: SaveFormInput = {
        form_id: formData.form_id,
        title: formData.title,
        description: formData.description,
        workspace_id: formData.workspace_id,
        created_by: updatedFormData.created_by,
        status: updatedFormData.status,
        // Safely convert FormTheme to Record<string, unknown>
        theme: formData.theme ? JSON.parse(JSON.stringify(formData.theme)) : undefined,
        settings: formSettings
      }
      


      
      // Save form with blocks
      const result = await saveFormWithBlocks(formInput, backendBlocks)

      
      // Update the form ID in state if it's a new form
      if (!isExistingForm && result?.form?.form_id) {
        set((state) => ({
          formData: {
            ...state.formData,
            form_id: result.form.form_id
          }
        }))
      }
      
      // Save dynamic block configs
      await get().saveDynamicBlockConfigs(result);
        
      return { result, isExistingForm }
    } catch (error: Error | unknown) {
      console.error('Error saving form and blocks:', error)
      throw error
    }
  },

  saveWorkflowEdges: async (formId: string): Promise<boolean> => {
    const { connections } = get()
    

    
    try {
      // Get Supabase client
      const supabase = createClient()
      
      // First delete any existing connections
      await supabase
        .from('workflow_edges')
        .delete()
        .eq('form_id', formId)
      
      // If there are no connections to save, we're done
      if (connections.length === 0) {

        return true
      }
      


      
      // Prepare connection data for database format
      const workflowEdges = connections.map((conn, index) => {
        // Map connection to database schema format
        // Note: According to schema, there is no condition_type or condition_json column
        // Instead we should use the available fields: condition_field, condition_operator, condition_value
        const edge = {
          form_id: formId,
          source_block_id: conn.sourceId,
          target_block_id: conn.targetId,
          // Store the first condition's data in the individual fields
          condition_field: conn.conditions?.[0]?.field || null,
          condition_operator: conn.conditions?.[0]?.operator || null,
          // condition_value is JSONB type in the database, so we send the raw value
          condition_value: conn.conditions?.[0]?.value !== undefined ? conn.conditions[0].value : null,
          order_index: index
        }
        

        return edge
      })
      

      
      // Insert all connections in batch
      const { data, error } = await supabase
        .from('workflow_edges')
        .insert(workflowEdges)
        .select()
      
      if (error) {
        console.error('❌ WORKFLOW ERROR: Failed to save workflow edges:', error)
        return false
      } 
      


      return true
    } catch (error) {
      console.error('Error managing workflow edges:', error)
      return false
    }
  },

  saveDynamicBlockConfigs: async (result: any): Promise<void> => {
    if (!result?.blocks || result.blocks.length === 0) {

      return
    }
    

    
    // Identify blocks that are specifically dynamic type
    // Cast the result blocks to our DbFormBlock type for proper typing
    const savedBlocks = (result.blocks || []) as DbFormBlock[]
    

    // Use our proper database block type interface
    const dynamicBlocks = savedBlocks.filter((block) => {
      // Check both by type (should be 'dynamic') and by block settings (might contain dynamic config)
      const hasDynamicSettings = !!(block.settings?.temperature || 
                               block.settings?.maxQuestions || 
                               block.settings?.contextInstructions)
                               
      const isDynamic = (block.type === 'dynamic' || 
                       block.subtype === 'dynamic' || 
                       block.title === 'AI Conversation' || 
                       hasDynamicSettings)
                       

      return isDynamic
    })
    
    if (dynamicBlocks.length === 0) {

      return
    }
    

    
    // For each dynamic block, save its configuration
    for (const block of dynamicBlocks) {

      
      // Create a standardized dynamic config object from the saved settings
      // We need to extract the specific properties needed by the dynamic block API
      const dynamicConfig = {
        starter_question: block.settings?.starterQuestion || 
                          block.settings?.contextInstructions || 
                          'How can I help you today?',
        temperature: block.settings?.temperature || 0.7,
        max_questions: block.settings?.maxQuestions || 5,
        ai_instructions: block.settings?.aiInstructions || 
                        block.settings?.contextInstructions || 
                        'You are a helpful assistant responding to form submissions.'
      }
      

      
      try {
        // Save using the properly formatted config for the database
        await saveDynamicBlockConfig(
          block.id,
          dynamicConfig as Record<string, unknown>
        )

      } catch (error: Error | unknown) {
        console.error(`DEBUG - Error saving dynamic config for block ${block.id}:`, error)
      }
    }
  },

  saveForm: async (): Promise<void> => {
    const { isSaving } = get()
    
    // Prevent multiple save operations from running simultaneously
    if (isSaving) {

      return
    }
    
    try {
      // Set saving state
      set({ isSaving: true })
      
      // Step 1: Save form and blocks first
      const state = get();
      const saveResult = await state.saveFormAndBlocks()
      
      // If form save failed or no result, exit early
      if (!saveResult || !saveResult.result?.form?.form_id) {
        console.error('Form save failed or returned no form ID')
        return
      }
      
      // Step 2: Save workflow edges separately
      const formId = saveResult.result.form.form_id
      const edgesSaveResult = await state.saveWorkflowEdges(formId)
      
      if (!edgesSaveResult) {
        console.warn('Workflow edges save failed but form was saved successfully')
      }
    } catch (error: Error | unknown) {
      console.error('Error in orchestrated form save:', error)
      throw error
    } finally {
      set({ isSaving: false })
    }
  },
  
  loadVersionedForm: async (formId: string) => {
    // Set loading state
    set({ isLoading: true, isVersioned: true })
    
    try {

      
      // Fetch versioned form with blocks from API
      const result = await getVersionedFormWithBlocksClient(formId)
      
      // Check if we got a result
      if (!result) {
        throw new Error(`Published version of form with ID ${formId} not found`)
      }
      
      // Since CompleteForm extends Form, the form data is the result itself
      const formData = result
      

      
      // Use our helper function to transform the form data with proper typing
      const { blocks, connections, nodePositions } = transformVersionedFormData(formData)
      

      
      // Create default linear connections if no connections exist
      if (connections.length === 0 && blocks.length > 1) {

        
        try {
          // Sort blocks by order to ensure proper sequence
          const sortedBlocks = [...blocks].sort((a, b) => a.order_index - b.order_index);
          
          // Create a linear workflow with properly typed connections
          for (let i = 0; i < sortedBlocks.length - 1; i++) {
            const block = sortedBlocks[i];
            const nextBlock = sortedBlocks[i + 1];
            
            connections.push({
              id: uuidv4(),
              sourceId: block.id,
              targetId: nextBlock.id,
              conditionType: 'always',
              conditions: [],
              order_index: i
            });
          }
          

        } catch (error) {
          console.error('Error creating default connections:', error);
        }
      }
      
      // Update the store with form and blocks
      set({
        formData: {
          form_id: formData.form_id,
          title: formData.title || 'Untitled Form',
          description: formData.description || '',
          workspace_id: formData.workspace_id,
          created_by: formData.created_by,
          status: formData.status || 'published',  // Versioned forms should be published
          // Always use defaultFormTheme as the base and merge with any available theme properties
          theme: formData.theme ? { 
            ...defaultFormTheme, 
            ...(typeof formData.theme === 'object' ? formData.theme : {}) 
          } : defaultFormTheme,
          settings: formData.settings ? {
            ...defaultFormData.settings,
            ...(typeof formData.settings === 'object' ? formData.settings : {})
          } : { ...defaultFormData.settings }
        },
        blocks: blocks,
        currentBlockId: blocks.length > 0 ? blocks[0].id : null,
        connections: connections,  // Use our properly typed connections
        nodePositions
      })
    } catch (error) {
      console.error('Error loading versioned form:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  
  loadForm: async (formId: string) => {
    // Set loading state
    set({ isLoading: true })
    
    try {

      
      // Fetch form with blocks from API
      // Get form with blocks from API - this returns a CompleteForm object
      const result = await getFormWithBlocksClient(formId)
      
      // Check if we got a result
      if (!result) {
        throw new Error(`Form with ID ${formId} not found`)
      }
      
      // Since CompleteForm extends Form, the form data is the result itself
      const formData = result
      // Blocks are in the blocks property
      const backendBlocks = result.blocks
      

      


      
      // Convert backend blocks to frontend format
      const blocks = backendBlocks.map((block, index) => {

        
        // Map database type/subtype back to frontend blockTypeId (e.g., 'short_text', 'multiple_choice')
        const blockTypeId = mapFromDbBlockType(block.type, block.subtype)

        
        // Most blocks are 'static' type, with dynamic blocks being 'dynamic' type
        // This matches our BlockType enum: 'static' | 'dynamic' | 'integration' | 'layout'
        const blockType = (block.type === 'dynamic' || blockTypeId === 'ai_conversation') 
          ? 'dynamic' 
          : (block.type as BlockType) || 'static';
        
        const frontendBlock = {
          id: block.id,
          blockTypeId,
          type: blockType,
          title: block.title,
          description: block.description || '',
          required: block.required,
          order_index: block.order_index, // Using the standardized property name
          settings: block.settings || {}
        }
        

        return frontendBlock
      })
      
      // Extract node positions from form settings
      let nodePositions: Record<string, {x: number, y: number}> = {}
      try {
        if (formData.settings?.workflow && typeof formData.settings.workflow === 'object') {
          const workflow = formData.settings.workflow as { nodePositions?: Record<string, {x: number, y: number}> }
          if (workflow.nodePositions && typeof workflow.nodePositions === 'object') {
            nodePositions = workflow.nodePositions
          }
        }
      } catch (error) {
        console.error('Error extracting node positions:', error)
        nodePositions = {}
      }
      
      // Load connections from workflow_edges table
      let workflowConnections: Array<{
        id: string;
        sourceId: string;
        targetId: string;
        order_index: number;
        conditionType: 'always' | 'conditional' | 'fallback';
        conditions: WorkflowCondition[];
      }> = []
      
      try {

        const supabase = createClient()
        const { data: edges, error } = await supabase
          .from('workflow_edges')
          .select('*')
          .eq('form_id', formId)
          .order('order_index', { ascending: true })
        
        if (error) {
          console.error(`❌ WORKFLOW LOAD ERROR: Failed to fetch workflow edges:`, error)
          throw error
        }
        

        
        if (edges && edges.length > 0) {

          
          // Convert from database format to app format
          workflowConnections = edges.map((edge: {
            id: string;
            source_block_id: string;
            target_block_id: string;
            order_index: number;
            condition_field?: string;
            condition_operator?: string;
            condition_value?: any; // JSONB type could be any valid JSON value
          }) => {
            // Initialize with default values
            let conditions: WorkflowCondition[] = [];
            let conditionType: 'always' | 'conditional' | 'fallback' = 'always';
            
            // If we have condition data, create a condition object
            if (edge.condition_field) {
              // Create a condition from the individual fields
              conditions = [{
                id: `condition-${edge.id}`, // Generate an ID for the condition
                field: edge.condition_field,
                operator: (edge.condition_operator as 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than') || 'equals',
                value: edge.condition_value ?? '' // Use nullish coalescing to handle null/undefined
              }];
              
              // If there's at least one condition, mark this as conditional
              conditionType = 'conditional';
            }
            
            const appConnection = {
              id: edge.id,
              sourceId: edge.source_block_id,
              targetId: edge.target_block_id,
              order_index: edge.order_index,
              conditionType,
              conditions
            };
            

            return appConnection;
          })
          

          
          // Check block IDs before filtering

          
          // Filter out connections referencing blocks that no longer exist
          workflowConnections = workflowConnections.filter(conn => {
            const sourceExists = blocks.some(block => block.id === conn.sourceId)
            const targetExists = blocks.some(block => block.id === conn.targetId)
            
            if (!sourceExists) {
              console.warn(`⚠️ WORKFLOW LOAD: Source block not found for connection: source=${conn.sourceId}, target=${conn.targetId}`)
              return false
            }
            
            if (!targetExists) {
              console.warn(`⚠️ WORKFLOW LOAD: Target block not found for connection: source=${conn.sourceId}, target=${conn.targetId}`)
              return false
            }
            

            return true
          })
          


        } else {

        }
      } catch (error) {
        console.error('Error loading workflow connections:', error)
        workflowConnections = []
      }
      
      // Create default linear connections if no connections exist
      // and immediately save them to the database
      // No longer automatically creating default linear connections
      // This responsibility is now moved to the workflow editor UI
      if (workflowConnections.length === 0 && blocks.length > 1) {

        // We'll leave the workflowConnections array empty
        // The user will need to create connections manually in the workflow editor
      }
      
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
          theme: formData.theme ? { 
            ...defaultFormTheme, 
            ...(typeof formData.theme === 'object' ? formData.theme : {}) 
          } : defaultFormTheme,
          settings: formData.settings ? {
            ...defaultFormData.settings,
            ...(typeof formData.settings === 'object' ? formData.settings : {})
          } : { ...defaultFormData.settings }
        },
        blocks: blocks,
        currentBlockId: blocks.length > 0 ? blocks[0].id : null,
        connections: workflowConnections,
        nodePositions
      })
    } catch (error) {
      console.error('Error loading form:', error)
    } finally {
      set({ isLoading: false })
    }
  }
})
