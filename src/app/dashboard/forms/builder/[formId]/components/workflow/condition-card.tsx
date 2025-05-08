"use client"

import { useState, useMemo } from 'react';
import { Edge } from 'reactflow';
import { WorkflowEdgeData, Connection, ConditionRule } from '@/types/workflow-types';
import { FormBlock } from '@/types/block-types';
import { useFormBuilderStore } from '@/stores/formBuilderStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Info, Plus, Trash2, ArrowRight, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { ConditionFields } from './condition-fields';
import { ConditionOperators } from './condition-operators';
import { ConditionValue } from './condition-value';
import { ConditionTypeSelector } from './condition-type-selector';

interface ConditionCardProps {
  element: Edge<WorkflowEdgeData>;
  sourceBlock: FormBlock | null | undefined;
  sourceBlockType: string;
  currentConnection: Connection | null;
  onConditionTypeChange: (type: 'always' | 'conditional' | 'fallback') => void;
  onConditionChange: (conditionId: string, key: string, value: string | number | boolean) => void;
  onAddCondition: () => void;
  onRemoveCondition: (conditionId: string) => void;
  onTargetChange?: (success: boolean) => void;
}

export function ConditionCard({ 
  element, 
  sourceBlock,
  sourceBlockType,
  onConditionTypeChange,
  onConditionChange,
  onAddCondition,
  onRemoveCondition, 
  currentConnection,
  onTargetChange
}: ConditionCardProps) {
  const blocks = useFormBuilderStore(state => state.blocks || []);
  const updateConnectionTarget = useFormBuilderStore(state => state.updateConnectionTarget);
  
  const connection = currentConnection || element?.data?.connection;
  if (!connection) return null;

  const targetBlock = useMemo(() => blocks.find(b => b.id === connection.defaultTargetId), [blocks, connection.defaultTargetId]);
  
  const [targetSelectOpen, setTargetSelectOpen] = useState(false);

  const isActuallyConditional = useMemo(() => 
    !!(connection.rules && 
       connection.rules.length > 0 && 
       connection.rules[0].condition_group && 
       connection.rules[0].condition_group.conditions.length > 0),
    [connection.rules]
  );
  const conditionTypeForDisplay = isActuallyConditional ? 'conditional' : 'always';

  const allConditions: ConditionRule[] = useMemo(() => 
    connection.rules?.[0]?.condition_group?.conditions || [], 
    [connection.rules]
  );
  
  const potentialTargets = useMemo(() => 
    blocks.filter(block => block.id !== sourceBlock?.id)
          .sort((a, b) => a.order_index - b.order_index),
    [blocks, sourceBlock?.id]
  );
  
  const handleTargetChange = (newTargetId: string) => {
    if (!connection) return;
    setTargetSelectOpen(false);
    
    if (newTargetId === connection.defaultTargetId) return;
    
    const success = updateConnectionTarget(connection.id, newTargetId);
    
    if (success) {
      toast({
        title: "Connection target updated",
        description: "Successfully changed the default connection target",
        duration: 2000
      });
    } else {
      toast({
        title: "Cannot update target",
        description: "This change might create an issue or is not allowed.",
        variant: "destructive",
        duration: 3000
      });
    }
    if (onTargetChange) onTargetChange(success);
  };

  const getHelpText = () => {
    if (sourceBlockType === 'multiple_choice' || sourceBlockType === 'dropdown') {
      return "Set up conditions based on answers to determine the path.";
    } 
    else if (sourceBlockType === 'checkbox_group') {
      return "You can check for specific options or if any option is selected.";
    } 
    else if (sourceBlockType === 'number') {
      return "Compare the numeric value using equals, greater than, or less than.";
    } 
    else if (sourceBlockType === 'date') {
      return "Compare dates or check for specific date conditions.";
    }
    return "Set up conditions to determine when this path should be followed.";
  };

  return (
    <Card className="border-blue-100 p-0 shadow-sm rounded-md overflow-hidden gap-0">
      <CardHeader className="py-3 px-4 bg-blue-50 border-b border-blue-100">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-sm">Connection Settings</CardTitle>
            <CardDescription className="text-xs mt-1">
              Configure the default target and conditional logic for this path.
            </CardDescription>
          </div>
          <Info size={16} className="text-blue-500" />
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-5">
        <Alert className="bg-blue-50 border-blue-200 text-blue-800 py-2 px-3">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-xs">
            {getHelpText()}
          </AlertDescription>
        </Alert>

        <div>
          <label className="text-xs font-medium text-slate-700">Default Target Block</label>
          <Select value={connection.defaultTargetId || ''} onValueChange={handleTargetChange} open={targetSelectOpen} onOpenChange={setTargetSelectOpen}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Select default target block..." />
            </SelectTrigger>
            <SelectContent>
              {potentialTargets.map(block => (
                <SelectItem key={block.id} value={block.id}>
                  {block.title || `Block #${block.order_index + 1}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500 mt-1">If no conditions match (or no conditions exist), flow proceeds to this block.</p>
        </div>
        
        <ConditionTypeSelector 
          connection={connection} 
          onConditionTypeChange={onConditionTypeChange}
        />
        
        {conditionTypeForDisplay === 'conditional' && (
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="bg-slate-100 px-2 py-1 rounded text-sm font-medium">
                If ALL of the following conditions in Rule 1 are met:
              </div>
            </div>
            
            {allConditions.length > 0 ? (
              <div className="space-y-3">
                {allConditions.map((conditionRuleItem) => (
                  <div key={conditionRuleItem.id} className="pl-3 border-l-2 border-slate-200">
                    <div className="bg-slate-50 rounded-md p-3 relative">
                      {allConditions.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-1 top-1 h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onRemoveCondition(conditionRuleItem.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                      
                      <div className="grid gap-3">
                        <ConditionFields 
                          element={element} 
                          sourceBlock={sourceBlock}
                          sourceBlockType={sourceBlockType} 
                          onConditionChange={(key, value) => onConditionChange(conditionRuleItem.id, key, value)} 
                          currentConnection={connection} 
                          conditionId={conditionRuleItem.id} 
                        />
                        
                        <ConditionOperators 
                          element={element} 
                          sourceBlock={sourceBlock}
                          sourceBlockType={sourceBlockType} 
                          onConditionChange={(key, value) => onConditionChange(conditionRuleItem.id, key, value)} 
                          currentConnection={connection} 
                          conditionId={conditionRuleItem.id} 
                        />
                        
                        <ConditionValue 
                          element={element} 
                          sourceBlock={sourceBlock}
                          sourceBlockType={sourceBlockType} 
                          onConditionChange={(key, value) => onConditionChange(conditionRuleItem.id, key, value)} 
                          currentConnection={connection} 
                          conditionId={conditionRuleItem.id} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800 py-2 px-3">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-xs">
                  This rule is currently set to conditional but has no conditions. It will effectively act as 'always'. Add conditions below or set to 'Always'.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}