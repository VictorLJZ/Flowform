import { 
  BlockCondition, 
  ConditionOperator,
  ConditionType
} from '@/types/form-types';
import { BaseService } from './base-service';

/**
 * Service for managing block conditions
 */
export class ConditionService extends BaseService {
  constructor() {
    super();
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
      type: condition.type,
      targetBlockId: condition.target_block_id,
      operator: condition.operator,
      value: condition.value,
      createdAt: new Date(condition.created_at)
    }));
  }

  /**
   * Add a condition to a block
   * @param condition Condition details
   * @returns The ID of the created condition
   */
  async addBlockCondition(condition: Omit<BlockCondition, 'id' | 'createdAt'>): Promise<string> {
    await this.initClient();
    
    const { data, error } = await this.supabase
      .from('block_conditions')
      .insert({
        block_id: condition.blockId,
        type: condition.type,
        target_block_id: condition.targetBlockId,
        operator: condition.operator,
        value: condition.value
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating block condition:', error);
      throw new Error(`Failed to create block condition: ${error.message}`);
    }

    return data.id;
  }

  /**
   * Update a block condition
   * @param conditionId Condition ID
   * @param updates Fields to update
   */
  async updateBlockCondition(conditionId: string, updates: Partial<Omit<BlockCondition, 'id' | 'blockId' | 'createdAt'>>): Promise<void> {
    await this.initClient();
    
    const updateData: any = {};
    
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.targetBlockId !== undefined) updateData.target_block_id = updates.targetBlockId;
    if (updates.operator !== undefined) updateData.operator = updates.operator;
    if (updates.value !== undefined) updateData.value = updates.value;
    
    const { error } = await this.supabase
      .from('block_conditions')
      .update(updateData)
      .eq('id', conditionId);

    if (error) {
      console.error('Error updating block condition:', error);
      throw new Error(`Failed to update block condition: ${error.message}`);
    }
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
   * Evaluate if a block should be shown based on its conditions
   * @param blockId Block ID
   * @param answers Map of block IDs to their answers
   * @returns Whether the block should be shown
   */
  async evaluateBlockConditions(blockId: string, answers: Record<string, any>): Promise<boolean> {
    await this.initClient();
    
    const conditions = await this.getBlockConditions(blockId);
    
    // If no conditions, block is always shown
    if (conditions.length === 0) {
      return true;
    }
    
    // Evaluate each condition
    const results = conditions.map(condition => 
      this.evaluateSingleCondition(condition, answers)
    );
    
    // Default behavior: ALL conditions must be true (AND logic)
    return results.every(result => result);
  }

  /**
   * Evaluate a single condition
   * @param condition The condition to evaluate
   * @param answers Map of block IDs to their answers
   * @returns Whether the condition is met
   * @private
   */
  private evaluateSingleCondition(condition: BlockCondition, answers: Record<string, any>): boolean {
    const targetAnswer = answers[condition.targetBlockId];
    
    // If we don't have an answer for the target block, condition fails
    if (targetAnswer === undefined) {
      return false;
    }
    
    switch (condition.operator) {
      case ConditionOperator.EQUALS:
        return targetAnswer === condition.value;
        
      case ConditionOperator.NOT_EQUALS:
        return targetAnswer !== condition.value;
        
      case ConditionOperator.CONTAINS:
        if (Array.isArray(targetAnswer)) {
          return targetAnswer.includes(condition.value);
        }
        if (typeof targetAnswer === 'string') {
          return targetAnswer.includes(String(condition.value));
        }
        return false;
        
      case ConditionOperator.NOT_CONTAINS:
        if (Array.isArray(targetAnswer)) {
          return !targetAnswer.includes(condition.value);
        }
        if (typeof targetAnswer === 'string') {
          return !targetAnswer.includes(String(condition.value));
        }
        return true;
        
      case ConditionOperator.GREATER_THAN:
        return typeof targetAnswer === 'number' && targetAnswer > Number(condition.value);
        
      case ConditionOperator.LESS_THAN:
        return typeof targetAnswer === 'number' && targetAnswer < Number(condition.value);
        
      default:
        return false;
    }
  }
}
