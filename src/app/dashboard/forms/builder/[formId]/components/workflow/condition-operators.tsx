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
import { Connection, ConditionRule } from '@/types/workflow-types';
import { FormBlock } from '@/types/block-types';

interface ConditionOperatorsProps extends ConditionComponentProps {
  currentConnection: Connection | null;
  sourceBlock: FormBlock | null | undefined;
  conditionId: string;
}

function getUserFriendlyOperatorLabel(
  field: string, 
  operator: ConditionOperator, 
  sourceBlockType: string
): string {
  if (field.startsWith('choice:')) {
    return operator === 'equals' ? 'Is Selected' : 'Is Not Selected';
  } 
  else if (field === 'selected') {
    return operator === 'equals' ? 'Is Checked' : 'Is Not Checked';
  }
  else if (field === 'length') {
    switch (operator) {
      case 'equals': return 'Is Exactly';
      case 'not_equals': return 'Is Not Exactly';
      case 'greater_than': return 'Is More Than';
      case 'less_than': return 'Is Less Than';
      default: return operatorLabels[operator];
    }
  }
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
  else if (field === 'answer' && sourceBlockType === 'date') {
    switch (operator) {
      case 'equals': return 'Is On';
      case 'not_equals': return 'Is Not On';
      case 'greater_than': return 'Is After';
      case 'less_than': return 'Is Before';
      default: return operatorLabels[operator];
    }
  }
  
  return operatorLabels[operator];
}

export function ConditionOperators({ 
  sourceBlock, 
  sourceBlockType, 
  onConditionChange,
  currentConnection,
  conditionId
}: ConditionOperatorsProps) {
  const connection = currentConnection;
  if (!connection) return null; 
  
  const conditionsInFirstRule = connection.rules?.[0]?.condition_group?.conditions;
  const currentCondition: ConditionRule | undefined = conditionsInFirstRule?.find((cond: ConditionRule) => cond.id === conditionId);
    
  const currentField = currentCondition?.field || '';
  const currentOperator = currentCondition?.operator || 'equals'; 

  const availableOperators = getOperatorsForField(currentField, sourceBlock);
  
  const operatorOptions = availableOperators.map(operator => ({
    value: operator,
    label: getUserFriendlyOperatorLabel(currentField, operator, sourceBlockType)
  }));

  if (currentField.startsWith('choice:') && operatorOptions.length <= 1) {
    return null;
  }

  return (
    <div>
      <Label className="mb-1.5 block text-xs text-muted-foreground">CONDITION</Label>
      <Select 
        value={currentOperator}
        onValueChange={(value) => onConditionChange('operator', value as ConditionOperator)} 
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