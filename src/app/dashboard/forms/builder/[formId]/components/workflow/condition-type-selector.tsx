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
import { ArrowRight, Filter, MoreHorizontal } from 'lucide-react';

interface ConditionTypeSelectorProps {
  connection: Connection;
  onConditionTypeChange: (type: 'always' | 'conditional' | 'fallback') => void;
}

export function ConditionTypeSelector({ 
  connection,
  onConditionTypeChange
}: ConditionTypeSelectorProps) {
  const conditionType = connection.conditionType || 'always';
  
  return (
    <div className="mb-4">
      <Label className="mb-1.5 block text-xs text-muted-foreground">CONNECTION TYPE</Label>
      <Select 
        value={conditionType}
        onValueChange={(value: 'always' | 'conditional' | 'fallback') => {
          onConditionTypeChange(value);
        }}
      >
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Select connection type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="always" className="flex items-center">
            <div className="flex items-center">
              <ArrowRight className="mr-2 h-4 w-4 text-blue-500" />
              <span>Always proceed</span>
            </div>
          </SelectItem>
          <SelectItem value="conditional">
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4 text-amber-500" />
              <span>If condition matches...</span>
            </div>
          </SelectItem>
          <SelectItem value="fallback">
            <div className="flex items-center">
              <MoreHorizontal className="mr-2 h-4 w-4 text-gray-500" />
              <span>All other cases</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
