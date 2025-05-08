"use client"

import { 
  ConditionComponentProps, 
  ConditionOperator, 
  getOperatorsForField, 
  operatorLabels 
} from '@/types/workflow-condition-types';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Connection } from '@/types/workflow-types';
import { FormBlock } from '@/types/block-types';

interface ConditionOperatorsProps extends ConditionComponentProps {
  currentConnection: Connection | null;
  sourceBlock: FormBlock | null | undefined;
  conditionId?: string; // Optional ID to support multiple conditions
}

// Helper function to get user-friendly label based on field and operator
function getUserFriendlyOperatorLabel(
  field: string, 
  operator: ConditionOperator, 
  sourceBlockType: string
): string {
  // Special case for choice fields
  if (field.startsWith('choice:')) {
    return operator === 'equals' ? 'Is Selected' : 'Is Not Selected';
  } 
  // For checkbox group 'selected' field
  else if (field === 'selected') {
    return operator === 'equals' ? 'Is Checked' : 'Is Not Checked';
  }
  // For length field
  else if (field === 'length') {
    switch (operator) {
      case 'equals': return 'Is Exactly';
      case 'not_equals': return 'Is Not Exactly';
      case 'greater_than': return 'Is More Than';
      case 'less_than': return 'Is Less Than';
      default: return operatorLabels[operator];
    }
  }
  // For numbers and ratings
  else if ((field === 'rating' || field === 'answer') && 
           (sourceBlockType === 'number' || sourceBlockType === 'rating')) {
    switch (operator) {
      case 'equals': return 'Equals (=)';
      case 'not_equals': return 'Does Not Equal (≠)';
      case 'greater_than': return 'Greater Than (>)';
      case 'less_than': return 'Less Than (<)';
      default: return operatorLabels[operator];
    }
  }
  // For dates
  else if (field === 'answer' && sourceBlockType === 'date') {
    switch (operator) {
      case 'equals': return 'Is On';
      case 'not_equals': return 'Is Not On';
      case 'greater_than': return 'Is After';
      case 'less_than': return 'Is Before';
      default: return operatorLabels[operator];
    }
  }
  
  // Default to standard labels
  return operatorLabels[operator];
}

export function ConditionOperators({ 
  element, 
  sourceBlock, 
  sourceBlockType, 
  onConditionChange,
  currentConnection,
  conditionId
}: ConditionOperatorsProps) {
  // Use currentConnection if available for more accurate UI state
  const connection = currentConnection || element?.data?.connection;
  
  // Get the specific condition we're editing based on conditionId
  const currentCondition = conditionId && connection?.conditions
    ? connection.conditions.find(cond => cond.id === conditionId)
    : connection?.conditions?.[0] || undefined;
    
  // Get current field and operator from the condition
  const currentField = currentCondition?.field || '';
  const currentOperator = currentCondition?.operator || 'equals';

  // Get operator options based on field and source block
  const availableOperators = getOperatorsForField(currentField, sourceBlock);
  
  // Create operator options with friendly labels
  const operatorOptions = availableOperators.map(operator => ({
    value: operator,
    label: getUserFriendlyOperatorLabel(currentField, operator, sourceBlockType)
  }));

  // If this is a choice field and there's only one operator option, hide the selector
  if (currentField.startsWith('choice:') && operatorOptions.length <= 1) {
    return null;
  }

  return (
    <div>
      <Label className="mb-1.5 block text-xs text-muted-foreground">CONDITION</Label>
      <Select 
        value={currentOperator}
        onValueChange={(value) => onConditionChange('operator', value)}
      >
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Select condition" />
        </SelectTrigger>
        <SelectContent>
          {operatorOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 