"use client"

import React, { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { MediaBetweenLayout as MediaBetweenLayoutType } from "@/types/layout-types"
import { MediaRenderer } from '@/components/form/media/MediaRenderer'

interface MediaBetweenLayoutProps {
  id: string
  children: ReactNode
  mediaProportion?: number
  textAlignment?: 'left' | 'center' | 'right'
  spacing?: 'compact' | 'normal' | 'spacious'
  mediaId?: string
  sizingMode?: 'contain' | 'cover' | 'fill'
  opacity?: number
  className?: string
  settings?: Partial<MediaBetweenLayoutType>
  onUpdate?: (updates: Partial<{
    settings: Partial<MediaBetweenLayoutType>
  }>) => void
}

export function MediaBetweenLayout({
  children,
  textAlignment = 'center',
  spacing = 'normal',
  mediaId,
  sizingMode = 'cover',
  opacity = 100,
  className,
  settings,
  id // Add id to props to help with debugging
}: MediaBetweenLayoutProps) {
  const { mode } = useFormBuilderStore();
  
  // Determine if we're in builder mode
  const isBuilder = mode === 'builder'
  
  // Use settings if provided, otherwise use props
  const effectiveMediaProportion = settings?.mediaProportion || 0.3 // Default 30% height for media
  const effectiveTextAlignment = settings?.textAlignment || textAlignment
  const effectiveSpacing = settings?.spacing || spacing
  const effectiveMediaId = settings?.mediaId || mediaId
  const effectiveSizingMode = settings?.sizingMode || sizingMode
  const effectiveOpacity = settings?.opacity || opacity
  
  // Spacing classes
  const spacingClasses = {
    'compact': 'space-y-2',
    'normal': 'space-y-4',
    'spacious': 'space-y-8',
  }
  
  // Alignment classes
  const alignmentClasses = {
    'left': 'text-left',
    'center': 'text-center',
    'right': 'text-right',
  }
  
  // Media element using MediaRenderer component
  const mediaElement = (
    <MediaRenderer
      mediaId={effectiveMediaId}
      sizingMode={effectiveSizingMode}
      opacity={effectiveOpacity}
    />
  )
  
  // Calculate the heights for all sections
  const mediaHeightPercentage = Math.round(effectiveMediaProportion * 100)
  const contentHeightPercentage = Math.round((100 - mediaHeightPercentage) / 2)
  
  // Instead of trying to split the children passed to us, we'll identify categories by className pattern
  const extractChildrenByClassName = (classNamePattern: string): React.ReactNode[] => {
    // Safely check if children is a valid React element
    if (!React.isValidElement(children)) {
      return [];
    }

    // Type assertion to access props.children safely
    const childProps = children.props as {children?: React.ReactNode};
    if (!childProps.children) return [];

    // Get the children of the main wrapper div (if it exists)
    const wrapperChildren = React.Children.toArray(childProps.children);

    // Find elements with matching className
    return wrapperChildren.filter(child => {
      if (!React.isValidElement(child)) return false;
      
      // Type guard to check if child.props.className exists
      const props = child.props as {className?: string};
      return typeof props.className === 'string' && props.className.includes(classNamePattern);
    });
  };

  // Extract all elements based on class names or characteristics
  // First, try to find the counter that has 'mb-5' class
  const counterElements = extractChildrenByClassName('mb-5'); // The counter has mb-5 class
  const titleElements = extractChildrenByClassName('block-title');
  const descriptionElements = extractChildrenByClassName('block-description');
  const formElements = extractChildrenByClassName('mt-4'); // Form content has mt-4 class
  const buttonElements = extractChildrenByClassName('mt-6'); // Next button has mt-6 class
  
  return (
    <div 
      className={cn(
        "w-full h-full flex items-center justify-center", // Center everything in the view
        className
      )}
    >
      {/* Main content container */}
      <div className="w-full max-w-2xl px-6 py-8">
        <div className={cn(
          "w-full flex flex-col",
          alignmentClasses[effectiveTextAlignment],
          spacingClasses[effectiveSpacing],
          "text-left space-y-4"  // Consistent base styling
        )}>
          {/* Progress counter - "1 of 1" */}
          {counterElements}
          
          {/* Title elements */}
          {titleElements}
          
          {/* Description elements */}
          {descriptionElements}
          
          {/* Media section - integrated between description and form */}
          <div 
            className="w-full relative overflow-hidden my-4" // Added margin for spacing
            style={{ height: `${Math.max(150, 30 * effectiveMediaProportion * 10)}px` }} // Dynamic height but with minimum
          >
            {mediaElement}
          </div>
          
          {/* Form content */}
          {formElements}
          
          {/* Next button */}
          {buttonElements}
        </div>
      </div>
    </div>
  )
}
