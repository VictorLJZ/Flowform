"use client"

import { Edge } from 'reactflow';
import { WorkflowEdgeData, Connection } from '@/types/workflow-types';
import { FormBlock } from '@/types/block-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getConditionSummary } from '@/utils/workflow/condition-utils';

interface ConnectionOverviewProps {
  element: Edge<WorkflowEdgeData>;
  sourceBlock: FormBlock | null | undefined;
  targetBlock: FormBlock | null | undefined;
  sourceBlockType: string;
  currentConnection: Connection | null;
}

export function ConnectionOverview({ 
  element, 
  sourceBlock, 
  targetBlock, 
  sourceBlockType,
  currentConnection
}: ConnectionOverviewProps) {
  // Get source and target block display names
  const getSourceName = () => sourceBlock?.title || 'Unknown';
  const getTargetName = () => targetBlock?.title || 'Unknown';

  // Use current connection if available, otherwise use element data
  const connection = currentConnection || element?.data?.connection;
  
  // Determine if the connection has conditions based on the new model
  const hasConditions = 
    connection?.conditionType === 'conditional' || 
    (connection?.conditions && connection.conditions.length > 0);

  return (
    <Card className="p-0 shadow-sm border rounded-md overflow-hidden gap-0">
      <CardHeader className="py-3 px-4 bg-slate-50 border-b">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm">Connection Path</CardTitle>
            <CardDescription className="text-xs mt-1">
              Flow direction and condition
            </CardDescription>
          </div>
          {hasConditions && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-normal">
              Conditional
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 py-3">
        <div className="relative my-1 flex items-center text-sm">
          <div className="min-w-0 flex-1 font-medium truncate">
            {getSourceName()}
          </div>
          <ArrowRight className="mx-2 h-4 w-4 flex-shrink-0 text-slate-400" />
          <div className="min-w-0 flex-1 font-medium truncate text-right">
            {getTargetName()}
          </div>
        </div>
        
        {/* Condition summary - use current connection for more accurate display */}
        {hasConditions && (
          <div className="mt-3 pt-3 border-t border-dashed">
            <div className="text-xs text-muted-foreground mb-1">Current condition:</div>
            <div className="text-sm bg-blue-50 p-2 rounded-md">
              {connection && getConditionSummary(connection, sourceBlock, sourceBlockType)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 