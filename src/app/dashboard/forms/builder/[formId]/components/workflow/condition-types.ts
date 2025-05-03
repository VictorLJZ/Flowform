import { Edge } from 'reactflow';
import { WorkflowEdgeData } from '@/types/workflow-types';

// Field option type
export interface FieldOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Operator option type
export interface OperatorOption {
  value: string;
  label: string;
}

// Value suggestion type
export interface ValueSuggestion {
  value: string;
  label: string;
}

// Block choice option type (for multiple choice, checkboxes, etc.)
export interface BlockChoiceOption {
  id?: string;
  label: string;
  value?: string;
}

// Define condition display labels for better readability
export const operatorLabels: Record<string, string> = {
  'equals': 'is equal to',
  'not_equals': 'is not equal to',
  'contains': 'contains',
  'greater_than': 'is greater than',
  'less_than': 'is less than'
};

// Shared props for condition components
export interface ConditionComponentProps {
  element: Edge<WorkflowEdgeData>;
  sourceBlockType: string;
  onConditionChange: (key: string, value: string | number | boolean) => void;
} 