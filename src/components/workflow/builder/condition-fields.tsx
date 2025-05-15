"use client"

import { ConditionComponentProps, FieldOption, getAvailableFieldsForBlock } from '@/types/workflow-condition-types';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { UiBlock } from '@/types/block';
import { Connection, ConditionRule } from '@/types/workflow-types';

interface ConditionFieldsProps extends ConditionComponentProps {
  sourceBlock: UiBlock | null | undefined;
  currentConnection: Connection | null;
  conditionId: string;
}

export function ConditionFields({ 
  sourceBlock, 
  onConditionChange,
  currentConnection,
  conditionId
}: ConditionFieldsProps) {
  const connection = currentConnection;
  if (!connection) return null;
  
  const conditionsInFirstRule = connection.rules?.[0]?.condition_group?.conditions;
  const currentCondition: ConditionRule | undefined = conditionsInFirstRule?.find((cond: ConditionRule) => cond.id === conditionId);
    
  const currentField = currentCondition?.field || '';

  const getFieldOptions = (): FieldOption[] => {
    if (!sourceBlock) return [];
    
    const availableFields = getAvailableFieldsForBlock(sourceBlock);
    
    if (sourceBlock.subtype === 'multiple_choice') {
      return availableFields;
    }
    
    const standardFieldOptions = availableFields.filter(field => !field.id.startsWith('choice:'));
    const choiceFields = availableFields.filter(field => field.id.startsWith('choice:'));
    
    if (choiceFields.length > 0) {
      return [
        ...standardFieldOptions,
        ...(choiceFields.length > 0 ? [
          { 
            id: 'header-choices', 
            label: '── Specific Options ──',
            valueType: 'string',
            blockTypes: [],
            operators: ['equals'],
            disabled: true
          } as FieldOption,
          ...choiceFields
        ] : [])
      ];
    }
    
    return availableFields;
  };

  const fields = getFieldOptions();

  return (
    <div>
      <Label className="mb-1.5 block text-xs text-muted-foreground">FIELD</Label>
      <Select 
        value={currentField}
        onValueChange={(value) => {
          if (value.startsWith('header-')) return;
          onConditionChange('field', value);
        }}
      >
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Select a field" />
        </SelectTrigger>
        <SelectContent>
          {fields.map((option: FieldOption) => (
            <SelectItem 
              key={option.id} 
              value={option.id}
              disabled={option.disabled}
              className={option.disabled ? "opacity-60 font-semibold" : ""}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}