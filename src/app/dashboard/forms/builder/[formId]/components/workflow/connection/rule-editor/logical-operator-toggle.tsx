"use client"

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LogicalOperatorToggleProps {
  value: 'AND' | 'OR';
  onChange: (value: 'AND' | 'OR') => void;
}

/**
 * Toggle component for switching between AND/OR operators
 */
export function LogicalOperatorToggle({ value, onChange }: LogicalOperatorToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-muted rounded-md text-xs p-1">
      <Button
        size="sm"
        variant={value === 'AND' ? 'default' : 'ghost'}
        onClick={() => onChange('AND')}
        className={cn(
          "px-2 h-6 text-xs",
          value === 'AND' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
        )}
      >
        AND
      </Button>
      <Button
        size="sm"
        variant={value === 'OR' ? 'default' : 'ghost'}
        onClick={() => onChange('OR')}
        className={cn(
          "px-2 h-6 text-xs",
          value === 'OR' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
        )}
      >
        OR
      </Button>
    </div>
  )
}
