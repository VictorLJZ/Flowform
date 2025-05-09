"use client"

import { useMemo } from 'react'
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { BlockPill } from '../../block-pill'

interface DefaultTargetProps {
  connectionId: string;
  sourceId: string;
  defaultTargetId: string;
  onPendingChange: () => void;
}

/**
 * Component for selecting the default target block 
 * (where to go if no rules match)
 */
export function DefaultTarget({ 
  connectionId, 
  sourceId, 
  defaultTargetId, 
  onPendingChange 
}: DefaultTargetProps) {
  const blocks = useFormBuilderStore(state => state.blocks)
  const updateConnection = useFormBuilderStore(state => state.updateConnection)
  
  // All blocks except the source block
  const availableBlocks = useMemo(() => 
    blocks.filter(block => block.id !== sourceId),
    [blocks, sourceId]
  )
  
  // Handle changing the default target
  const handleTargetChange = (newTargetId: string) => {
    updateConnection(connectionId, { defaultTargetId: newTargetId })
    onPendingChange()
  }
  
  // Find the current default target block
  const defaultTargetBlock = useMemo(() => 
    blocks.find(block => block.id === defaultTargetId),
    [blocks, defaultTargetId]
  )
  
  // Check if there are rules in the connection
  const formBuilderStore = useFormBuilderStore();
  const connection = formBuilderStore.connections.find(c => c.id === connectionId);
  const hasRules = connection?.rules && connection.rules.length > 0;
  
  return (
    <div className="space-y-2">
      <div>
        <span className="text-sm text-muted-foreground">
          {hasRules ? "All other cases go to:" : "Always go to this block:"}
        </span>
      </div>
      
      <Select
        value={defaultTargetId || ''}
        onValueChange={handleTargetChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select fallback block...">
            {defaultTargetBlock ? (
              <BlockPill block={defaultTargetBlock} />
            ) : (
              "Select fallback block..."
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableBlocks.map(block => (
            <SelectItem key={block.id} value={block.id} className="flex items-center">
              <BlockPill block={block} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {hasRules && (
        <div className="text-xs text-muted-foreground mt-2">
          If no rules match, respondents will be directed to this block.
        </div>
      )}
    </div>
  )
}
