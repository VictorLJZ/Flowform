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
  const updateConnectionTarget = useFormBuilderStore(state => state.updateConnectionTarget)
  const connections = useFormBuilderStore(state => state.connections); // Get all connections
  
  // Find the specific connection object to check its is_explicit flag
  const currentConnection = useMemo(() => 
    connections.find(c => c.id === connectionId), 
    [connections, connectionId]
  );
  
  // All blocks except the source block
  const availableBlocks = useMemo(() => 
    blocks.filter(block => block.id !== sourceId),
    [blocks, sourceId]
  )
  
  // Handle changing the default target
  const handleTargetChange = (newTargetId: string) => {
    updateConnectionTarget(connectionId, newTargetId)
    onPendingChange()
  }
  
  // Find the current default target block (based on the prop)
  const defaultTargetBlock = useMemo(() => 
    blocks.find(block => block.id === defaultTargetId),
    [blocks, defaultTargetId]
  );
  
  // Determine the value to display in the Select input
  // If the connection is explicit, show its target. Otherwise, show empty to force placeholder.
  const displayValue = currentConnection?.is_explicit ? defaultTargetId || '' : '';

  // Check if there are rules in the connection (using currentConnection from store)
  const hasRules = currentConnection?.rules && currentConnection.rules.length > 0;

  return (
    <div className="space-y-2">
      <div>
        <span className="text-sm text-muted-foreground">
          {hasRules ? "All other cases go to:" : "Always go to this block:"}
        </span>
      </div>
      
      <Select
        value={displayValue} // Use the conditional displayValue for the Select's actual state
        onValueChange={handleTargetChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select block...">
            {/* If connection is explicit and defaultTargetBlock exists, show BlockPill. Otherwise, placeholder. */}
            {currentConnection?.is_explicit && defaultTargetBlock ? (
              <BlockPill block={defaultTargetBlock} />
            ) : (
              "Select block..."
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
