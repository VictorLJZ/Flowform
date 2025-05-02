"use client"

import React from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { SlideWrapper } from "@/components/form/SlideWrapper"
import { BlockPresentation } from "@/types/theme-types"
import { SlideLayout } from "@/types/layout-types"

interface Option {
  id: string
  label: string
  value?: string
}

interface MultipleChoiceBlockProps {
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
    presentation?: BlockPresentation
    layout?: SlideLayout
  }
  value?: string
  onChange?: (value: string) => void
  onUpdate?: (updates: Partial<{
    title: string,
    description: string,
    settings: {
      options?: Option[],
      presentation?: BlockPresentation,
      layout?: SlideLayout
    }
  }>) => void
  onNext?: () => void
  isNextDisabled?: boolean
}

export function MultipleChoiceBlock({
  analytics,
  id,
  title,
  description,
  required,
  index,
  totalBlocks,
  settings,
  value,
  onChange,
  onUpdate,
  onNext,
  isNextDisabled
}: MultipleChoiceBlockProps) {
  const { mode } = useFormBuilderStore()
  const isBuilder = mode === 'builder'
  
  const handleSelect = (option: string) => {
    // Only handle selection in viewer mode
    if (mode !== 'builder' && onChange) {
      onChange(option);
      
      // Track selection for analytics
      if (analytics?.trackChange) {
        analytics.trackChange({
          input_type: 'multiple_choice',
          selected_option: option,
          options_count: (settings?.options || []).length
        });
      }
    }
  }

  // The actual radio group component that will be wrapped
  const radioGroupField = (
    <RadioGroup 
      disabled={isBuilder}
      value={value || ""} 
      onValueChange={handleSelect}
      className="space-y-3 mt-1"
    >
      {(settings?.options || []).map((option) => (
        <div key={option.id} className="flex items-center space-x-2">
          <RadioGroupItem value={option.id} id={option.id} />
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
      
      {settings?.allowOther && (
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="other" id={`${id}-other`} />
          <Label 
            htmlFor={`${id}-other`}
            className={cn(
              isBuilder && "opacity-70"
            )}
          >
            Other
          </Label>
        </div>
      )}
    </RadioGroup>
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
    >
      {radioGroupField}
    </SlideWrapper>
  );
}
