"use client"

import React, { useCallback, useEffect, useState } from "react";
import { ConditionComponentProps, ValueSuggestion, BlockChoiceOption } from '@/types/workflow-condition-types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, X } from 'lucide-react';
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
  sourceBlock, 
  sourceBlockType, 
  onConditionChange,
  currentConnection,
  conditionId
}: ConditionValueProps) {
  const [inputValue, setInputValue] = useState<string>('');
  
  const connection = currentConnection;
  if (!connection) return null;
  
  const conditionsInFirstRule = connection.rules?.[0]?.condition_group?.conditions;
  const currentCondition: ConditionRule | undefined = conditionsInFirstRule?.find((cond: ConditionRule) => cond.id === conditionId);
    
  const field = currentCondition?.field || '';
  const operator = currentCondition?.operator || 'equals';
  const currentValue = currentCondition?.value;

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

  const getDefaultValueForField = useCallback((field: string, blockType: string): string | number | boolean => {
    if (field.startsWith('choice:') || (field === 'selected' && blockType === 'checkbox_group')) {
      return true;
    }
    if ((field === 'answer' && blockType === 'number') || 
        field === 'rating' || field === 'length') {
      return 0;
    }
    return '';
  }, []);

  const getSuggestedValues = useCallback((): ValueSuggestion[] => {
    if ((field === 'answer') && (sourceBlockType === 'multiple_choice' || sourceBlockType === 'dropdown')) {
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
    if (field === 'domain' && sourceBlockType === 'email') {
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
    if (field === 'weekday') {
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
    if (field === 'sentiment') {
      return [
        { label: 'Positive', value: 'positive' },
        { label: 'Neutral', value: 'neutral' },
        { label: 'Negative', value: 'negative' },
      ];
    }
    return [];
  }, [field, sourceBlock, sourceBlockType]);

  useEffect(() => {
    if (currentValue !== undefined) {
      setInputValue(String(currentValue));
    }
  }, [currentValue, field]);

  useEffect(() => {
    if (field && currentValue === undefined && connection) { 
      const defaultValue = getDefaultValueForField(field, sourceBlockType);
      onConditionChange('value', defaultValue);
    }
  }, [field, currentValue, sourceBlockType, onConditionChange, connection, getDefaultValueForField]);
  
  if (!field) return null;

  if (field.startsWith('choice:')) {
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
    
    const fieldParts = field.split(':');
    if (fieldParts.length > 1) {
      const choiceWithIndex = fieldParts[1];
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
                checked={currentValue === true} 
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

  if (field === 'selected' && sourceBlockType === 'checkbox_group') {
    return (
      <div className="mt-2">
        <div className="bg-slate-50 p-3 rounded-md mb-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Is any option selected?</span>
            <Checkbox 
              checked={currentValue === true} 
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
    const isOtherDomain = field === 'domain' && currentValue === 'other';
    const displaySuggestions = suggestions.filter(s => !(field === 'domain' && s.value === 'other'));

    return (
      <div>
        <Label className="mb-1.5 block text-xs text-muted-foreground">VALUE</Label>
        <Select value={String(currentValue)} onValueChange={handleStringChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select a value" />
          </SelectTrigger>
          <SelectContent>
            {displaySuggestions.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
            {field === 'domain' && (
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

  const inputType = (field === 'answer' && sourceBlockType === 'number') || 
                  field === 'rating' || field === 'length' 
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