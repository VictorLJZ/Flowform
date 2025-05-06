"use client"

import React, { useCallback, useEffect, useState } from "react";
import { ConditionComponentProps, ValueSuggestion } from './condition-types';
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
import { BlockChoiceOption } from './condition-types';
import { Connection } from '@/types/workflow-types';

interface ConditionValueProps extends ConditionComponentProps {
  sourceBlock: FormBlock | null | undefined;
  currentConnection: Connection | null;
}

export function ConditionValue({ 
  element, 
  sourceBlock, 
  sourceBlockType, 
  onConditionChange,
  currentConnection
}: ConditionValueProps) {
  // Local state to track input value before committing changes
  const [inputValue, setInputValue] = useState<string>('');
  
  // Use consistent connection and condition access pattern
  const connection = currentConnection || element?.data?.connection;
  // Get current condition values with consistent optional chaining
  const field = connection?.condition?.field || '';
  const operator = connection?.condition?.operator || 'equals';
  const currentValue = connection?.condition?.value;

  // Skip rendering if no connection data
  if (!connection) return null;

  // Initialize input value when currentValue changes
  useEffect(() => {
    if (currentValue !== undefined) {
      setInputValue(String(currentValue));
    }
  }, [currentValue, field]);

  // Initialize default value when field changes and current value is undefined
  useEffect(() => {
    if (field && currentValue === undefined) {
      const defaultValue = getDefaultValueForField(field, sourceBlockType);
      onConditionChange('value', defaultValue);
    }
  }, [field, currentValue, sourceBlockType, onConditionChange]);

  // Get default value based on field type
  const getDefaultValueForField = (field: string, blockType: string): string | number | boolean => {
    // For choice fields, default to true (handling index suffix in choice:value_index)
    if (field.startsWith('choice:') || (field === 'selected' && blockType === 'checkbox_group')) {
      return true;
    }
    
    // For number fields, default to 0
    if ((field === 'answer' && blockType === 'number') || 
        field === 'rating' || field === 'length') {
      return 0;
    }
    
    // Default to empty string for everything else
    return '';
  };

  // Get suggested values for dropdowns and other selects
  const getSuggestedValues = useCallback((): ValueSuggestion[] => {
    // For multiple choice/dropdown
    if ((field === 'answer') && (sourceBlockType === 'multiple_choice' || sourceBlockType === 'dropdown')) {
      const options = sourceBlock?.settings || {};
      const choices = ((options.choices || options.options) as BlockChoiceOption[] | undefined) || [];
      
      if (!Array.isArray(choices) || choices.length === 0) {
        return [{ label: 'No options available', value: '' }];
      }
      
      // Make sure we handle possible undefined/null values in the choices
      return choices.map((choice: BlockChoiceOption) => ({
        label: choice.label || 'Unnamed option',
        value: choice.value || choice.label || ''
      }));
    }
    
    // For email domain
    if (field === 'domain' && sourceBlockType === 'email') {
      return [
        { label: 'gmail.com', value: 'gmail.com' },
        { label: 'outlook.com', value: 'outlook.com' },
        { label: 'yahoo.com', value: 'yahoo.com' },
        { label: 'hotmail.com', value: 'hotmail.com' },
        { label: 'company.com', value: 'company.com' }
      ];
    }
    
    // For weekday
    if (field === 'weekday' && sourceBlockType === 'date') {
      return [
        { label: 'Monday', value: 'Monday' },
        { label: 'Tuesday', value: 'Tuesday' },
        { label: 'Wednesday', value: 'Wednesday' },
        { label: 'Thursday', value: 'Thursday' },
        { label: 'Friday', value: 'Friday' },
        { label: 'Saturday', value: 'Saturday' },
        { label: 'Sunday', value: 'Sunday' },
        { label: 'Weekend', value: 'Weekend' },
        { label: 'Weekday', value: 'Weekday' }
      ];
    }
    
    // For sentiment
    if (field === 'sentiment' && sourceBlockType.includes('ai_conversation')) {
      return [
        { label: 'Positive', value: 'Positive' },
        { label: 'Negative', value: 'Negative' },
        { label: 'Neutral', value: 'Neutral' }
      ];
    }
    
    return [];
  }, [field, sourceBlock, sourceBlockType]);

  // Handle string inputs with proper type coercion
  const handleStringChange = useCallback((value: string) => {
    setInputValue(value);
    onConditionChange('value', value);
  }, [onConditionChange]);

  // Handle number inputs with proper validation
  const handleNumberChange = useCallback((value: string) => {
    setInputValue(value);
    
    // Empty value becomes 0 to ensure consistent type
    if (value === '') {
      onConditionChange('value', 0);
      return;
    }
    
    // Parse as number, default to 0 if NaN
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      onConditionChange('value', numValue);
    }
  }, [onConditionChange]);

  // Handle boolean inputs
  const handleBooleanChange = useCallback((checked: boolean | "indeterminate") => {
    // Always store as boolean
    onConditionChange('value', checked === true);
  }, [onConditionChange]);

  // For choice fields (binary checkbox)
  if (field.startsWith('choice:')) {
    // For multiple choice blocks, show a warning to use "answer" field instead
    if (sourceBlockType === 'multiple_choice') {
      return (
        <div className="mt-2">
          <div className="bg-amber-50 p-3 rounded-md mb-2 border border-amber-200">
            <p className="text-xs text-amber-800">
              For multiple choice questions, use the "Answer" field instead of individual options.
            </p>
          </div>
        </div>
      );
    }
    
    // Extract the choice value for display (format now: choice:value_index)
    const fieldParts = field.split(':');
    if (fieldParts.length > 1) {
      // Extract the main part without the index
      const choiceWithIndex = fieldParts[1];
      const choiceValue = choiceWithIndex.split('_')[0];
      
      const options = sourceBlock?.settings || {};
      const choices = ((options.choices || options.options) as BlockChoiceOption[] | undefined) || [];
      
      let choiceLabel = choiceValue;
      if (Array.isArray(choices) && choices.length > 0) {
        // More robust lookup that handles edge cases and ensures exact matches
        const choice = choices.find(c => 
          (c.value && c.value === choiceValue) || 
          ((!c.value || c.value === '') && c.label === choiceValue)
        );
        if (choice?.label) choiceLabel = choice.label;
      }
      
      return (
        <div className="mt-2">
          <div className="bg-slate-50 p-3 rounded-md mb-2">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <p className="text-sm font-medium">Option: <span className="text-blue-700">{choiceLabel}</span></p>
                <p className="text-xs text-muted-foreground mt-1">
                  When {operator === 'equals' ? 'selected' : 'not selected'}, this path will be followed.
                </p>
              </div>
              <div className="rounded-md border p-1 inline-flex items-center justify-center">
                {operator === 'equals' ? <Check size={16} className="text-green-600" /> : <X size={16} className="text-red-600" />}
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
  
  // For checkbox groups (any option selected)
  if (field === 'selected' && sourceBlockType === 'checkbox_group') {
    return (
      <div>
        <Label className="mb-1.5 block text-xs text-muted-foreground">VALUE</Label>
        <div className="flex items-center space-x-2 mt-1">
          <Checkbox 
            id="checkbox-value"
            checked={currentValue === true}
            onCheckedChange={handleBooleanChange}
          />
          <Label htmlFor="checkbox-value">
            {operator === 'equals' ? 'Has selected options' : 'Has no selected options'}
          </Label>
        </div>
      </div>
    );
  }
  
  // For multiple choice dropdown selections
  if ((field === 'answer') && (sourceBlockType === 'multiple_choice' || sourceBlockType === 'dropdown')) {
    const suggestions = getSuggestedValues();
    
    if (suggestions.length > 0) {
      return (
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">SELECTED OPTION</Label>
          <Select
            value={currentValue !== undefined ? String(currentValue) : ''}
            onValueChange={handleStringChange}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {suggestions.map((option: ValueSuggestion) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }
  }
  
  // For predefined option selections (domains, weekdays, sentiment)
  if ((field === 'domain') || (field === 'weekday') || (field === 'sentiment')) {
    const suggestions = getSuggestedValues();
    
    return (
      <div>
        <Label className="mb-1.5 block text-xs text-muted-foreground">VALUE</Label>
        <Select
          value={currentValue !== undefined ? String(currentValue) : ''}
          onValueChange={handleStringChange}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select a value" />
          </SelectTrigger>
          <SelectContent>
            {suggestions.map((option: ValueSuggestion) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  
  // For numeric inputs (rating, number, length)
  if ((field === 'rating' || field === 'answer' || field === 'length') && 
      (sourceBlockType === 'number' || sourceBlockType === 'rating' || field === 'length')) {
    // Ensure currentValue is properly displayed
    return (
      <div>
        <Label className="mb-1.5 block text-xs text-muted-foreground">VALUE</Label>
        <Input
          type="number"
          min={(sourceBlockType === 'rating') ? 1 : undefined}
          max={(sourceBlockType === 'rating') ? 5 : undefined}
          value={inputValue}
          onChange={(e) => handleNumberChange(e.target.value)}
          className="h-9"
        />
      </div>
    );
  }
  
  // Default input for all other field types (text/string)
  return (
    <div>
      <Label className="mb-1.5 block text-xs text-muted-foreground">VALUE</Label>
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => handleStringChange(e.target.value)}
        className="h-9"
        placeholder="Enter value..."
      />
    </div>
  );
} 