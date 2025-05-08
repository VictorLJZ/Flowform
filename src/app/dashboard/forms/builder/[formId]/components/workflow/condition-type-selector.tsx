"use client"

import { Connection } from '@/types/workflow-types';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ArrowRight, Filter } from 'lucide-react';

interface ConditionTypeSelectorProps {
  connection: Connection;
  onConditionTypeChange: (type: 'always' | 'conditional') => void;
}

export function ConditionTypeSelector({ 
  connection,
  onConditionTypeChange
}: ConditionTypeSelectorProps) {
  const derivedConditionType = 
    connection.rules && 
    connection.rules.length > 0 && 
    connection.rules[0].condition_group && 
    connection.rules[0].condition_group.conditions && 
    connection.rules[0].condition_group.conditions.length > 0
      ? 'conditional'
      : 'always';
  
  return (
    <div className="mb-4">
      <Label className="mb-1.5 block text-xs text-muted-foreground">CONNECTION LOGIC</Label>
      <Select 
        value={derivedConditionType}
        onValueChange={(value: 'always' | 'conditional') => {
          onConditionTypeChange(value);
        }}
      >
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Select connection logic" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="always" className="flex items-center">
            <div className="flex items-center">
              <ArrowRight className="mr-2 h-4 w-4 text-blue-500" />
              <span>Always Proceed</span>
            </div>
          </SelectItem>
          <SelectItem value="conditional">
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4 text-amber-500" />
              <span>Conditional (If conditions met)</span>
            </div>
          </SelectItem>
          {/* Fallback option removed as it's deprecated with the new rules system */}
        </SelectContent>
      </Select>
    </div>
  );
}
