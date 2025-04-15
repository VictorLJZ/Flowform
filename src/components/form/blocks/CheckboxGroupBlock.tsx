"use client"

import React, { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { FormBlockWrapper } from "@/components/form/FormBlockWrapper"
import { BlockPresentation } from "@/types/theme-types"

interface Option {
  id: string
  label: string
}

interface CheckboxGroupBlockProps {
  id: string
  title: string
  description?: string
  required: boolean
  index?: number
  totalBlocks?: number
  settings: {
    options?: Option[]
    minSelections?: number
    maxSelections?: number
    presentation?: BlockPresentation
  }
  value?: string[]
  onChange?: (value: string[]) => void
  onUpdate?: (updates: Partial<{ title: string, description: string, settings: any }>) => void
}

export function CheckboxGroupBlock({
  id,
  title,
  description,
  required,
  index,
  totalBlocks,
  settings,
  value = [],
  onChange,
  onUpdate
}: CheckboxGroupBlockProps) {
  const { mode } = useFormBuilderStore()
  const isBuilder = mode === 'builder'
  
  const handleCheckboxChange = (checked: boolean, optionId: string) => {
    if (!onChange) return;
    
    if (checked) {
      const newValue = [...value, optionId];
      
      // If max selections is set, enforce it
      if (settings?.maxSelections && newValue.length > settings.maxSelections) {
        return; // Don't update if it exceeds max selections
      }
      
      onChange(newValue);
    } else {
      onChange(value.filter(id => id !== optionId));
    }
  }

  // The actual checkbox group component that will be wrapped
  const checkboxGroupField = (
    <div className="space-y-3 mt-2">
      {(settings?.options || []).map((option) => (
        <div key={option.id} className="flex items-center space-x-2">
          <Checkbox 
            id={option.id} 
            disabled={isBuilder}
            checked={value.includes(option.id)}
            onCheckedChange={(checked) => handleCheckboxChange(!!checked, option.id)}
          />
          <Label 
            htmlFor={option.id} 
            className={cn(
              isBuilder && "opacity-70"
            )}
          >
            {option.label}
          </Label>
        </div>
      ))}
      
      {settings?.minSelections && settings.minSelections > 0 && (
        <div className="text-xs text-gray-500 mt-2">
          Select at least {settings.minSelections} {settings.minSelections === 1 ? 'option' : 'options'}
        </div>
      )}
      
      {settings?.maxSelections && (
        <div className="text-xs text-gray-500 mt-2">
          Select up to {settings.maxSelections} {settings.maxSelections === 1 ? 'option' : 'options'}
        </div>
      )}
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
      {checkboxGroupField}
    </FormBlockWrapper>
  );
}
