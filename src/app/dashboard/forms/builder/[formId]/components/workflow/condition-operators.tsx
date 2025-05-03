"use client"

import { ConditionComponentProps, OperatorOption } from './condition-types';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export function ConditionOperators({ 
  element, 
  sourceBlockType, 
  onConditionChange 
}: ConditionComponentProps) {
  // Get operator options based on field type
  const getOperatorOptions = (field: string): OperatorOption[] => {
    // For choice-specific fields (when a specific choice is selected)
    if (field.startsWith('choice:')) {
      return [
        { value: 'equals', label: 'Is Selected' },
        { value: 'not_equals', label: 'Is Not Selected' }
      ];
    } 
    
    // For checkbox group 'selected' field
    else if (field === 'selected') {
      return [
        { value: 'equals', label: 'Is Checked' },
        { value: 'not_equals', label: 'Is Not Checked' }
      ];
    }
    
    // For length field in text inputs
    else if (field === 'length') {
      return [
        { value: 'equals', label: 'Is Exactly' },
        { value: 'not_equals', label: 'Is Not Exactly' },
        { value: 'greater_than', label: 'Is More Than' },
        { value: 'less_than', label: 'Is Less Than' }
      ];
    }
    
    // For numbers and ratings
    else if ((field === 'rating' || field === 'answer') && 
             (sourceBlockType === 'number' || sourceBlockType === 'rating')) {
      return [
        { value: 'equals', label: 'Equals (=)' },
        { value: 'not_equals', label: 'Does Not Equal (≠)' },
        { value: 'greater_than', label: 'Greater Than (>)' },
        { value: 'less_than', label: 'Less Than (<)' }
      ];
    }
    
    // For email domain
    else if (field === 'domain') {
      return [
        { value: 'equals', label: 'Is Exactly' },
        { value: 'not_equals', label: 'Is Not' },
        { value: 'contains', label: 'Contains' }
      ];
    }
    
    // For dates
    else if (field === 'answer' && sourceBlockType === 'date') {
      return [
        { value: 'equals', label: 'Is On' },
        { value: 'not_equals', label: 'Is Not On' },
        { value: 'greater_than', label: 'Is After' },
        { value: 'less_than', label: 'Is Before' }
      ];
    }
    
    // For weekday field in date inputs
    else if (field === 'weekday') {
      return [
        { value: 'equals', label: 'Is' },
        { value: 'not_equals', label: 'Is Not' }
      ];
    }
    
    // For sentiment in AI conversation
    else if (field === 'sentiment') {
      return [
        { value: 'equals', label: 'Is' },
        { value: 'not_equals', label: 'Is Not' }
      ];
    }
    
    // For text inputs
    else if (field === 'answer' && (sourceBlockType === 'short_text' || sourceBlockType === 'long_text' || sourceBlockType === 'email')) {
      return [
        { value: 'equals', label: 'Exactly Matches' },
        { value: 'not_equals', label: 'Does Not Match' },
        { value: 'contains', label: 'Contains' }
      ];
    }
    
    // For multiple choice answer
    else if (field === 'answer' && (sourceBlockType === 'multiple_choice' || sourceBlockType === 'dropdown')) {
      return [
        { value: 'equals', label: 'Is Selected' },
        { value: 'not_equals', label: 'Is Not Selected' }
      ];
    }
    
    // Default operators
    else {
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Does Not Equal' },
        { value: 'contains', label: 'Contains' }
      ];
    }
  };

  const currentField = element?.data?.connection?.condition?.field || '';

  // Hide condition operator selector for choice fields as it's handled by the choice itself
  if (currentField.startsWith('choice:')) {
    return null;
  }

  return (
    <div>
      <Label className="mb-1.5 block text-xs text-muted-foreground">CONDITION</Label>
      <Select 
        value={element?.data?.connection?.condition?.operator || 'equals'}
        onValueChange={(value) => onConditionChange('operator', value)}
      >
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Select condition" />
        </SelectTrigger>
        <SelectContent>
          {getOperatorOptions(currentField).map((option: OperatorOption) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 