"use client"

import React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { SlideWrapper } from "@/components/form/SlideWrapper"
import { BlockPresentation } from "@/types/theme-types"
import { SlideLayout } from "@/types/layout-types"

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
    allowOther?: boolean
    minSelected?: number
    maxSelected?: number
    presentation?: BlockPresentation
    layout?: SlideLayout
  }
  value?: string[]
  onChange?: (value: string[]) => void
  onUpdate?: (updates: Partial<{
    title: string,
    description: string,
    settings: {
      options?: Option[],
      layout?: SlideLayout,
      presentation?: BlockPresentation
    }
  }>) => void
  onNext?: () => void
  isNextDisabled?: boolean
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
  onUpdate,
  onNext,
  isNextDisabled
}: CheckboxGroupBlockProps) {
  const { mode } = useFormBuilderStore()
  const isBuilder = mode === 'builder'
  
  const handleCheckboxChange = (checked: boolean, optionId: string) => {
    if (!onChange) return;
    
    const selectedCount = value.filter(id => id === optionId).length + (checked ? 1 : -1);
    
    if (checked) {
      const newValue = [...value, optionId];
      
      // If max selections is set, enforce it
      const maxError = typeof settings?.maxSelected === 'number' && selectedCount > settings.maxSelected;
      if (maxError) {
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
      
      {settings?.minSelected !== undefined && value.length < settings.minSelected && (
        <div className="text-red-500 text-sm mt-1">
          Please select at least {settings.minSelected} {settings.minSelected === 1 ? 'option' : 'options'}
        </div>
      )}
      
      {settings?.maxSelected && (
        <div className="text-xs text-gray-500 mt-2">
          Select up to {settings.maxSelected} {settings.maxSelected === 1 ? 'option' : 'options'}
        </div>
      )}
    </div>
  )

  return (
    <SlideWrapper
      id={id}
      title={title}
      description={description}
      required={required}
      index={index}
      totalBlocks={totalBlocks}
      settings={{
        presentation: settings?.presentation,
        layout: settings.layout || { type: 'standard' }
      }}
      onUpdate={onUpdate}
      onNext={onNext}
      isNextDisabled={isNextDisabled}
    >
      {checkboxGroupField}
    </SlideWrapper>
  );
}
