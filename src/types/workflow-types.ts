import type { FormBlock } from './block-types';
import type { LogicalOperator } from './workflow-condition-types';
export type { LogicalOperator };

export interface Rule {
  id: string;
  name?: string;
  target_block_id: string;
  condition_group: ConditionGroup;
}

export interface ConditionGroup {
  logical_operator: LogicalOperator;
  conditions: ConditionRule[];
}

export interface Connection {
  id: string;
  sourceId: string;
  defaultTargetId: string | null;
  rules: Rule[];
  order_index?: number;
}

export interface ConditionRule {
  id: string;
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