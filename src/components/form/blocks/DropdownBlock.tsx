"use client"

import React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { FormBlockWrapper } from "@/components/form/FormBlockWrapper"
import { BlockPresentation } from "@/types/theme-types"

interface Option {
  id: string
  label: string
  value?: string
}

interface DropdownBlockProps {
  id: string
  title: string
  description?: string
  required: boolean
  index?: number
  totalBlocks?: number
  settings: {
    options?: Option[]
    placeholder?: string
    presentation?: BlockPresentation
  }
  value?: string
  onChange?: (value: string) => void
  onUpdate?: (updates: Partial<{ title: string, description: string, settings: any }>) => void
}

export function DropdownBlock({
  id,
  title,
  description,
  required,
  index,
  totalBlocks,
  settings,
  value,
  onChange,
  onUpdate
}: DropdownBlockProps) {
  const { mode } = useFormBuilderStore()
  const isBuilder = mode === 'builder'
  
  const handleValueChange = (newValue: string) => {
    if (onChange) {
      onChange(newValue)
    }
  }

  // The actual select component that will be wrapped
  const selectField = (
    <div className="max-w-md mt-2">
      <Select 
        disabled={isBuilder}
        value={value}
        onValueChange={handleValueChange}
      >
        <SelectTrigger className={cn(
          isBuilder && "opacity-70"
        )}>
          <SelectValue placeholder={settings?.placeholder || "Select an option"} />
        </SelectTrigger>
        <SelectContent>
          {(settings?.options || []).map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <FormBlockWrapper
      id={id}
      title={title}
      description={description}
      required={required}
      index={index}
      totalBlocks={totalBlocks}
      settings={{ presentation: settings.presentation }}
      onUpdate={onUpdate}
    >
      {selectField}
    </FormBlockWrapper>
  );
}
