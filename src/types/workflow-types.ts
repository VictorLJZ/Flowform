import type { FormBlock } from './block-types';
import type { LogicalOperator } from './workflow-condition-types';
export type { LogicalOperator };

export type ConditionOperator = 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';

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
  operator: ConditionOperator;
  value: string | number | boolean;
  logical_operator?: LogicalOperator; // Relationship to the NEXT condition
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
  isDefaultPath?: boolean;
  isRulePath?: boolean;
  rule?: Rule;
  hasConditions?: boolean;
  conditionOperator?: ConditionOperator | null;
}

/**
 * Represents the database structure for workflow edges with the old condition format
 * This is used for backward compatibility with the existing database structure
 * while the application transitions to the new rules-based approach.
 */
export interface DbWorkflowEdgeWithOldConditions {
  id: string;
  form_id: string;
  source_block_id: string;
  target_block_id: string; // Used as default or in rule target
  default_target_id?: string | null; // For newer schema
  condition_field?: string | null;
  condition_operator?: ConditionOperator | null;
  condition_value?: string | number | boolean | null;
  condition_id?: string | null;
  order_index?: number | null;
  rules?: string | Rule[] | null; // Rules can be stored as a JSON string or already parsed
  condition_type?: 'always' | 'conditional' | 'fallback';
  [key: string]: unknown; // Allow for additional properties
}