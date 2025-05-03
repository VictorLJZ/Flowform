"use client"

import { Edge } from 'reactflow';
import { WorkflowEdgeData } from '@/types/workflow-types';
import { FormBlock } from '@/types/block-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getConditionSummary } from './condition-utils';

interface ConnectionOverviewProps {
  element: Edge<WorkflowEdgeData>;
  sourceBlock: FormBlock | null | undefined;
  targetBlock: FormBlock | null | undefined;
  sourceBlockType: string;
}

export function ConnectionOverview({ 
  element, 
  sourceBlock, 
  targetBlock, 
  sourceBlockType 
}: ConnectionOverviewProps) {
  // Get source and target block display names
  const getSourceName = () => sourceBlock?.title || 'Unknown';
  const getTargetName = () => targetBlock?.title || 'Unknown';

  return (
    <Card>
      <CardHeader className="py-3 px-4 bg-slate-50 border-b">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm">Connection Path</CardTitle>
            <CardDescription className="text-xs mt-1">
              Flow direction and condition
            </CardDescription>
          </div>
          {element?.data?.connection?.condition?.field && (
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
        
        {/* Condition summary */}
        {element?.data?.connection?.condition?.field && (
          <div className="mt-3 pt-3 border-t border-dashed">
            <div className="text-xs text-muted-foreground mb-1">Current condition:</div>
            <div className="text-sm bg-blue-50 p-2 rounded-md">
              {getConditionSummary(element, sourceBlock, sourceBlockType)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 