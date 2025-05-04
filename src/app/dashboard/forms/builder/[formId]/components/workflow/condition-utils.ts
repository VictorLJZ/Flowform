import { FormBlock } from '@/types/block-types';
import { BlockChoiceOption, operatorLabels } from './condition-types';
import { Edge } from 'reactflow';
import { WorkflowEdgeData } from '@/types/workflow-types';

// Function to get human-readable field name
export const getFieldName = (fieldId: string, sourceBlock?: FormBlock | null): string => {
  if (!fieldId) return '';
  
  if (fieldId === 'answer') return 'Answer';
  if (fieldId === 'selected') return 'Selected';
  if (fieldId === 'rating') return 'Rating';
  if (fieldId === 'length') return 'Length';
  if (fieldId === 'domain') return 'Domain';
  if (fieldId === 'weekday') return 'Day of Week';
  if (fieldId === 'sentiment') return 'Sentiment';
  
  if (fieldId.startsWith('choice:')) {
    const choiceValue = fieldId.split(':')[1];
    if (!sourceBlock?.settings) return choiceValue;
    
    const choices = ((sourceBlock.settings.choices || sourceBlock.settings.options) as BlockChoiceOption[] | undefined) || [];
    
    // Only try to find if choices is actually an array
    if (Array.isArray(choices)) {
      const choice = choices.find(c => c.value === choiceValue || c.label === choiceValue);
      return choice ? `"${choice.label}"` : choiceValue;
    }
    
    return choiceValue;
  }
  
  return fieldId;
};

// Get a summary of the current condition in plain language
export const getConditionSummary = (
  element: Edge<WorkflowEdgeData>, 
  sourceBlock: FormBlock | null | undefined, 
  sourceBlockType: string
): string => {
  if (!element?.data?.connection?.condition) return 'No condition set';
  
  const { field, operator, value } = element.data.connection.condition;
  
  if (!field) return 'No condition set';
  
  const fieldName = getFieldName(field, sourceBlock);
  const operatorText = operatorLabels[operator] || operator;
  
  // For choice-specific selections
  if (field.startsWith('choice:')) {
    return operator === 'equals' 
      ? `When "${fieldName}" is selected` 
      : `When "${fieldName}" is not selected`;
  }
  
  // For checkbox "selected" field
  if (field === 'selected' && sourceBlockType === 'checkbox_group') {
    const isChecked = value === true;
    return operator === 'equals' 
      ? `When ${isChecked ? 'any option is checked' : 'no options are checked'}`
      : `When ${!isChecked ? 'any option is checked' : 'no options are checked'}`;
  }
  
  // For length field
  if (field === 'length') {
    return `When response length ${operatorText} ${value || '0'} characters`;
  }
  
  // For weekday field
  if (field === 'weekday') {
    return `When date is${operator === 'not_equals' ? ' not' : ''} on ${value || 'unknown'}`;
  }
  
  // For date field
  if (field === 'answer' && sourceBlockType === 'date') {
    const dateText = value ? new Date(value.toString()).toLocaleDateString() : '(no date)';
    
    switch(operator) {
      case 'equals': return `When date is on ${dateText}`;
      case 'not_equals': return `When date is not on ${dateText}`;
      case 'greater_than': return `When date is after ${dateText}`;
      case 'less_than': return `When date is before ${dateText}`;
      default: return `When date ${operatorText} ${dateText}`;
    }
  }
  
  // For number field
  if (field === 'answer' && sourceBlockType === 'number') {
    return `When number ${operatorText} ${value || '0'}`;
  }
  
  // For email field
  if (field === 'answer' && sourceBlockType === 'email') {
    return `When email ${operatorText} "${value || ''}"`;
  }
  
  // For domain field
  if (field === 'domain') {
    return `When email domain ${operatorText} "${value || ''}"`;
  }
  
  // For rating field
  if (field === 'rating' || (field === 'answer' && sourceBlockType === 'rating')) {
    return `When rating ${operatorText} ${value || '0'}`;
  }
  
  // For multiple choice answer
  if (field === 'answer' && (sourceBlockType === 'multiple_choice' || sourceBlockType === 'dropdown')) {
    return `When answer ${operatorText} "${value || ''}"`;
  }
  
  // For sentiment
  if (field === 'sentiment') {
    return `When sentiment ${operatorText} ${value || ''}`;
  }
  
  // Default case
  return `When ${fieldName.toLowerCase()} ${operatorText} ${value || '(empty)'}`;
}; 