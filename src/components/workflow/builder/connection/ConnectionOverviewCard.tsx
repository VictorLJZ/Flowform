"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormBlock } from '@/types/block-types'
import { Connection } from '@/types/workflow-types'
import { BlockPill } from '@/components/form/builder/block-pill'
import { ArrowRight } from 'lucide-react'
// import { getBlockTypeColors } from '@/utils/block-utils' // Not currently used

interface ConnectionOverviewCardProps {
  connection: Connection;
  sourceBlock: FormBlock | null;
  targetBlock: FormBlock | null;
}

export function ConnectionOverviewCard({ connection, sourceBlock, targetBlock }: ConnectionOverviewCardProps) {
  if (!connection || !sourceBlock) return null;
  
  // const sourceBlockType = sourceBlock.blockTypeId || 'unknown'; // Not currently used
  // We don't need the color scheme in this component currently
  // const colorScheme = getBlockTypeColors(sourceBlockType);
  
  return (
    <Card className="overflow-hidden border shadow-sm !py-0 !gap-0">
      <CardHeader className="bg-blue-50 text-blue-700 p-3 space-y-0">
        <CardTitle className="text-sm font-medium flex flex-row items-center">
          Connection Overview
        </CardTitle>
        <CardDescription className="text-xs text-blue-700/80">
          Define how this connection works
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center gap-2 bg-muted/30 rounded-md p-2">
          <div className="flex-1 min-w-0">
            <BlockPill block={sourceBlock} />
            <div className="text-xs text-muted-foreground mt-1 truncate">
              Source: {sourceBlock.title || 'Untitled Block'}
            </div>
          </div>
          
          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            {targetBlock ? (
              <>
                <BlockPill block={targetBlock} />
                <div className="text-xs text-muted-foreground mt-1 truncate">
                  Default Target: {targetBlock.title || 'Untitled Block'}
                </div>
              </>
            ) : (
              <div className="text-xs text-muted-foreground italic">
                No default target set
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
