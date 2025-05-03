"use client"

import { ConditionComponentProps, ValueSuggestion } from './condition-types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, X, AlertCircle } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { FormBlock } from '@/types/block-types';
import { BlockChoiceOption } from './condition-types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEffect } from 'react';

interface ConditionValueProps extends ConditionComponentProps {
  sourceBlock: FormBlock | null | undefined;
}

export function ConditionValue({ 
  element, 
  sourceBlock, 
  sourceBlockType, 
  onConditionChange 
}: ConditionValueProps) {
  
  const field = element?.data?.connection?.condition?.field || '';
  const operator = element?.data?.connection?.condition?.operator || 'equals';
  const currentValue = element?.data?.connection?.condition?.value;
  
  // When field changes for choice-specific options, set the value to true for "is selected"
  useEffect(() => {
    if (field.startsWith('choice:') && currentValue === undefined) {
      onConditionChange('value', true);
    }
  }, [field, currentValue, onConditionChange]);
  
  // Get suggested values for the selected field
  const getSuggestedValues = (field: string): ValueSuggestion[] => {
    if (!sourceBlock) return [];
    
    // For a specific multiple choice option, return just this option
    if (field.startsWith('choice:')) {
      return [];  // No suggestions needed since it's binary (selected or not)
    }
    
    // For multiple choice answers, suggest all available options
    if ((field === 'answer') && (sourceBlockType === 'multiple_choice' || sourceBlockType === 'dropdown')) {
      const choices = ((sourceBlock.settings?.choices || sourceBlock.settings?.options) as BlockChoiceOption[] | undefined) || [];
      
      if (!Array.isArray(choices) || choices.length === 0) {
        return [{ label: 'No options available', value: '' }];
      }
      
      return choices.map((choice: BlockChoiceOption) => ({
        label: choice.label,
        value: choice.value || choice.label
      }));
    }
    
    // For email domain, suggest common domains
    if (field === 'domain' && sourceBlockType === 'email') {
      return [
        { label: 'gmail.com', value: 'gmail.com' },
        { label: 'outlook.com', value: 'outlook.com' },
        { label: 'yahoo.com', value: 'yahoo.com' },
        { label: 'hotmail.com', value: 'hotmail.com' },
        { label: 'company.com', value: 'company.com' }
      ];
    }
    
    // For weekday in date inputs
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
    
    // For sentiment in AI conversations
    if (field === 'sentiment' && sourceBlockType.includes('ai_conversation')) {
      return [
        { label: 'Positive', value: 'Positive' },
        { label: 'Negative', value: 'Negative' },
        { label: 'Neutral', value: 'Neutral' }
      ];
    }
    
    return [];
  };

  if (!element?.data?.connection) return null;
  
  // For specific choice field, it's a binary checkbox (is selected / is not selected)
  if (field.startsWith('choice:')) {
    // Extract the choice value for display
    const choiceValue = field.split(':')[1];
    const choices = ((sourceBlock?.settings?.choices || sourceBlock?.settings?.options) as BlockChoiceOption[] | undefined) || [];
    
    let choiceLabel = choiceValue;
    if (Array.isArray(choices)) {
      const choice = choices.find(c => (c.value || c.label) === choiceValue);
      if (choice) choiceLabel = choice.label;
    }
    
    return (
      <div className="mt-2">
        <div className="bg-slate-50 p-3 rounded-md mb-2">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium">Option: <span className="text-blue-700">{choiceLabel}</span></p>
              <p className="text-xs text-muted-foreground mt-1">
                This condition checks if this specific option is {operator === 'equals' ? '' : 'not'} selected.
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
  
  // For the selected field in checkboxes (any option selected)
  else if (field === 'selected' && (sourceBlockType === 'checkbox_group')) {
    return (
      <div className="mt-2">
        <Alert className="bg-slate-50 py-2 px-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                {operator === 'equals' && currentValue === true && "Any option is checked"}
                {operator === 'equals' && currentValue !== true && "No options are checked"}
                {operator === 'not_equals' && currentValue === true && "No options are checked"}
                {operator === 'not_equals' && currentValue !== true && "Any option is checked"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This condition checks if any checkbox option is selected.
              </p>
            </div>
            <Checkbox 
              id="checkbox-value"
              checked={element.data.connection.condition?.value === true}
              onCheckedChange={(checked) => onConditionChange('value', checked === true)}
            />
          </div>
        </Alert>
      </div>
    );
  }
  
  // For multiple choice selection from available options
  else if ((field === 'answer') && 
           (sourceBlockType === 'multiple_choice' || sourceBlockType === 'dropdown')) {
    const suggestions = getSuggestedValues(field);
    
    if (suggestions.length > 0) {
      return (
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">SELECTED OPTION</Label>
          <Alert className="bg-blue-50 border-blue-200 text-blue-800 py-2 px-3 mb-2">
            <AlertCircle className="h-4 w-4 text-blue-500 mr-2" />
            <AlertDescription className="text-xs">
              {operator === 'equals' 
                ? "The path will be followed when this option is selected."
                : "The path will be followed when this option is NOT selected."}
            </AlertDescription>
          </Alert>
          <Select
            value={element.data.connection.condition?.value?.toString() || ''}
            onValueChange={(value) => onConditionChange('value', value)}
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
    } else {
      return (
        <div>
          <Alert className="bg-amber-50 border-amber-200 text-amber-800 py-2 px-3">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-xs">
              No options defined for this multiple choice question.
            </AlertDescription>
          </Alert>
        </div>
      );
    }
  }
  
  // For email domain, weekday, or sentiment with predefined options
  else if ((field === 'domain' && sourceBlockType === 'email') ||
           (field === 'weekday' && sourceBlockType === 'date') ||
           (field === 'sentiment' && sourceBlockType.includes('ai_conversation'))) {
    const suggestions = getSuggestedValues(field);
    
    return (
      <div>
        <Label className="mb-1.5 block text-xs text-muted-foreground">VALUE</Label>
        <Select
          value={element.data.connection.condition?.value?.toString() || ''}
          onValueChange={(value) => onConditionChange('value', value)}
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
  
  // For numeric fields (rating, number value, length)
  else if ((field === 'rating' || field === 'answer' || field === 'length') && 
           (sourceBlockType === 'number' || sourceBlockType === 'rating' || 
            field === 'length')) {
    return (
      <div>
        <Label className="mb-1.5 block text-xs text-muted-foreground">VALUE</Label>
        <Input
          type="number"
          min={(sourceBlockType === 'rating') ? 1 : undefined}
          max={(sourceBlockType === 'rating') ? 5 : undefined}
          placeholder={field === 'length' ? "Character count" : "Value"}
          value={element.data.connection.condition?.value?.toString() || ''}
          onChange={(e) => onConditionChange('value', parseInt(e.target.value) || 0)}
          className="h-9"
        />
      </div>
    );
  }
  
  // For dates
  else if (field === 'answer' && sourceBlockType === 'date') {
    return (
      <div>
        <Label className="mb-1.5 block text-xs text-muted-foreground">VALUE</Label>
        <Input
          type="date"
          value={element.data.connection.condition?.value?.toString() || ''}
          onChange={(e) => onConditionChange('value', e.target.value)}
          className="h-9"
        />
      </div>
    );
  }
  
  // Default text input for all other cases
  else {
    return (
      <div>
        <Label className="mb-1.5 block text-xs text-muted-foreground">VALUE</Label>
        <Input
          placeholder="Value"
          value={element.data.connection.condition?.value?.toString() || ''}
          onChange={(e) => onConditionChange('value', e.target.value)}
          className="h-9"
        />
      </div>
    );
  }
} 