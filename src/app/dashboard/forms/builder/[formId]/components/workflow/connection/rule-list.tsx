"use client"

import { Rule } from '@/types/workflow-types'
import { RuleItem } from './rule-editor/rule-item'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface RuleListProps {
  connectionId: string;
  rules: Rule[];
  onPendingChange: () => void;
}

/**
 * Component for displaying and managing a list of rules
 */
export function RuleList({ connectionId, rules, onPendingChange }: RuleListProps) {
  if (rules.length === 0) {
    return (
      <Alert variant="default" className="bg-muted border-muted-foreground/20">
        <AlertCircle className="h-4 w-4 text-muted-foreground" />
        <AlertDescription className="text-xs text-muted-foreground">
          No rules yet. Add a rule to create conditional logic for this connection.
        </AlertDescription>
      </Alert>
    )
  }
  
  return (
    <div className="space-y-3">
      {rules.map((rule, index) => (
        <RuleItem 
          key={rule.id} 
          rule={rule} 
          ruleIndex={index}
          connectionId={connectionId}
          onPendingChange={onPendingChange}
        />
      ))}
      
      {rules.length > 1 && (
        <p className="text-xs text-muted-foreground italic mt-1">
          Rules are evaluated in order. The first rule whose conditions are met will determine the path.
        </p>
      )}
    </div>
  )
}
