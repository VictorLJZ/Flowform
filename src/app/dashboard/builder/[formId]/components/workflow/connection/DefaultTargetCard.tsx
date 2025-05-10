"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormBlock } from '@/types/block-types'
import { Connection } from '@/types/workflow-types'
import { BlockPill } from '../../block-pill'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { getBlockTypeColors } from '@/utils/block-utils' // Not currently used

interface DefaultTargetCardProps {
  connection: Connection;
  blocks: FormBlock[];
  onTargetChange: (targetId: string) => void; 
  onPendingChange: () => void;
}

export function DefaultTargetCard({ connection, blocks, onTargetChange, onPendingChange }: DefaultTargetCardProps) {
  // const sourceBlock = blocks.find(b => b.id === connection.sourceId); // Not currently used
  // const sourceBlockType = sourceBlock?.blockTypeId || 'unknown'; // Not currently used
  // Using static styling instead of dynamic color scheme to avoid TypeScript errors
  
  // Filter out the source block from the available target blocks
  const availableBlocks = blocks.filter(b => b.id !== connection.sourceId);
  
  const handleDefaultTargetChange = (newTargetId: string) => {
    onTargetChange(newTargetId);
    onPendingChange();
  };

  return (
    <Card className="overflow-hidden border shadow-sm">
      <CardHeader className="bg-slate-50 text-slate-800 p-3 space-y-0">
        <CardTitle className="text-sm font-medium">Default Target</CardTitle>
        <CardDescription className="text-xs text-slate-600">
          Where to go if no rules match
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        <div className="mt-1 pt-1 space-y-2">
          <div className="flex items-center space-x-2 flex-wrap">
            <span className="text-sm font-medium text-foreground">All other cases go to</span>
            <Select
              value={connection.defaultTargetId || ''}
              onValueChange={handleDefaultTargetChange}
            >
              <SelectTrigger id="all-other-cases-target-select" className="flex-grow">
                <SelectValue placeholder="Select block...">
                  {connection.is_explicit && blocks.find(b => b.id === connection.defaultTargetId) ? (
                    <BlockPill block={blocks.find(b => b.id === connection.defaultTargetId)!} />
                  ) : (
                    "Select block..."
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableBlocks.map(block => (
                  <SelectItem key={block.id} value={block.id}>
                    <BlockPill block={block} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            This is the default path when none of the rule conditions match
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
