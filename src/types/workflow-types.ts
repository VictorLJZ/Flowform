import type { FormBlock } from './block-types';

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  conditionType: 'always' | 'conditional' | 'fallback';
  conditions: ConditionRule[];
  order_index: number;
}

export interface ConditionRule {
  id: string; // To identify individual conditions
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number | boolean;
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface WorkflowSettings {
  connections: Connection[];
  nodePositions?: Record<string, NodePosition>;
}

export interface WorkflowNodeData {
  block: FormBlock;
  label: string;
  isConnectionTarget?: boolean;
}

export interface WorkflowEdgeData {
  connection: Connection;
}