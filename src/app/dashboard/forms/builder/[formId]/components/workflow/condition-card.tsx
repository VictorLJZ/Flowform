"use client"

// Removed unused imports
import { Edge } from 'reactflow';
import { WorkflowEdgeData, Connection } from '@/types/workflow-types';
import { FormBlock } from '@/types/block-types';
import { useFormBuilderStore } from '@/stores/formBuilderStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Info, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
// Removed unused import: Separator
import { ConditionFields } from './condition-fields';
import { ConditionOperators } from './condition-operators';
import { ConditionValue } from './condition-value';
import { ConditionTypeSelector } from './condition-type-selector';
// Removed unused import: uuidv4

interface ConditionCardProps {
  element: Edge<WorkflowEdgeData>;
  sourceBlock: FormBlock | null | undefined;
  sourceBlockType: string;
  currentConnection: Connection | null;
  // Updated callback functions for the enhanced condition system
  onConditionTypeChange: (type: 'always' | 'conditional' | 'fallback') => void;
  onConditionChange: (conditionId: string, key: string, value: string | number | boolean) => void;
  onAddCondition: () => void;
  onRemoveCondition: (conditionId: string) => void;
}

export function ConditionCard({ 
  element, 
  sourceBlock,
  sourceBlockType,
  onConditionTypeChange,
  onConditionChange,
  onAddCondition,
  onRemoveCondition, 
  currentConnection
}: ConditionCardProps) {
  // Find the target block from our current context
  const blocks = useFormBuilderStore(state => state.blocks || []);
  const targetBlock = blocks.find(b => b.id === (currentConnection?.targetId || element?.data?.connection?.targetId));
  // Use consistent connection access pattern
  const connection = currentConnection || element?.data?.connection;
  if (!connection) return null;
  
  // Handle condition type (always, conditional, fallback)
  const conditionType = connection.conditionType || 'always';
  
  // Use the conditions array from the connection
  const conditions = connection.conditions || [];
  
  // For display and management, use the conditions array directly
  const allConditions = [...conditions];

  // Get the context-specific help text based on source block type
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
              Configure how this connection works
            </CardDescription>
          </div>
          <Info size={16} className="text-blue-500" />
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-5">
        {/* Context-aware help text */}
        <Alert className="bg-blue-50 border-blue-200 text-blue-800 py-2 px-3">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-xs">
            {getHelpText()}
          </AlertDescription>
        </Alert>
        
        {/* Condition Type Selector - Always, Conditional, Fallback */}
        <ConditionTypeSelector 
          connection={connection}
          onConditionTypeChange={onConditionTypeChange}
        />
        
        {/* Only show conditions UI for conditional connection type */}
        {conditionType === 'conditional' && (
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="bg-slate-100 px-2 py-1 rounded text-sm font-medium">If</div>
            </div>
            
            {/* Render multiple conditions with AND logic */}
            {allConditions.length > 0 ? (
              <div className="space-y-3">
                {allConditions.map((condition) => (
                  <div key={condition.id} className="pl-3 border-l-2 border-slate-200">
                    <div className="bg-slate-50 rounded-md p-3 relative">
                      {/* Delete condition button */}
                      {allConditions.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-1 top-1 h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onRemoveCondition(condition.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                      
                      <div className="grid gap-3">
                        {/* We need to adapt these components to work with the new structure */}
                        <ConditionFields 
                          element={element} 
                          sourceBlock={sourceBlock}
                          sourceBlockType={sourceBlockType} 
                          onConditionChange={(key, value) => onConditionChange(condition.id, key, value)} 
                          currentConnection={connection}
                          conditionId={condition.id}
                        />
                        
                        <ConditionOperators 
                          element={element} 
                          sourceBlock={sourceBlock}
                          sourceBlockType={sourceBlockType} 
                          onConditionChange={(key, value) => onConditionChange(condition.id, key, value)} 
                          currentConnection={connection}
                          conditionId={condition.id}
                        />
                        
                        <ConditionValue 
                          element={element} 
                          sourceBlock={sourceBlock}
                          sourceBlockType={sourceBlockType} 
                          onConditionChange={(key, value) => onConditionChange(condition.id, key, value)} 
                          currentConnection={connection}
                          conditionId={condition.id}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 text-sm text-gray-500">
                No conditions added yet. Add a condition to create rules.
              </div>
            )}
            
            {/* Add condition button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2 border-dashed text-blue-600"
              onClick={onAddCondition}
            >
              <Plus size={14} className="mr-1" /> Add condition
            </Button>
            
            {/* Then section */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center">
                <div className="bg-slate-100 px-2 py-1 rounded text-sm font-medium">Then</div>
              </div>
              
              <div className="flex items-center bg-slate-50 p-3 rounded-md">
                <ArrowRight className="text-blue-500 mr-2" size={16} />
                <div className="text-sm font-medium">
                  Go to {connection.targetId ? 
                    (targetBlock?.title || 'selected block')
                    : 'next block'}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* For 'always' condition type */}
        {conditionType === 'always' && (
          <div className="bg-slate-50 p-3 rounded-md flex items-center">
            <ArrowRight className="text-blue-500 mr-2" size={16} />
            <div className="text-sm">
              Always proceed to the next block
            </div>
          </div>
        )}
        
        {/* For 'fallback' condition type */}
        {conditionType === 'fallback' && (
          <div className="bg-slate-50 p-3 rounded-md flex items-center">
            <ArrowRight className="text-blue-500 mr-2" size={16} />
            <div className="text-sm">
              Used when no other conditions match
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="px-4 py-3 border-t bg-slate-50">
        <div className="text-xs text-slate-500 flex items-center">
          <Info size={12} className="mr-1.5" />
          {/* Condition type specific footer text */}
          {conditionType === 'always' && (
            <div>Always proceed to the next block</div>
          )}
          {conditionType === 'conditional' && (
            <div>This path will only be followed when the condition is met.</div>
          )}
          {conditionType === 'fallback' && (
            <div>Used when no other conditions match</div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
} 