import { Edge } from 'reactflow';
import { WorkflowEdgeData, Rule } from '@/types/workflow-types';
import { FormBlock } from '@/types/block-types';
import { ConditionRule } from '@/types/workflow-types';

// Field option type
export interface FieldOption {
  id: string;
  label: string;
  valueType: 'string' | 'number' | 'boolean' | 'date';
  blockTypes: string[];
  operators: ConditionOperator[];
  valueOptions?: BlockChoiceOption[];
  disabled?: boolean; // For header/separator options
}

// Operator option type
export interface OperatorOption {
  value: string;
  label: string;
}

// Value suggestion type
export interface ValueSuggestion {
  value: string;
  label: string;
}

// Block choice option type (for multiple choice, checkboxes, etc.)
export interface BlockChoiceOption {
  label: string;
  value: string;
}

export type ConditionOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'contains' 
  | 'greater_than' 
  | 'less_than';

export type LogicalOperator = 'AND' | 'OR';

// Display labels for logical operators
export const logicalOperatorLabels: Record<LogicalOperator, string> = {
  'AND': 'AND (all conditions must match)',
  'OR': 'OR (any condition can match)'
};

// Define condition display labels for better readability
export const operatorLabels: Record<ConditionOperator, string> = {
  'equals': 'equals',
  'not_equals': 'does not equal',
  'contains': 'contains',
  'greater_than': 'is greater than',
  'less_than': 'is less than'
};

// Shared props for condition components
export interface ConditionComponentProps {
  element: Edge<WorkflowEdgeData>;
  sourceBlockType: string;
  onConditionChange: (key: string, value: string | number | boolean) => void;
}

// Props for rule components
export interface RuleComponentProps {
  rule: Rule;
  element: Edge<WorkflowEdgeData>;
  sourceBlockType: string;
  onRuleChange: (ruleId: string, updates: Partial<Rule>) => void;
  onRuleDelete: (ruleId: string) => void;
}

// Dropdown option type for selecting target blocks
export interface TargetBlockOption {
  value: string; // Block ID
  label: string; // Block title or description
}

// Standard field types available for all blocks
export const standardFields: FieldOption[] = [
  {
    id: 'answer',
    label: 'Answer',
    valueType: 'string',
    blockTypes: ['short_text', 'long_text', 'email', 'number', 'date', 'multiple_choice', 'dropdown'],
    operators: ['equals', 'not_equals', 'contains']
  },
  {
    id: 'selected',
    label: 'Selected',
    valueType: 'boolean',
    blockTypes: ['checkbox_group', 'dropdown'],
    operators: ['equals', 'not_equals']
  },
  {
    id: 'rating',
    label: 'Rating',
    valueType: 'number',
    blockTypes: ['rating'],
    operators: ['equals', 'not_equals', 'greater_than', 'less_than']
  },
  {
    id: 'length',
    label: 'Length',
    valueType: 'number',
    blockTypes: ['short_text', 'long_text'],
    operators: ['equals', 'greater_than', 'less_than']
  },
  {
    id: 'domain',
    label: 'Domain',
    valueType: 'string',
    blockTypes: ['email'],
    operators: ['equals', 'not_equals', 'contains']
  }
];

/**
 * Get available fields for a specific source block
 * This standardizes condition fields for different block types
 */
export function getAvailableFieldsForBlock(sourceBlock: FormBlock | null | undefined): FieldOption[] {
  if (!sourceBlock) return [];
  
  const blockTypeId = sourceBlock.blockTypeId;
  
  // Get standard fields applicable to this block type
  const fields = standardFields.filter(field => 
    field.blockTypes.includes(blockTypeId)
  );
  
  // For choice blocks, also add each choice as a field option
  // But for multiple_choice, we only want the "answer" field
  if (['checkbox_group', 'dropdown'].includes(blockTypeId)) {
    const choices = (sourceBlock.settings?.choices || sourceBlock.settings?.options || []) as BlockChoiceOption[];
    
    // Add null check and verify choices is a proper array with elements
    if (Array.isArray(choices) && choices.length > 0) {
      // Add unique index to ensure no duplicate keys
      choices.forEach((choice, index) => {
        // Use value if available, fallback to label, then add index for guaranteed uniqueness
        const choiceValue = choice.value || choice.label || `option_${index}`;
        
        fields.push({
          id: `choice:${choiceValue}_${index}`, // Add index to ensure uniqueness
          label: `Option "${choice.label || choiceValue}"`,
          valueType: 'boolean',
          blockTypes: [blockTypeId],
          operators: ['equals', 'not_equals']
        });
      });
    }
  }
  
  return fields;
}

/**
 * Get available operators for a specific field
 */
export function getOperatorsForField(fieldId: string, sourceBlock: FormBlock | null | undefined): ConditionOperator[] {
  if (!fieldId || !sourceBlock) return ['equals'];
  
  // First, try to find the field in standard fields
  const field = standardFields.find(f => f.id === fieldId && f.blockTypes.includes(sourceBlock.blockTypeId));
  
  if (field) {
    return field.operators;
  }
  
  // For choice fields - now the ID includes an index suffix, just check for the prefix
  if (fieldId.startsWith('choice:')) {
    return ['equals', 'not_equals'];
  }
  
  // Default
  return ['equals'];
}

/**
 * Validate a condition rule
 */
export function validateCondition(condition: ConditionRule | undefined, sourceBlock: FormBlock | null | undefined): boolean {
  if (!condition || !condition.field || !condition.operator) return false;
  
  const { field, operator, value } = condition;
  
  // Get available fields and operators
  const availableFields = getAvailableFieldsForBlock(sourceBlock);
  
  // For choice fields, we need to handle the new format with index suffix
  let fieldOption;
  if (field.startsWith('choice:')) {
    // Match by prefix pattern since we added index suffixes
    fieldOption = availableFields.find(f => 
      f.id.startsWith('choice:') && 
      f.id.split(':')[1].split('_')[0] === field.split(':')[1].split('_')[0]
    );
  } else {
    // Standard field lookup for non-choice fields
    fieldOption = availableFields.find(f => f.id === field);
  }
  
  if (!fieldOption) return false;
  
  // Check if operator is valid for this field
  if (!fieldOption.operators.includes(operator)) return false;
  
  // Check if value is of the correct type
  if (value === undefined || value === null) return false;
  
  // Type-specific validation
  switch (fieldOption.valueType) {
    case 'boolean':
      return typeof value === 'boolean';
    case 'number':
      return typeof value === 'number' || !isNaN(Number(value));
    case 'date':
      return typeof value === 'string' && !isNaN(Date.parse(value));
    case 'string':
      return typeof value === 'string';
    default:
      return true;
  }
}

/**
 * Format condition value for display
 */
export function formatConditionValue(value: string | number | boolean | undefined, valueType: string): string {
  if (value === undefined || value === null) return '(empty)';
  
  switch (valueType) {
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'date':
      try {
        return new Date(value.toString()).toLocaleDateString();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (__error) {
        return String(value);
      }
    default:
      return String(value);
  }
} 