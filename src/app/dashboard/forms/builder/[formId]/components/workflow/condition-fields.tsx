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
import { FormBlock } from '@/types/block-types';
import { Connection } from '@/types/workflow-types';

interface ConditionFieldsProps extends ConditionComponentProps {
  sourceBlock: FormBlock | null | undefined;
  currentConnection: Connection | null;
  conditionId?: string; // Optional ID to support multiple conditions
}

export function ConditionFields({ 
  element, 
  sourceBlock, 
  sourceBlockType, 
  onConditionChange,
  currentConnection,
  conditionId
}: ConditionFieldsProps) {
  // Use currentConnection if available for more accurate UI state
  const connection = currentConnection || element?.data?.connection;
  
  // Get the specific condition we're editing based on conditionId
  const currentCondition = conditionId && connection?.conditions
    ? connection.conditions.find(cond => cond.id === conditionId)
    : connection?.conditions?.[0] || undefined;
    
  // Get the current field from the condition
  const currentField = currentCondition?.field || '';

  // Get field options using standardized function
  const getFieldOptions = (): FieldOption[] => {
    if (!sourceBlock) return [];
    
    // Get available fields based on source block
    const availableFields = getAvailableFieldsForBlock(sourceBlock);
    
    // For multiple choice blocks, we no longer need to modify the label
    if (sourceBlockType === 'multiple_choice') {
      return availableFields;
    }
    
    // For other blocks, organize fields for better UI display:
    // 1. Standard fields first
    const standardFieldOptions = availableFields.filter(field => !field.id.startsWith('choice:'));
    
    // 2. Choice fields with a header if they exist
    const choiceFields = availableFields.filter(field => field.id.startsWith('choice:'));
    
    if (choiceFields.length > 0) {
      // Creating the complete options array with a header for choices
      return [
        ...standardFieldOptions,
        // Add header for choices if there are any
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
          // Skip disabled headers
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