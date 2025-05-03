"use client"

import { Edge } from 'reactflow';
import { WorkflowEdgeData } from '@/types/workflow-types';
import { FormBlock } from '@/types/block-types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConditionFields } from './condition-fields';
import { ConditionOperators } from './condition-operators';
import { ConditionValue } from './condition-value';

interface ConditionCardProps {
  element: Edge<WorkflowEdgeData>;
  sourceBlock: FormBlock | null | undefined;
  sourceBlockType: string;
  onConditionChange: (key: string, value: string | number | boolean) => void;
}

export function ConditionCard({ 
  element, 
  sourceBlock,
  sourceBlockType, 
  onConditionChange 
}: ConditionCardProps) {
  const field = element?.data?.connection?.condition?.field || '';
  
  // Get the context-specific help text based on field type and block type
  const getHelpText = () => {
    if (sourceBlockType === 'multiple_choice' || sourceBlockType === 'dropdown') {
      if (field.startsWith('choice:')) {
        return "This condition checks whether a specific option is selected.";
      } else if (field === 'answer') {
        return "For multiple choice questions, select which specific answer should trigger this path.";
      }
      return "First select whether to check the entire answer or a specific option.";
    } 
    
    else if (sourceBlockType === 'checkbox_group') {
      if (field.startsWith('choice:')) {
        return "This condition checks whether a specific checkbox is selected.";
      } else if (field === 'selected') {
        return "This condition checks if any option is checked in the checkbox group.";
      }
      return "For checkboxes, you can check any specific option or if any option is checked.";
    } 
    
    else if (sourceBlockType === 'number') {
      return "Compare the numeric value using equals, greater than, or less than conditions.";
    }
    
    else if (sourceBlockType === 'date') {
      return "You can compare dates or check specific days of the week.";
    }
    
    return "Set conditions for when this path should be followed.";
  };
  
  return (
    <Card className="border-blue-100">
      <CardHeader className="py-3 px-4 bg-blue-50 border-b border-blue-100">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-sm">Condition Rules</CardTitle>
            <CardDescription className="text-xs mt-1">
              When should this path be taken?
            </CardDescription>
          </div>
          <Info size={16} className="text-blue-500" />
        </div>
      </CardHeader>
      <CardContent className="px-4 py-3 space-y-4">
        {/* Context-aware help text */}
        <Alert className="bg-blue-50 border-blue-200 text-blue-800 py-2 px-3">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-xs">
            {getHelpText()}
          </AlertDescription>
        </Alert>
        
        <div className="grid gap-3">
          <ConditionFields 
            element={element} 
            sourceBlock={sourceBlock}
            sourceBlockType={sourceBlockType} 
            onConditionChange={onConditionChange} 
          />
          
          <ConditionOperators 
            element={element} 
            sourceBlockType={sourceBlockType} 
            onConditionChange={onConditionChange} 
          />
          
          <ConditionValue 
            element={element} 
            sourceBlock={sourceBlock}
            sourceBlockType={sourceBlockType} 
            onConditionChange={onConditionChange} 
          />
        </div>
      </CardContent>
      <CardFooter className="px-4 py-3 border-t bg-slate-50">
        <div className="text-xs text-slate-500 flex items-center">
          <Info size={12} className="mr-1.5" />
          {!element?.data?.connection?.condition?.field 
            ? "Without conditions, this path is always followed when possible." 
            : "This path will only be followed when the condition is met."}
        </div>
      </CardFooter>
    </Card>
  );
} 