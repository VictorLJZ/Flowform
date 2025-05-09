import { FormBlock } from '@/types/block-types';
import { BlockChoiceOption, operatorLabels } from '@/types/workflow-condition-types';
import { Edge } from 'reactflow';
import { Connection, ConditionRule, WorkflowEdgeData } from '@/types/workflow-types';

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
    const choiceWithIndex = fieldId.split(':')[1];
    const choiceValue = choiceWithIndex.split('_')[0];
    if (!sourceBlock?.settings) return choiceValue;
    const choices = ((sourceBlock.settings.choices || sourceBlock.settings.options) as BlockChoiceOption[] | undefined) || [];
    if (Array.isArray(choices)) {
      const choice = choices.find(c => c.value === choiceValue || c.label === choiceValue);
      return choice ? `"${choice.label}"` : choiceValue;
    }
    return choiceValue;
  }
  return fieldId;
};

// Renamed from getSingleConditionSummary and adjusted for ConditionRule type
const summarizeConditionRule = (
  conditionRule: ConditionRule, 
  sourceBlock: FormBlock | null | undefined
): string => {
  if (!conditionRule) return 'Invalid condition';
  const fieldName = getFieldName(conditionRule.field, sourceBlock);
  const operatorText = operatorLabels[conditionRule.operator] || conditionRule.operator;
  const valueText = typeof conditionRule.value === 'string' && conditionRule.value.length > 20 
    ? `"${conditionRule.value.substring(0, 20)}..."` 
    : `"${String(conditionRule.value)}"`;
  return `${fieldName} ${operatorText} ${valueText}`;
};

// Get a summary of the current condition in plain language
export const getConditionSummary = (
  connectionData: Connection | Edge<WorkflowEdgeData>, 
  sourceBlock: FormBlock | null | undefined
): string => {
  const isEdge = (data: Connection | Edge<WorkflowEdgeData>): data is Edge<WorkflowEdgeData> => {
    return 'data' in data && data.data !== undefined;
  };

  const connection = isEdge(connectionData) 
    ? connectionData.data?.connection 
    : connectionData;

  if (!connection) return 'No connection data';

  if (!connection.rules || connection.rules.length === 0) {
    return 'Always proceed to default target';
  }

  if (connection.rules.length === 1) {
    const rule = connection.rules[0];
    if (!rule.condition_group || rule.condition_group.conditions.length === 0) {
      return `Always proceed to rule's target`; 
    }
    const groupSummary = rule.condition_group.conditions
      .map(cr => summarizeConditionRule(cr, sourceBlock))
      .join(` ${rule.condition_group.logical_operator} `);
    return `If ${groupSummary}, proceed to rule's target`; 
  }
  
  return 'Proceed based on multiple rules';
};