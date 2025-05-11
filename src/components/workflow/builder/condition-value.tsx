"use client"

import React, { useCallback, useEffect, useState } from "react";
import { ConditionComponentProps, ValueSuggestion, BlockChoiceOption } from '@/types/workflow-condition-types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
// import { Check, X } from 'lucide-react'; // Not currently used
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { FormBlock } from '@/types/block-types';
import { Connection, ConditionRule } from '@/types/workflow-types';

interface ConditionValueProps extends ConditionComponentProps {
  sourceBlock: FormBlock | null | undefined;
  currentConnection: Connection | null;
  conditionId: string;
}

export function ConditionValue({
  conditionId,
  sourceBlock,
  sourceBlockType,
  currentConnection,
  onConditionChange
}: ConditionValueProps) {
  const [inputValue, setInputValue] = useState<string>('');

  // Extract all the data we need at the top level
  const connection = currentConnection;
  const conditionsInFirstRule = connection?.rules?.[0]?.condition_group?.conditions || [];
  const currentCondition: ConditionRule | undefined = conditionsInFirstRule.find((cond: ConditionRule) => cond.id === conditionId);
  const fieldValue = currentCondition?.field || '';
  // const operator = currentCondition?.operator || 'equals'; // Not currently used
  const currentValueData = currentCondition?.value;

  // Move all hooks to the top level - before any conditional returns
  const handleStringChange = useCallback((value: string) => {
    setInputValue(value);
    onConditionChange('value', value);
  }, [onConditionChange]);

  const handleNumberChange = useCallback((value: string) => {
    setInputValue(value);
    if (!isNaN(Number(value))) {
      onConditionChange('value', Number(value));
    }
  }, [onConditionChange]);

  const handleBooleanChange = useCallback((checked: boolean | "indeterminate") => {
    onConditionChange('value', checked === true);
  }, [onConditionChange]);

  const getDefaultValueForField = useCallback((fieldValueName: string, blockType: string): string | number | boolean => {
    if (fieldValueName.startsWith('choice:') || (fieldValueName === 'selected' && blockType === 'checkbox_group')) {
      return true;
    }
    if ((fieldValueName === 'answer' && blockType === 'number') || 
        fieldValueName === 'rating' || fieldValueName === 'length') {
      return 0;
    }
    return '';
  }, []);

  const getSuggestedValues = useCallback((): ValueSuggestion[] => {
    if ((fieldValue === 'answer') && (sourceBlockType === 'multiple_choice' || sourceBlockType === 'dropdown')) {
      const options = sourceBlock?.settings || {};
      const choices = ((options.choices || options.options) as BlockChoiceOption[] | undefined) || [];
      if (!Array.isArray(choices) || choices.length === 0) {
        return [{ label: 'No options available', value: '' }];
      }
      return choices.map((choice: BlockChoiceOption) => ({
        label: choice.label || 'Unnamed option',
        value: choice.value || choice.label || ''
      }));
    }
    if (fieldValue === 'domain' && sourceBlockType === 'email') {
      return [
        { label: 'gmail.com', value: 'gmail.com' },
        { label: 'outlook.com', value: 'outlook.com' },
        { label: 'yahoo.com', value: 'yahoo.com' },
        { label: 'hotmail.com', value: 'hotmail.com' },
        { label: 'icloud.com', value: 'icloud.com' },
        { label: 'aol.com', value: 'aol.com' },
        { label: 'protonmail.com', value: 'protonmail.com' },
        { label: 'Other', value: 'other' },
      ];
    }
    if (fieldValue === 'weekday') {
      return [
        { label: 'Monday', value: 'monday' },
        { label: 'Tuesday', value: 'tuesday' },
        { label: 'Wednesday', value: 'wednesday' },
        { label: 'Thursday', value: 'thursday' },
        { label: 'Friday', value: 'friday' },
        { label: 'Saturday', value: 'saturday' },
        { label: 'Sunday', value: 'sunday' },
        { label: 'Weekday', value: 'weekday' },
        { label: 'Weekend', value: 'weekend' },
      ];
    }
    if (fieldValue === 'sentiment') {
      return [
        { label: 'Positive', value: 'positive' },
        { label: 'Neutral', value: 'neutral' },
        { label: 'Negative', value: 'negative' },
      ];
    }
    return [];
  }, [fieldValue, sourceBlock, sourceBlockType]);

  useEffect(() => {
    if (currentValueData !== undefined) {
      setInputValue(String(currentValueData));
    }
  }, [currentValueData, fieldValue]);

  useEffect(() => {
    if (fieldValue && currentValueData === undefined && connection) { 
      const defaultValue = getDefaultValueForField(fieldValue, sourceBlockType);
      onConditionChange('value', defaultValue);
    }
  }, [fieldValue, currentValueData, sourceBlockType, onConditionChange, connection, getDefaultValueForField]);
  
  if (!fieldValue) return null;

  if (fieldValue.startsWith('choice:')) {
    if (sourceBlockType === 'multiple_choice') {
      return (
        <div className="mt-2">
          <div className="bg-amber-50 p-3 rounded-md mb-2 border border-amber-200">
            <p className="text-xs text-amber-800">
              For multiple choice questions, use the &quot;Answer&quot; field instead of individual options.
            </p>
          </div>
        </div>
      );
    }
    
    const fieldValueParts = fieldValue.split(':');
    if (fieldValueParts.length > 1) {
      const choiceWithIndex = fieldValueParts[1];
      const choiceValue = choiceWithIndex.split('_')[0];
      
      const options = sourceBlock?.settings || {};
      const choices = ((options.choices || options.options) as BlockChoiceOption[] | undefined) || [];
      
      let choiceLabel = choiceValue;
      if (Array.isArray(choices) && choices.length > 0) {
        const choice = choices.find(c => 
          (c.value && c.value === choiceValue) || 
          ((!c.value || c.value === '') && c.label === choiceValue)
        );
        if (choice?.label) choiceLabel = choice.label;
      }
      
      return (
        <div className="mt-2">
          <div className="bg-slate-50 p-3 rounded-md mb-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Is &quot;{choiceLabel}&quot; selected?</span>
              <Checkbox 
                checked={currentValueData === true} 
                onCheckedChange={handleBooleanChange}
                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  if (fieldValue === 'selected' && sourceBlockType === 'checkbox_group') {
    return (
      <div className="mt-2">
        <div className="bg-slate-50 p-3 rounded-md mb-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Is any option selected?</span>
            <Checkbox 
              checked={currentValueData === true} 
              onCheckedChange={handleBooleanChange}
              className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
            />
          </div>
        </div>
      </div>
    );
  }

  const suggestions = getSuggestedValues();
  if (suggestions.length > 0) {
    const isOtherDomain = fieldValue === 'domain' && currentValueData === 'other';
    const displaySuggestions = suggestions.filter(s => !(fieldValue === 'domain' && s.value === 'other'));

    return (
      <div>
        <Label className="mb-1.5 block text-xs text-muted-foreground">VALUE</Label>
        <Select value={String(currentValueData)} onValueChange={handleStringChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select a value" />
          </SelectTrigger>
          <SelectContent>
            {displaySuggestions.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
            {fieldValue === 'domain' && (
              <SelectItem value="other">Other...</SelectItem>
            )}
          </SelectContent>
        </Select>
        {isOtherDomain && (
          <Input 
            type="text" 
            value={inputValue} 
            onChange={(e) => handleStringChange(e.target.value)} 
            placeholder="Enter domain (e.g., example.com)"
            className="mt-2 h-9"
          />
        )}
      </div>
    );
  }

  const inputType = (fieldValue === 'answer' && sourceBlockType === 'number') || 
                  fieldValue === 'rating' || fieldValue === 'length' 
                  ? 'number' 
                  : 'text';

  return (
    <div>
      <Label className="mb-1.5 block text-xs text-muted-foreground">VALUE</Label>
      <Input 
        type={inputType} 
        value={inputValue} 
        onChange={(e) => inputType === 'number' ? handleNumberChange(e.target.value) : handleStringChange(e.target.value)} 
        placeholder={inputType === 'number' ? "Enter a number" : "Enter a value"}
        className="h-9"
      />
    </div>
  );
}

export default ConditionValue;