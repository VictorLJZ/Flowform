import type { FormBlock } from './block-types';

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  condition?: ConditionRule;
  order: number;
}

export interface ConditionRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number | boolean;
}

export interface WorkflowNodeData {
  block: FormBlock;
  label: string;
  isConnectionTarget?: boolean;
}

export interface WorkflowEdgeData {
  connection: Connection;
}