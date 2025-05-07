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
      console.log('Saving form and blocks to Supabase...')
      
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
      
      console.log('DEBUG - Preparing blocks for saveFormWithBlocks...')
      
      // IMPORTANT: saveFormWithBlocks does its own type mapping internally
      // Instead of manually setting type/subtype, we need to ensure blockTypeId is correct
      // since saveFormWithBlocks will call mapToDbBlockType again with these blockTypeId values
      const backendBlocks = blocks.map((block, index) => {
        // Ensure blockTypeId is properly set for different block types
        let fixedBlockTypeId = block.blockTypeId
        
        // For dynamic blocks, ensure blockTypeId is 'ai_conversation'
        if (block.type === 'dynamic' && block.blockTypeId !== 'ai_conversation') {
          console.log(`DEBUG - Fixing blockTypeId for dynamic block ${block.id} from '${block.blockTypeId}' to 'ai_conversation'`)
          fixedBlockTypeId = 'ai_conversation'
        }
        // For multiple choice blocks, ensure correct blockTypeId
        else if (block.blockTypeId === 'multiple_choice' || 
                 (block.settings?.options && Array.isArray(block.settings.options))) {
          console.log(`DEBUG - Ensuring multiple_choice block has correct blockTypeId`)
          fixedBlockTypeId = 'multiple_choice'
        }
        
        console.log(`DEBUG - Prepared block ${index} (${block.title}): blockTypeId=${fixedBlockTypeId}`)
        
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
      
      console.log(`Preparing to save ${backendBlocks.length} blocks to form ${isExistingForm ? 'update' : 'create'}`)
      
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
      
      console.log('DEBUG - About to call saveFormWithBlocks with formInput:', JSON.stringify(formInput, null, 2))
      console.log('DEBUG - backendBlocks to save:', JSON.stringify(backendBlocks, null, 2))
      
      // Save form with blocks
      const result = await saveFormWithBlocks(formInput, backendBlocks)
      console.log('DEBUG - Form saved successfully, result:', JSON.stringify(result, null, 2))
      
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
    
    console.log(`Saving ${connections.length} connections to workflow_edges table for form ${formId}`)
    
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
        console.log('No workflow connections to save')
        return true
      }
      
      console.log(`🔄 WORKFLOW DEBUG: Saving ${connections.length} connections to database`)
      console.log(`🔄 WORKFLOW DEBUG: Original connections:`, JSON.stringify(connections, null, 2))
      
      // Prepare connection data for database format
      const workflowEdges = connections.map((conn, index) => {
        const edge = {
          form_id: formId,
          source_block_id: conn.sourceId,
          target_block_id: conn.targetId,
          condition_type: conn.conditionType || 'always',
          condition_field: conn.conditions?.[0]?.field || null,
          condition_operator: conn.conditions?.[0]?.operator || null,
          condition_value: conn.conditions?.[0]?.value || null,
          condition_json: conn.conditions?.length > 0 ? JSON.stringify(conn.conditions) : null,
          order_index: index
        }
        
        console.log(`🔄 WORKFLOW DEBUG: Mapped edge ${index}:`, JSON.stringify(edge, null, 2))
        return edge
      })
      
      console.log(`🔄 WORKFLOW DEBUG: Attempting to save ${workflowEdges.length} edges to database`)
      
      // Insert all connections in batch
      const { data, error } = await supabase
        .from('workflow_edges')
        .insert(workflowEdges)
        .select()
      
      if (error) {
        console.error('❌ WORKFLOW ERROR: Failed to save workflow edges:', error)
        return false
      } 
      
      console.log(`✅ WORKFLOW SUCCESS: Saved ${connections.length} workflow edges to database`)
      console.log(`✅ WORKFLOW SUCCESS: Returned data:`, data)
      return true
    } catch (error) {
      console.error('Error managing workflow edges:', error)
      return false
    }
  },

  saveDynamicBlockConfigs: async (result: any): Promise<void> => {
    if (!result?.blocks || result.blocks.length === 0) {
      console.log('No blocks in result, skipping dynamic config save')
      return
    }
    
    console.log('DEBUG - Checking for dynamic blocks...')
    
    // Identify blocks that are specifically dynamic type
    // Cast the result blocks to our DbFormBlock type for proper typing
    const savedBlocks = (result.blocks || []) as DbFormBlock[]
    
    console.log('DEBUG - Checking saved blocks for dynamic types:')
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
                       
      console.log(`DEBUG - Saved block ${block.id} (${block.title}): type=${block.type}, subtype=${block.subtype}, isDynamic=${isDynamic}`)
      return isDynamic
    })
    
    if (dynamicBlocks.length === 0) {
      console.log('DEBUG - No dynamic blocks found, skipping dynamic config save.')
      return
    }
    
    console.log(`DEBUG - Found ${dynamicBlocks.length} dynamic blocks to save config for:`, dynamicBlocks.map((b) => b.id).join(', '))
    
    // For each dynamic block, save its configuration
    for (const block of dynamicBlocks) {
      console.log(`DEBUG - Processing dynamic block ${block.id}, settings:`, JSON.stringify(block.settings, null, 2))
      
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
      
      console.log(`DEBUG - Created dynamic config for block ${block.id}:`, JSON.stringify(dynamicConfig, null, 2))
      
      try {
        // Save using the properly formatted config for the database
        await saveDynamicBlockConfig(
          block.id,
          dynamicConfig as Record<string, unknown>
        )
        console.log(`DEBUG - Successfully saved dynamic config for block ${block.id}`)
      } catch (error: Error | unknown) {
        console.error(`DEBUG - Error saving dynamic config for block ${block.id}:`, error)
      }
    }
  },

  saveForm: async (): Promise<void> => {
    const { isSaving } = get()
    
    // Prevent multiple save operations from running simultaneously
    if (isSaving) {
      console.log('Save already in progress, skipping...')
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
      console.log(`Loading versioned form ${formId}...`)
      
      // Fetch versioned form with blocks from API
      const result = await getVersionedFormWithBlocksClient(formId)
      
      // Check if we got a result
      if (!result) {
        throw new Error(`Published version of form with ID ${formId} not found`)
      }
      
      // Since CompleteForm extends Form, the form data is the result itself
      const formData = result
      
      console.log(`Found versioned form: ${formData.title} with ${formData.blocks.length} blocks (version ${result.version_number || 'unknown'})`)
      
      // Use our helper function to transform the form data with proper typing
      const { blocks, connections, nodePositions } = transformVersionedFormData(formData)
      
      console.log(`Transformed ${blocks.length} blocks and ${connections.length} connections with proper typing`)
      
      // Create default linear connections if no connections exist
      if (connections.length === 0 && blocks.length > 1) {
        console.log('No existing connections found, creating default linear workflow');
        
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
          
          console.log(`Created ${connections.length} default linear connections`);
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
      console.log(`Loading form ${formId}...`)
      
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
      
      console.log(`Found form: ${formData.title} with ${backendBlocks.length} blocks`)
      
      console.log('DEBUG - Converting backend blocks to frontend format...')
      console.log('DEBUG - Backend blocks:', JSON.stringify(backendBlocks, null, 2))
      
      // Convert backend blocks to frontend format
      const blocks = backendBlocks.map((block, index) => {
        console.log(`DEBUG - Processing backend block ${index}:`, block.id, block.title, block.type, block.subtype)
        
        // Map database type/subtype back to frontend blockTypeId (e.g., 'short_text', 'multiple_choice')
        const blockTypeId = mapFromDbBlockType(block.type, block.subtype)
        console.log(`DEBUG - Mapped from DB: type=${block.type}, subtype=${block.subtype} => blockTypeId=${blockTypeId}`)
        
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
        
        console.log(`DEBUG - Created frontend block:`, JSON.stringify(frontendBlock, null, 2))
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
        console.log(`🔍 WORKFLOW LOAD: Loading workflow connections from database for form ${formId}...`)
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
        
        console.log(`🔍 WORKFLOW LOAD: Raw edges from database:`, JSON.stringify(edges, null, 2))
        
        if (edges && edges.length > 0) {
          console.log(`🔍 WORKFLOW LOAD: Found ${edges.length} edges in database`)
          
          // Convert from database format to app format
          workflowConnections = edges.map((edge: {
            id: string;
            source_block_id: string;
            target_block_id: string;
            order_index: number;
            condition_type?: string;
            condition_field?: string;
            condition_operator?: string;
            condition_value?: string | number | boolean | null;
            condition_json?: string;
          }) => {
            // Parse condition_json if available or fall back to the legacy single condition format
            let conditions: WorkflowCondition[] = [];
            let conditionType: 'always' | 'conditional' | 'fallback' = 'always';
            
            if (edge.condition_json) {
              try {
                conditions = JSON.parse(edge.condition_json);
                conditionType = 'conditional';
              } catch (e) {
                console.error('Failed to parse condition_json:', e);
                conditions = [];
              }
            } else if (edge.condition_field) {
              // Support for legacy format
              conditions = [{
                id: `legacy-${edge.id}`, // Add required id property
                field: edge.condition_field || '',
                operator: (edge.condition_operator as 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than') || 'equals',
                value: edge.condition_value || '' // Provide a default empty string if null/undefined
              }];
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
            
            console.log(`🔄 WORKFLOW LOAD: Converted edge ${edge.id}:`, JSON.stringify(appConnection, null, 2))
            return appConnection;
          })
          
          console.log(`🔍 WORKFLOW LOAD: Before filtering - ${workflowConnections.length} connections`)
          
          // Check block IDs before filtering
          console.log(`🧩 WORKFLOW LOAD: Block IDs in this form:`, blocks.map(b => b.id))
          
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
            
            console.log(`✅ WORKFLOW LOAD: Valid connection found: ${conn.sourceId} -> ${conn.targetId}`)
            return true
          })
          
          console.log(`📊 WORKFLOW LOAD: After filtering - ${workflowConnections.length} valid connections`)
          console.log(`📊 WORKFLOW LOAD: Final connections:`, JSON.stringify(workflowConnections, null, 2))
        } else {
          console.log(`⚠️ WORKFLOW LOAD: No workflow connections found for form ${formId}`)
        }
      } catch (error) {
        console.error('Error loading workflow connections:', error)
        workflowConnections = []
      }
      
      // Create default linear connections if no connections exist
      // and immediately save them to the database
      if (workflowConnections.length === 0 && blocks.length > 1) {
        console.log('No existing connections found, creating default linear workflow');
        
        try {
          // Sort blocks by order to ensure proper sequence
          const sortedBlocks = [...blocks].sort((a, b) => a.order_index - b.order_index);
          
          // Create connections from each block to the next one
          workflowConnections = sortedBlocks.slice(0, -1).map((block, index) => {
            const nextBlock = sortedBlocks[index + 1];
            return {
              id: uuidv4(),
              sourceId: block.id,
              targetId: nextBlock.id,
              order_index: index,
              conditionType: 'always', // Default connection type
              conditions: [] // Empty conditions array for default connections
            };
          });
          
          console.log(`Created ${workflowConnections.length} default linear connections`);
          
          // Save these default connections to the database
          if (formId && workflowConnections.length > 0) {
            const dbEdges = workflowConnections.map((conn, index) => ({
              form_id: formId,
              source_block_id: conn.sourceId,
              target_block_id: conn.targetId,
              order_index: index
            }));
            
            const supabase = createClient()
            await supabase
              .from('workflow_edges')
              .insert(dbEdges);
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
