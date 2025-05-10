"use client"

import { useMemo } from 'react'
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { BlockPill } from '../../block-pill'

interface SourceHeaderProps {
  connectionId: string;
  sourceId: string;
}

/**
 * Displays information about the source block of a connection
 */
export function SourceHeader({ sourceId }: SourceHeaderProps) {
  const blocks = useFormBuilderStore(state => state.blocks)
  
  // Find the source block
  const sourceBlock = useMemo(() => 
    blocks.find(block => block.id === sourceId),
    [blocks, sourceId]
  )
  
  if (!sourceBlock) {
    return (
      <div>
        <div className="font-medium text-destructive">Source block not found</div>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex items-center space-x-2">
        <BlockPill block={sourceBlock} />
        <span className="font-medium">&quot;{sourceBlock.title || 'Untitled Block'}&quot;</span>
      </div>
    </div>
  )
}
