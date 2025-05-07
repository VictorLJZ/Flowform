"use client"

import { StateCreator } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { FormPersistenceSlice } from '@/types/form-store-slices-types'
import type { FormBuilderState } from '@/types/store-types'
import { saveFormWithBlocks } from '@/services/form/saveFormWithBlocks'
import { saveDynamicBlockConfig } from '@/services/form/saveDynamicBlockConfig'
import { getFormWithBlocksClient } from '@/services/form/getFormWithBlocksClient'
import { createClient } from '@/lib/supabase/client'
import { mapFromDbBlockType, mapToDbBlockType } from '@/utils/blockTypeMapping'
import { defaultFormTheme } from '@/types/theme-types'
import { defaultFormData } from './formCore'
import type { SaveFormInput } from '@/types/form-service-types'
import type { FormBlock, BlockType } from '@/types/block-types'

export const createFormPersistenceSlice: StateCreator<
  FormBuilderState,
  [],
  [],
  FormPersistenceSlice
> = (set, get) => ({
  // Initial state
  isSaving: false,
  isLoading: false,
  
  // Actions
  saveForm: async (): Promise<void> => {
    const { formData, blocks, connections, isSaving } = get()
    
    // Prevent multiple save operations from running simultaneously
    if (isSaving) {
      console.log('Save already in progress, skipping...')
      return
    }
    
    try {
      // Set saving state
      set({ isSaving: true })
      
      // We will submit to Supabase
      console.log('Saving form to Supabase...')
      
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
          order: block.order,
          settings: block.settings || {}
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
      let result
      try {
        result = await saveFormWithBlocks(formInput, backendBlocks as any)
        console.log('DEBUG - Form saved successfully, result:', JSON.stringify(result, null, 2))
        
        // Now save connections to the workflow_edges table
        if (result?.form?.form_id) {
          const formId = result.form.form_id;
          console.log(`Saving ${connections.length} connections to workflow_edges table for form ${formId}`)
          
          try {
            // First delete any existing connections
            await supabase
              .from('workflow_edges')
              .delete()
              .eq('form_id', formId);
            
            // If there are connections to save, insert them
            if (connections.length > 0) {
              console.log(`🔄 WORKFLOW DEBUG: Saving ${connections.length} connections to database`);
              console.log(`🔄 WORKFLOW DEBUG: Original connections:`, JSON.stringify(connections, null, 2));
              
              // Prepare connection data for database format
              const workflowEdges = connections.map((conn, index) => {
                const edge = {
                  form_id: formId,
                  source_block_id: conn.sourceId,
                  target_block_id: conn.targetId,
                  condition_field: conn.condition?.field || null,
                  condition_operator: conn.condition?.operator || null,
                  condition_value: conn.condition?.value || null,
                  order_index: index
                };
                
                console.log(`🔄 WORKFLOW DEBUG: Mapped edge ${index}:`, JSON.stringify(edge, null, 2));
                return edge;
              });
              
              console.log(`🔄 WORKFLOW DEBUG: Attempting to save ${workflowEdges.length} edges to database`);
              
              // Insert all connections in batch
              const { data, error } = await supabase
                .from('workflow_edges')
                .insert(workflowEdges)
                .select();
              
              if (error) {
                console.error('❌ WORKFLOW ERROR: Failed to save workflow edges:', error);
                // Don't throw here to avoid failing the entire save operation
              } else {
                console.log(`✅ WORKFLOW SUCCESS: Saved ${connections.length} workflow edges to database`);
                console.log(`✅ WORKFLOW SUCCESS: Returned data:`, data);
              }
            }
          } catch (edgesError) {
            console.error('Error managing workflow edges:', edgesError);
            // Don't throw here to avoid failing the entire save operation
          }
        }
      } catch (saveError: any) {
        console.error('DEBUG - Error details in saveFormWithBlocks:', saveError)
        throw saveError
      }
      
      // Update the form ID in state if it's a new form
      if (!isExistingForm && result?.form?.form_id) {
        set((state) => ({
          formData: {
            ...state.formData,
            form_id: result.form.form_id
          }
        }))
      }
      
      // If we have any dynamic blocks, we need to save their config separately
      console.log('DEBUG - Checking for dynamic blocks...')
      
      // Identify blocks that are specifically dynamic type
      // After the form save, we need to check the returned blocks from the response
      // since those are what was actually stored in the database
      const savedBlocks = result?.blocks || []
      
      console.log('DEBUG - Checking saved blocks for dynamic types:')
      const dynamicBlocks = savedBlocks.filter((block: any) => {
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
      
      if (dynamicBlocks.length > 0) {
        console.log(`DEBUG - Found ${dynamicBlocks.length} dynamic blocks to save config for:`, dynamicBlocks.map((b: any) => b.id).join(', '))
        
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
          } catch (error: any) {
            console.error(`DEBUG - Error saving dynamic config for block ${block.id}:`, error)
          }
        }
      } else {
        console.log('DEBUG - No dynamic blocks found, skipping dynamic config save.')
      }
      
      // Don't return the result to maintain Promise<void> return type
    } catch (error: any) {
      console.error('Error saving form:', error)
      throw error
    } finally {
      set({ isSaving: false })
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
          order: block.order_index, // Correct property name is order_index
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
      let workflowConnections: Array<{id: string; sourceId: string; targetId: string; order: number; condition?: any}> = []
      
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
            condition_field?: string;
            condition_operator?: string;
            condition_value?: any;
          }) => {
            const appConnection = {
              id: edge.id,
              sourceId: edge.source_block_id,
              targetId: edge.target_block_id,
              order: edge.order_index,
              // Add condition if present
              ...((edge.condition_field) ? {
                condition: {
                  field: edge.condition_field,
                  operator: edge.condition_operator as any,
                  value: edge.condition_value
                }
              } : {})
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
          const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);
          
          // Create connections from each block to the next one
          workflowConnections = sortedBlocks.slice(0, -1).map((block, index) => {
            const nextBlock = sortedBlocks[index + 1];
            return {
              id: uuidv4(),
              sourceId: block.id,
              targetId: nextBlock.id,
              order: index,
              // No condition means this is an "always" connection
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
