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
  // Analytics props
  analytics?: {
    trackFocus?: (data?: Record<string, unknown>) => void
    trackBlur?: (data?: Record<string, unknown>) => void
    trackChange?: (data?: Record<string, unknown>) => void
    blockRef?: React.RefObject<HTMLDivElement | null>
  }
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
  onChange?: (type: "answer", value: string[]) => void
  onUpdate?: (updates: Partial<{
    title: string;
    description: string | null;
    settings: {
      options?: Option[];
      layout?: SlideLayout;
      presentation?: BlockPresentation
    } | null;
  }>) => void
  onNext?: () => void
  isNextDisabled?: boolean
}

export function CheckboxGroupBlock({
  analytics,
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
    if (isBuilder || !onChange) return

    // Clone current values array
    const currentValues = [...(value || [])]
    
    // If max selections is set, enforce it
    if (checked && settings?.maxSelected && currentValues.length >= settings.maxSelected) {
      return; // Don't update if it exceeds max selections
    }
    
    // Update the values
    let newValues: string[];
    if (checked) {
      newValues = [...currentValues, optionId];
    } else {
      newValues = currentValues.filter(id => id !== optionId);
    }
    
    // Send the update
    if (onChange) {
      try {
        onChange("answer", newValues);
      } catch {
        console.warn('Falling back to legacy onChange pattern');
        (onChange as unknown as (value: string[]) => void)(newValues);
      }
    }
    
    // Track checkbox interaction for analytics
    if (analytics?.trackChange) {
      analytics.trackChange({
        input_type: 'checkbox_group',
        action: checked ? 'checked' : 'unchecked',
        option_id: optionId,
        selected_count: newValues.length,
        total_options: (settings?.options || []).length
      });
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
        presentation: settings.presentation,
        layout: settings.layout || { type: 'standard' }
      }}
      onUpdate={onUpdate}
      onNext={onNext}
      isNextDisabled={isNextDisabled}
      blockRef={analytics?.blockRef}
    >
      {checkboxGroupField}
    </SlideWrapper>
  );
}
