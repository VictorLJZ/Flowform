"use client"

import { ConditionComponentProps, FieldOption } from './condition-types';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { FormBlock } from '@/types/block-types';
import { BlockChoiceOption } from './condition-types';

interface ConditionFieldsProps extends ConditionComponentProps {
  sourceBlock: FormBlock | null | undefined;
}

export function ConditionFields({ 
  element, 
  sourceBlock, 
  sourceBlockType, 
  onConditionChange 
}: ConditionFieldsProps) {
  // Generate field options based on source block type
  const getFieldOptions = (): FieldOption[] => {
    if (!sourceBlock) return [{ value: 'answer', label: 'Answer' }];
    
    const options: FieldOption[] = [];
    
    // Add specific field options based on block type
    if (sourceBlockType === 'multiple_choice' || sourceBlockType === 'dropdown') {
      options.push({ 
        value: 'answer', 
        label: 'Selected Answer Value' 
      });
      
      // Add group header for specific choice options
      options.push({ 
        value: 'header-specific-options', 
        label: '── Check Specific Option ──',
        disabled: true
      });
      
      // Add specific choices as options
      const choices = ((sourceBlock.settings?.choices || sourceBlock.settings?.options) as BlockChoiceOption[] | undefined) || [];
      
      if (Array.isArray(choices) && choices.length > 0) {
        choices.forEach((choice: BlockChoiceOption) => {
          // Use value if available, otherwise use label
          const value = choice.value || choice.label;
          options.push({ 
            value: `choice:${value}`, 
            label: `${choice.label}` 
          });
        });
      }
    } else if (sourceBlockType === 'checkbox_group') {
      options.push({ value: 'selected', label: 'Any Option Selected' });
      
      // Add group header for specific checkbox options
      options.push({ 
        value: 'header-specific-checkboxes', 
        label: '── Check Specific Checkbox ──',
        disabled: true
      });
      
      // Add specific checkboxes as options
      const choices = (sourceBlock.settings?.options as BlockChoiceOption[] | undefined) || [];
      
      if (Array.isArray(choices) && choices.length > 0) {
        choices.forEach((choice: BlockChoiceOption) => {
          // Use value if available, otherwise use label
          const value = choice.value || choice.label;
          options.push({ 
            value: `choice:${value}`, 
            label: `${choice.label}` 
          });
        });
      }
    } else if (sourceBlockType === 'short_text' || sourceBlockType === 'long_text') {
      options.push({ value: 'answer', label: 'Text Response' });
      options.push({ value: 'length', label: 'Response Length' });
    } else if (sourceBlockType === 'email') {
      options.push({ value: 'answer', label: 'Email Address' });
      options.push({ value: 'domain', label: 'Email Domain' });
    } else if (sourceBlockType === 'number') {
      options.push({ value: 'answer', label: 'Number Value' });
    } else if (sourceBlockType === 'date') {
      options.push({ value: 'answer', label: 'Selected Date' });
      options.push({ value: 'weekday', label: 'Day of Week' });
    } else if (sourceBlockType === 'rating') {
      options.push({ value: 'rating', label: 'Rating Value' });
    } else if (sourceBlockType.includes('ai_conversation')) {
      options.push({ value: 'answer', label: 'Last Response' });
      options.push({ value: 'sentiment', label: 'Sentiment' });
    } else {
      // Default for any block type
      options.push({ value: 'answer', label: 'Answer' });
    }
    
    return options;
  };

  return (
    <div>
      <Label className="mb-1.5 block text-xs text-muted-foreground">FIELD</Label>
      <Select 
        value={element?.data?.connection?.condition?.field || ''}
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
          {getFieldOptions().map((option: FieldOption) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
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