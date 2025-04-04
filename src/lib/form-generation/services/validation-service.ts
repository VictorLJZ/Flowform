import { 
  ValidationRule, 
  ValidationRuleType,
  QuestionType
} from '@/types/form-types';
import { BaseService } from './base-service';

/**
 * Service for managing and applying validation rules
 */
export class ValidationService extends BaseService {
  constructor() {
    super();
  }

  /**
   * Get all validation rules for a block
   * @param blockId Block ID
   * @returns Array of validation rules
   */
  async getBlockValidationRules(blockId: string): Promise<ValidationRule[]> {
    await this.initClient();
    
    const { data, error } = await this.supabase
      .from('static_blocks')
      .select('validation_rules')
      .eq('id', blockId)
      .single();

    if (error) {
      console.error('Error fetching validation rules:', error);
      throw new Error(`Failed to fetch validation rules: ${error.message}`);
    }

    return data.validation_rules || [];
  }

  /**
   * Add a validation rule to a block
   * @param blockId Block ID
   * @param rule Validation rule to add
   */
  async addValidationRule(blockId: string, rule: Omit<ValidationRule, 'id'>): Promise<void> {
    await this.initClient();
    
    // Get current rules
    const currentRules = await this.getBlockValidationRules(blockId);
    
    // Add new rule with ID
    const newRule: ValidationRule = {
      ...rule,
      id: crypto.randomUUID()
    };
    
    const updatedRules = [...currentRules, newRule];
    
    // Update the block
    const { error } = await this.supabase
      .from('static_blocks')
      .update({
        validation_rules: updatedRules
      })
      .eq('id', blockId);
      
    if (error) {
      console.error('Error adding validation rule:', error);
      throw new Error(`Failed to add validation rule: ${error.message}`);
    }
  }

  /**
   * Update a validation rule
   * @param blockId Block ID
   * @param ruleId Rule ID
   * @param updates Fields to update
   */
  async updateValidationRule(blockId: string, ruleId: string, updates: Partial<Omit<ValidationRule, 'id'>>): Promise<void> {
    await this.initClient();
    
    // Get current rules
    const currentRules = await this.getBlockValidationRules(blockId);
    
    // Find and update the rule
    const updatedRules = currentRules.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    );
    
    // Update the block
    const { error } = await this.supabase
      .from('static_blocks')
      .update({
        validation_rules: updatedRules
      })
      .eq('id', blockId);
      
    if (error) {
      console.error('Error updating validation rule:', error);
      throw new Error(`Failed to update validation rule: ${error.message}`);
    }
  }

  /**
   * Remove a validation rule
   * @param blockId Block ID
   * @param ruleId Rule ID
   */
  async removeValidationRule(blockId: string, ruleId: string): Promise<void> {
    await this.initClient();
    
    // Get current rules
    const currentRules = await this.getBlockValidationRules(blockId);
    
    // Filter out the rule to remove
    const updatedRules = currentRules.filter(rule => rule.id !== ruleId);
    
    // Update the block
    const { error } = await this.supabase
      .from('static_blocks')
      .update({
        validation_rules: updatedRules
      })
      .eq('id', blockId);
      
    if (error) {
      console.error('Error removing validation rule:', error);
      throw new Error(`Failed to remove validation rule: ${error.message}`);
    }
  }

  /**
   * Validate a value against a set of validation rules
   * @param value The value to validate
   * @param rules Validation rules to apply
   * @param questionType Type of question (affects validation)
   * @returns Object with validation result and error message if any
   */
  validateValue(value: any, rules: ValidationRule[], questionType: QuestionType): { 
    valid: boolean;
    error?: string;
  } {
    // If no rules or no value, consider valid
    if (!rules || rules.length === 0) {
      return { valid: true };
    }
    
    // Handle required validation first
    const requiredRule = rules.find(r => r.type === ValidationRuleType.REQUIRED);
    if (requiredRule && (value === undefined || value === null || value === '')) {
      return { 
        valid: false, 
        error: requiredRule.message || 'This field is required' 
      };
    }
    
    // Skip further validation if value is empty and not required
    if (value === undefined || value === null || value === '') {
      return { valid: true };
    }
    
    // Apply each validation rule
    for (const rule of rules) {
      const result = this.applySingleRule(value, rule, questionType);
      if (!result.valid) {
        return result;
      }
    }
    
    return { valid: true };
  }

  /**
   * Apply a single validation rule to a value
   * @private
   */
  private applySingleRule(value: any, rule: ValidationRule, questionType: QuestionType): {
    valid: boolean;
    error?: string;
  } {
    switch (rule.type) {
      case ValidationRuleType.REQUIRED:
        // Already handled
        return { valid: true };
        
      case ValidationRuleType.MIN_LENGTH:
        if (typeof value === 'string' && value.length < rule.value) {
          return { 
            valid: false, 
            error: rule.message || `Must be at least ${rule.value} characters` 
          };
        }
        break;
        
      case ValidationRuleType.MAX_LENGTH:
        if (typeof value === 'string' && value.length > rule.value) {
          return { 
            valid: false, 
            error: rule.message || `Must be no more than ${rule.value} characters` 
          };
        }
        break;
        
      case ValidationRuleType.PATTERN:
        if (typeof value === 'string') {
          const regex = new RegExp(rule.value);
          if (!regex.test(value)) {
            return { 
              valid: false, 
              error: rule.message || 'Invalid format' 
            };
          }
        }
        break;
        
      // Add more validation types as needed
    }
    
    return { valid: true };
  }
}
