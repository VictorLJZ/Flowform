import { 
  BlockType,
  StaticBlock,
  DynamicBlock,
  QuestionType,
  ValidationRule,
  BlockCondition
} from '@/types/form-types';
import { BaseService } from './base-service';

/**
 * Service for managing form blocks
 */
export class BlockService extends BaseService {
  /**
   * Create a base block record in the database
   * @param formId The form ID
   * @param type Block type (static or dynamic)
   * @param orderIndex Position in the form
   * @returns The ID of the created block
   * @private
   */
  private async createBaseBlock(
    formId: string,
    type: BlockType,
    orderIndex: number
  ): Promise<string> {
    await this.initClient();
    
    const { data, error } = await this.supabase
      .from('blocks')
      .insert({
        form_id: formId,
        type,
        order_index: orderIndex,
        version: 1
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating base block:', error);
      throw new Error(`Failed to create block: ${error.message}`);
    }

    return data.id;
  }

  /**
   * Create a static block
   * @param block Static block details
   * @returns The created block with ID
   */
  async createStaticBlock(block: Omit<StaticBlock, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<StaticBlock> {
    await this.initClient();
    
    const { formId, orderIndex, type, ...staticConfig } = block;

    // Create transaction
    const { data, error } = await this.supabase.rpc('create_static_block', {
      p_form_id: formId,
      p_order_index: orderIndex,
      p_question_type: staticConfig.questionType,
      p_question_text: staticConfig.questionText,
      p_description: staticConfig.description || null,
      p_required: staticConfig.required ?? true,
      p_placeholder: staticConfig.placeholder || null,
      p_options: staticConfig.options || [],
      p_validation_rules: staticConfig.validationRules || [],
      p_settings: staticConfig.settings || {}
    });

    if (error) {
      console.error('Error creating static block:', error);
      throw new Error(`Failed to create static block: ${error.message}`);
    }

    return this.getBlock(data.block_id) as Promise<StaticBlock>;
  }

  /**
   * Create a dynamic block
   * @param block Dynamic block details
   * @returns The created block with ID
   */
  async createDynamicBlock(block: Omit<DynamicBlock, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<DynamicBlock> {
    await this.initClient();
    
    const { formId, orderIndex, type, ...dynamicConfig } = block;

    // Create transaction
    const { data, error } = await this.supabase.rpc('create_dynamic_block', {
      p_form_id: formId,
      p_order_index: orderIndex,
      p_seed_question: dynamicConfig.seedQuestion,
      p_num_follow_up_questions: dynamicConfig.numFollowUpQuestions,
      p_custom_prompt: dynamicConfig.customPrompt || null,
      p_temperature: dynamicConfig.temperature || 0.7
    });

    if (error) {
      console.error('Error creating dynamic block:', error);
      throw new Error(`Failed to create dynamic block: ${error.message}`);
    }

    return this.getBlock(data.block_id) as Promise<DynamicBlock>;
  }

  /**
   * Get a block by ID
   * @param blockId Block ID
   * @returns Complete block data
   */
  async getBlock(blockId: string): Promise<StaticBlock | DynamicBlock> {
    await this.initClient();
    
    // Get base block data
    const { data: blockData, error: blockError } = await this.supabase
      .from('blocks')
      .select('*')
      .eq('id', blockId)
      .is('deleted_at', null)
      .single();

    if (blockError) {
      console.error('Error fetching block:', blockError);
      throw new Error(`Block not found: ${blockError.message}`);
    }

    // Get specific block data based on type
    if (blockData.type === BlockType.STATIC) {
      const { data: staticData, error: staticError } = await this.supabase
        .from('static_blocks')
        .select('*')
        .eq('id', blockId)
        .single();

      if (staticError) {
        console.error('Error fetching static block:', staticError);
        throw new Error(`Static block data not found: ${staticError.message}`);
      }

      return {
        id: blockData.id,
        formId: blockData.form_id,
        type: BlockType.STATIC,
        orderIndex: blockData.order_index,
        version: blockData.version,
        createdAt: new Date(blockData.created_at),
        updatedAt: new Date(blockData.updated_at),
        questionType: staticData.question_type,
        questionText: staticData.question_text,
        description: staticData.description,
        required: staticData.required,
        placeholder: staticData.placeholder,
        options: staticData.options,
        validationRules: staticData.validation_rules,
        settings: staticData.settings
      };
    } else {
      const { data: dynamicData, error: dynamicError } = await this.supabase
        .from('dynamic_blocks')
        .select('*')
        .eq('id', blockId)
        .single();

      if (dynamicError) {
        console.error('Error fetching dynamic block:', dynamicError);
        throw new Error(`Dynamic block data not found: ${dynamicError.message}`);
      }

      return {
        id: blockData.id,
        formId: blockData.form_id,
        type: BlockType.DYNAMIC,
        orderIndex: blockData.order_index,
        version: blockData.version,
        createdAt: new Date(blockData.created_at),
        updatedAt: new Date(blockData.updated_at),
        seedQuestion: dynamicData.seed_question,
        numFollowUpQuestions: dynamicData.num_follow_up_questions,
        customPrompt: dynamicData.custom_prompt,
        temperature: dynamicData.temperature
      };
    }
  }

  /**
   * Update a static block
   * @param blockId Block ID
   * @param updates Fields to update
   */
  async updateStaticBlock(blockId: string, updates: Partial<Omit<StaticBlock, 'id' | 'formId' | 'type' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    await this.initClient();
    
    // Start a transaction to update both blocks and static_blocks tables
    const { error: updateError } = await this.supabase.rpc('update_static_block', {
      p_block_id: blockId,
      p_order_index: updates.orderIndex,
      p_question_type: updates.questionType,
      p_question_text: updates.questionText,
      p_description: updates.description,
      p_required: updates.required,
      p_placeholder: updates.placeholder,
      p_options: updates.options,
      p_validation_rules: updates.validationRules,
      p_settings: updates.settings
    });

    if (updateError) {
      console.error('Error updating static block:', updateError);
      throw new Error(`Failed to update static block: ${updateError.message}`);
    }
  }

  /**
   * Update a dynamic block
   * @param blockId Block ID
   * @param updates Fields to update
   */
  async updateDynamicBlock(blockId: string, updates: Partial<Omit<DynamicBlock, 'id' | 'formId' | 'type' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    await this.initClient();
    
    // Start a transaction to update both blocks and dynamic_blocks tables
    const { error: updateError } = await this.supabase.rpc('update_dynamic_block', {
      p_block_id: blockId,
      p_order_index: updates.orderIndex,
      p_seed_question: updates.seedQuestion,
      p_num_follow_up_questions: updates.numFollowUpQuestions,
      p_custom_prompt: updates.customPrompt,
      p_temperature: updates.temperature
    });

    if (updateError) {
      console.error('Error updating dynamic block:', updateError);
      throw new Error(`Failed to update dynamic block: ${updateError.message}`);
    }
  }

  /**
   * Update the order of blocks in a form
   * @param formId Form ID
   * @param blockIds Ordered array of block IDs
   */
  async updateBlockOrder(formId: string, blockIds: string[]): Promise<void> {
    await this.initClient();
    
    // Create batch update
    const updates = blockIds.map((id, index) => ({
      id,
      order_index: index
    }));

    const { error } = await this.supabase
      .from('blocks')
      .upsert(updates, { onConflict: 'id' });

    if (error) {
      console.error('Error updating block order:', error);
      throw new Error(`Failed to update block order: ${error.message}`);
    }
  }

  /**
   * Delete a block (soft delete)
   * @param blockId Block ID
   */
  async deleteBlock(blockId: string): Promise<void> {
    await this.initClient();
    
    const { error } = await this.supabase
      .from('blocks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', blockId);

    if (error) {
      console.error('Error deleting block:', error);
      throw new Error(`Failed to delete block: ${error.message}`);
    }
  }

  /**
   * Add a condition to a block
   * @param condition Condition details
   * @returns The ID of the created condition
   */
  async addBlockCondition(condition: Omit<BlockCondition, 'id'>): Promise<string> {
    await this.initClient();
    
    const { data, error } = await this.supabase
      .from('block_conditions')
      .insert({
        block_id: condition.blockId,
        dependent_block_id: condition.dependentBlockId,
        condition_type: condition.conditionType,
        condition_value: condition.conditionValue,
        operator: condition.operator || 'AND',
        condition_group: condition.conditionGroup || 1
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error adding block condition:', error);
      throw new Error(`Failed to add block condition: ${error.message}`);
    }

    return data.id;
  }

  /**
   * Get all conditions for a block
   * @param blockId Block ID
   * @returns Array of conditions
   */
  async getBlockConditions(blockId: string): Promise<BlockCondition[]> {
    await this.initClient();
    
    const { data, error } = await this.supabase
      .from('block_conditions')
      .select('*')
      .eq('block_id', blockId);

    if (error) {
      console.error('Error fetching block conditions:', error);
      throw new Error(`Failed to fetch block conditions: ${error.message}`);
    }

    return data.map((condition: any) => ({
      id: condition.id,
      blockId: condition.block_id,
      dependentBlockId: condition.dependent_block_id,
      conditionType: condition.condition_type,
      conditionValue: condition.condition_value,
      operator: condition.operator,
      conditionGroup: condition.condition_group
    }));
  }

  /**
   * Delete a block condition
   * @param conditionId Condition ID
   */
  async deleteBlockCondition(conditionId: string): Promise<void> {
    await this.initClient();
    
    const { error } = await this.supabase
      .from('block_conditions')
      .delete()
      .eq('id', conditionId);

    if (error) {
      console.error('Error deleting block condition:', error);
      throw new Error(`Failed to delete block condition: ${error.message}`);
    }
  }

  /**
   * Get all form questions for context
   * This is used for generating dynamic questions to ensure no duplicates
   * @param formId Form ID
   * @returns Object containing static questions and dynamic seed questions
   */
  async getFormQuestions(formId: string): Promise<{
    staticQuestions: string[];
    dynamicBlockSeeds: string[];
  }> {
    await this.initClient();
    
    // Get all blocks from the form
    const { data: blocks, error: blocksError } = await this.supabase
      .from('blocks')
      .select('id, type')
      .eq('form_id', formId)
      .is('deleted_at', null);

    if (blocksError) {
      console.error('Error fetching blocks for questions:', blocksError);
      throw new Error(`Failed to fetch blocks for questions: ${blocksError.message}`);
    }

    // Get static questions
    const staticBlockIds = blocks
      .filter((block: any) => block.type === BlockType.STATIC)
      .map((block: any) => block.id);

    const { data: staticBlocks, error: staticError } = staticBlockIds.length > 0
      ? await this.supabase
          .from('static_blocks')
          .select('question_text')
          .in('id', staticBlockIds)
      : { data: [], error: null };

    if (staticError) {
      console.error('Error fetching static questions:', staticError);
      throw new Error(`Failed to fetch static questions: ${staticError.message}`);
    }

    // Get dynamic seed questions
    const dynamicBlockIds = blocks
      .filter((block: any) => block.type === BlockType.DYNAMIC)
      .map((block: any) => block.id);

    const { data: dynamicBlocks, error: dynamicError } = dynamicBlockIds.length > 0
      ? await this.supabase
          .from('dynamic_blocks')
          .select('seed_question')
          .in('id', dynamicBlockIds)
      : { data: [], error: null };

    if (dynamicError) {
      console.error('Error fetching dynamic seed questions:', dynamicError);
      throw new Error(`Failed to fetch dynamic seed questions: ${dynamicError.message}`);
    }

    return {
      staticQuestions: staticBlocks.map((block: any) => block.question_text),
      dynamicBlockSeeds: dynamicBlocks.map((block: any) => block.seed_question)
    };
  }
}
