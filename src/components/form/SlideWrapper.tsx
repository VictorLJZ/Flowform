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
  MediaRightSplitLayout as MediaRightSplitLayoutType,
  MediaTopLayout as MediaTopLayoutType,
  MediaBottomLayout as MediaBottomLayoutType,
  MediaBetweenLayout as MediaBetweenLayoutType
} from "@/types/layout-types"
import { SlideAspectRatioContainer } from "./SlideAspectRatioContainer"
import { StandardSlideLayout } from "./slide-layouts/StandardSlideLayout"
import { MediaLeftLayout } from "./slide-layouts/MediaLeftLayout"
import { MediaRightLayout } from "./slide-layouts/MediaRightLayout"
import { MediaBackgroundLayout } from "./slide-layouts/MediaBackgroundLayout"
import { MediaLeftSplitLayout } from "./slide-layouts/MediaLeftSplitLayout"
import { MediaRightSplitLayout } from "./slide-layouts/MediaRightSplitLayout"
import { MediaTopLayout } from "./slide-layouts/MediaTopLayout"
import { MediaBottomLayout } from "./slide-layouts/MediaBottomLayout"
import { MediaBetweenLayout } from "./slide-layouts/MediaBetweenLayout"
import type { UiBlock } from "@/types/block/UiBlock"; // Import UiBlock type

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
  onUpdate?: (updates: Partial<UiBlock>) => void
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
  // Get viewport mode from store
  const viewportMode = useFormBuilderStore(state => state.viewportMode);
  // Extract stable primitive values for dependency arrays
  const viewportModeValue = viewportMode; // This creates a stable string primitive
  const titleRef = useRef<HTMLDivElement>(null)
  const internalRef = useRef<HTMLDivElement>(null)
  const { mode } = useFormBuilderStore()
  const autosave = useAutosave()
  
  // Get block presentation from settings - using default if not provided
  settings.presentation = settings?.presentation || { layout: 'left', spacing: 'normal', titleSize: 'medium' }
  
  // Get the appropriate layout for the current viewport mode using the getEffectiveLayout helper
  const { getEffectiveLayout } = useFormBuilderStore()
  
  // Get layout specific to the current viewport mode, falling back to the legacy layout or standard layout
  const slideLayout = getEffectiveLayout(id, viewportMode) || settings?.layout || { type: 'standard' }
  
  // Extract the layout type to use in dependencies (stable primitive value instead of object reference)
  const layoutType = slideLayout.type
  
  // Determine if we're in builder mode
  const isBuilder = mode === 'builder'
  
  // Debug the mode and onNext props
  useEffect(() => {

  }, [mode, isBuilder, onNext])
  
  // Primary effect to update title on initial render and when title changes
  useEffect(() => {
    if (titleRef.current && isBuilder && title) {
      titleRef.current.textContent = title
    }
  }, [title, isBuilder])
  
  // Layout-specific effect - runs only when layout changes
  useEffect(() => {
    if (titleRef.current && isBuilder && title) {
      // Force title update when layout changes by using a RAF
      requestAnimationFrame(() => {
        if (titleRef.current) {
          titleRef.current.textContent = title
        }
      })
    }
  }, [layoutType, isBuilder, title])
  
  // Viewport-specific effect - runs only when viewport changes
  useEffect(() => {
    if (titleRef.current && isBuilder && title) {
      // Force title update when viewport changes
      const current = titleRef.current
      // Use setTimeout to ensure DOM update happens after React rendering
      setTimeout(() => {
        if (current && document.contains(current)) {
          current.textContent = title
        }
      }, 0)
    }
  }, [viewportModeValue, isBuilder, title])
  
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
    <div className={cn(
      "w-full", 
      isViewer ? "" : "transition-all duration-200" // Add transition for smoother layout changes
    )}>
      
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
      <div className="block-title mb-4 flex items-start">
        {isBuilder ? (
          <div className="flex items-start">
            <div 
              ref={titleRef}
              contentEditable={isBuilder}
              onInput={handleTitleUpdate}
              onBlur={handleBlur}
              className="text-2xl font-bold leading-tight outline-none focus:outline-none pb-1 transition-all duration-200"
              data-layout-type={layoutType}
              data-viewmode={viewportMode}
            />
            {/* Required asterisk placed directly next to the editable content */}
            {required && (
              <span className="text-black ml-1 text-2xl font-bold leading-tight">
                *
              </span>
            )}
          </div>
        ) : (
          <h2 className="text-2xl font-bold leading-tight flex items-start">
            {title}
            {required && <span className="text-black ml-1">*</span>}
          </h2>
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
  // Use the existing isViewer variable and pass viewport mode
  const wrappedContent = (layoutComponent: React.ReactNode) => {
    
    return (
      <div 
        ref={containerRef} 
        data-block-id={id} 
        className={isViewer ? "w-full h-full flex-1" : ""}
      >
        <SlideAspectRatioContainer 
          isBuilder={isBuilder} 
          aspectRatio="16:9"
          viewportMode={viewportMode}
        >
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
      
    // Mobile-specific layouts
    case 'media-top':
      return wrappedContent(
        <MediaTopLayout
          id={id}
          settings={slideLayout}
          onUpdate={onUpdate ? (updates: Partial<{settings: Partial<MediaTopLayoutType>}>) => 
            onUpdate({ settings: { ...settings, layout: { ...slideLayout, ...(updates.settings || {}) } } }) 
          : undefined}
        >
          {slideContent}
        </MediaTopLayout>
      )
      
    case 'media-bottom':
      return wrappedContent(
        <MediaBottomLayout
          id={id}
          settings={slideLayout}
          onUpdate={onUpdate ? (updates: Partial<{settings: Partial<MediaBottomLayoutType>}>) => 
            onUpdate({ settings: { ...settings, layout: { ...slideLayout, ...(updates.settings || {}) } } }) 
          : undefined}
        >
          {slideContent}
        </MediaBottomLayout>
      )
      
    case 'media-between':
      return wrappedContent(
        <MediaBetweenLayout
          id={id}
          settings={slideLayout}
          onUpdate={onUpdate ? (updates: Partial<{settings: Partial<MediaBetweenLayoutType>}>) => 
            onUpdate({ settings: { ...settings, layout: { ...slideLayout, ...(updates.settings || {}) } } }) 
          : undefined}
        >
          {slideContent}
        </MediaBetweenLayout>
      )
    
    default:
      return wrappedContent(
        <StandardSlideLayout
          id={id}
          settings={slideLayout as StandardSlideLayoutType}
          onUpdate={onUpdate ? (updates: Partial<{settings: Partial<StandardSlideLayoutType>}>) => 
            onUpdate({ settings: { ...settings, layout: { ...slideLayout, ...(updates.settings || {}) } } }) 
          : undefined}
        >
          {slideContent}
        </StandardSlideLayout>
      )
  }
}
