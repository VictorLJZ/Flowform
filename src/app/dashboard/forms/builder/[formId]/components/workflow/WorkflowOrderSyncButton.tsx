/**
 * Workflow Order Sync Button
 * 
 * Provides a UI element to manually synchronize block order with workflow connections.
 * This is part of our decoupled architecture where block order is not automatically
 * updated when workflow connections change.
 */

import React from 'react';
import { useFormBuilderStore } from '@/stores/formBuilderStore';
import { Button } from '@/components/ui/button';
import { ArrowDownUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function WorkflowOrderSyncButton() {
  const syncBlockOrderWithConnections = useFormBuilderStore(state => state.syncBlockOrderWithConnections);
  const connections = useFormBuilderStore(state => state.connections);
  const blocks = useFormBuilderStore(state => state.blocks);
  
  // Don't show the button if there aren't enough blocks and connections to make it useful
  if (blocks.length < 2 || connections.length === 0) {
    return null;
  }
  
  const handleSyncClick = () => {
    if (window.confirm('This will reorder your blocks to match the workflow connections. Continue?')) {
      syncBlockOrderWithConnections();
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2 flex items-center gap-1"
            onClick={handleSyncClick}
          >
            <ArrowDownUp className="h-4 w-4" />
            <span>Sync Order</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Reorder blocks to match workflow connections</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
