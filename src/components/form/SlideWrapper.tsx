"use client"

import React, { useRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { useAutosave } from "@/services/form/autosaveForm"
import { BlockPresentation } from "@/types/theme-types"
import { 
  SlideLayout, 
  StandardSlideLayout as StandardSlideLayoutType, 
  MediaLeftLayout as MediaLeftLayoutType, 
  MediaRightLayout as MediaRightLayoutType, 
  MediaBackgroundLayout as MediaBackgroundLayoutType,
  MediaLeftSplitLayout as MediaLeftSplitLayoutType,
  MediaRightSplitLayout as MediaRightSplitLayoutType
} from "@/types/layout-types"
import { SlideAspectRatioContainer } from "./SlideAspectRatioContainer"
import { StandardSlideLayout } from "./slide-layouts/StandardSlideLayout"
import { MediaLeftLayout } from "./slide-layouts/MediaLeftLayout"
import { MediaRightLayout } from "./slide-layouts/MediaRightLayout"
import { MediaBackgroundLayout } from "./slide-layouts/MediaBackgroundLayout"
import { MediaLeftSplitLayout } from "./slide-layouts/MediaLeftSplitLayout"
import { MediaRightSplitLayout } from "./slide-layouts/MediaRightSplitLayout"
import type { FormBlock } from "@/types/supabase-types"; // Import FormBlock type

interface SlideWrapperProps {
  id: string
  title: string
  description?: string
  required: boolean
  index?: number
  totalBlocks?: number
  settings: {
    presentation?: BlockPresentation
    layout: SlideLayout
  }
  children: React.ReactNode
  onUpdate?: (updates: Partial<FormBlock>) => void
  onNext?: () => void
  isNextDisabled?: boolean
  blockRef?: React.RefObject<HTMLDivElement | null>
  className?: string
}

export function SlideWrapper({
  id,
  title,
  description,
  required,
  index,
  totalBlocks,
  settings,
  onUpdate,
  onNext,
  isNextDisabled = false,
  children,
  blockRef,
  className
}: SlideWrapperProps) {
  const titleRef = useRef<HTMLDivElement>(null)
  const internalRef = useRef<HTMLDivElement>(null)
  const { mode } = useFormBuilderStore()
  const autosave = useAutosave()
  
  // Get block presentation from settings - using default if not provided
  settings.presentation = settings?.presentation || { layout: 'left', spacing: 'normal', titleSize: 'medium' }
  
  // Get slide layout from settings or use standard layout as default
  const slideLayout = settings?.layout || { type: 'standard' }
  
  // Determine if we're in builder mode
  const isBuilder = mode === 'builder'
  
  // Debug the mode and onNext props
  useEffect(() => {

  }, [mode, isBuilder, onNext])
  
  // Update title ref when title prop changes
  useEffect(() => {
    if (titleRef.current && isBuilder && titleRef.current.textContent !== title) {
      titleRef.current.textContent = title || ''
    }
  }, [title, isBuilder])
  
  // Handle title update
  const handleTitleUpdate = (e: React.FormEvent<HTMLDivElement>) => {
    if (isBuilder && onUpdate) {
      const target = e.target as HTMLDivElement
      onUpdate({ title: target.textContent || '' })
    }
  }
  
  // Handle description update
  const handleDescriptionUpdate = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isBuilder && onUpdate) {
      onUpdate({ description: e.target.value })
    }
  }
  
  // Handle autosave on blur
  const handleBlur = () => {
    if (isBuilder) {
      autosave.scheduleAutosave()
    }
  }
  
  // Use the passed blockRef if available, otherwise use the internal ref
  const containerRef = blockRef || internalRef;
  
  // In viewer mode, we should ensure the wrapper takes full width
  const isViewer = mode === 'viewer';
  
  // Prepare the content of the slide
  const slideContent = (
    <div className={isViewer ? "w-full" : ""}>
      
      {/* Slide counter with progress indicator */}
      {typeof index === 'number' && typeof totalBlocks === 'number' && (
        <div className="flex items-center mb-5">
          <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-medium">
              {index + 1}
            </span>
            <span>of {totalBlocks}</span>
          </div>
        </div>
      )}
      
      {/* Block title with editing capabilities in builder mode */}
      <div className="block-title">
        {isBuilder ? (
          <div 
            ref={titleRef}
            contentEditable={isBuilder}
            onInput={handleTitleUpdate}
            onBlur={handleBlur}
            className="text-2xl font-bold leading-tight outline-none focus:ring-1 focus:ring-primary/50 pb-1"
          />
        ) : (
          <h2 className="text-2xl font-bold leading-tight">{title}</h2>
        )}
        
        {/* Required label - shown in builder mode or when required */}
        {(isBuilder || required) && (
          <span className="text-red-500 ml-1 text-sm">
            {required ? "*" : ""}
          </span>
        )}
      </div>
      
      {/* Block description with editing capabilities in builder mode */}
      <div className="block-description">
        {isBuilder ? (
          <Textarea
            value={description || ''}
            onChange={handleDescriptionUpdate}
            onBlur={handleBlur}
            className="resize-none text-gray-500 mt-1"
            placeholder="Add a description (optional)"
            rows={2}
          />
        ) : description ? (
          <div className="text-sm text-gray-500 mt-1">{description}</div>
        ) : null}
      </div>
      
      {/* Block content */}
      <div className={cn("mt-4", className)}>
        {children}
      </div>
      
      {/* Next button - shown when onNext callback is provided */}
      {onNext && (
        <div className="mt-6">
          <button
            disabled={isNextDisabled}
            onClick={onNext}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {typeof index === 'number' && typeof totalBlocks === 'number' && index === totalBlocks - 1 ? 'Submit' : 'Next'}
          </button>
        </div>
      )}
    </div>
  )
  
  // Log when the block ref is connected - do this at the component level, not inside wrappedContent 
  useEffect(() => {
    if (containerRef.current && isViewer) {

      
      // Check if the blockRef prop exists and if it's the same as containerRef
      if (blockRef) {

      } else {

      }
    }
  }, [containerRef, blockRef, id, isViewer]); // Fixed dependency array to not include .current property
  
  // Render the appropriate layout based on the slide layout type
  // Wrap all slide layouts in the aspect ratio container when in builder mode
  // Use the existing isViewer variable
  const wrappedContent = (layoutComponent: React.ReactNode) => {
    
    return (
      <div 
        ref={containerRef} 
        data-block-id={id} 
        className={isViewer ? "w-full h-full flex-1" : ""}
      >
        <SlideAspectRatioContainer isBuilder={isBuilder} aspectRatio="16:9">
          {layoutComponent}
        </SlideAspectRatioContainer>
      </div>
    );
  };

  switch (slideLayout.type) {
    case 'media-left':
      return wrappedContent(
        <MediaLeftLayout
          id={id}
          settings={slideLayout}
          onUpdate={onUpdate ? (updates: Partial<{settings: Partial<MediaLeftLayoutType>}>) => 
            onUpdate({ settings: { ...settings, layout: { ...slideLayout, ...(updates.settings || {}) } } }) 
          : undefined}
        >
          {slideContent}
        </MediaLeftLayout>
      )
    
    case 'media-right':
      return wrappedContent(
        <MediaRightLayout
          id={id}
          settings={slideLayout}
          onUpdate={onUpdate ? (updates: Partial<{settings: Partial<MediaRightLayoutType>}>) => 
            onUpdate({ settings: { ...settings, layout: { ...slideLayout, ...(updates.settings || {}) } } }) 
          : undefined}
        >
          {slideContent}
        </MediaRightLayout>
      )
    
    case 'media-background':
      return wrappedContent(
        <MediaBackgroundLayout
          id={id}
          settings={slideLayout}
          onUpdate={onUpdate ? (updates: Partial<{settings: Partial<MediaBackgroundLayoutType>}>) => 
            onUpdate({ settings: { ...settings, layout: { ...slideLayout, ...(updates.settings || {}) } } }) 
          : undefined}
        >
          {slideContent}
        </MediaBackgroundLayout>
      )
    
    case 'media-left-split':
      return wrappedContent(
        <MediaLeftSplitLayout
          id={id}
          settings={slideLayout}
          onUpdate={onUpdate ? (updates: Partial<{settings: Partial<MediaLeftSplitLayoutType>}>) => 
            onUpdate({ settings: { ...settings, layout: { ...slideLayout, ...(updates.settings || {}) } } }) 
          : undefined}
        >
          {slideContent}
        </MediaLeftSplitLayout>
      )
    
    case 'media-right-split':
      return wrappedContent(
        <MediaRightSplitLayout
          id={id}
          settings={slideLayout}
          onUpdate={onUpdate ? (updates: Partial<{settings: Partial<MediaRightSplitLayoutType>}>) => 
            onUpdate({ settings: { ...settings, layout: { ...slideLayout, ...(updates.settings || {}) } } }) 
          : undefined}
        >
          {slideContent}
        </MediaRightSplitLayout>
      )
    
    default:
      return wrappedContent(
        <StandardSlideLayout
          id={id}
          settings={slideLayout}
          onUpdate={onUpdate ? (updates: Partial<{settings: Partial<StandardSlideLayoutType>}>) => 
            onUpdate({ settings: { ...settings, layout: { ...slideLayout, ...(updates.settings || {}) } } }) 
          : undefined}
        >
          {slideContent}
        </StandardSlideLayout>
      )
  }
}
