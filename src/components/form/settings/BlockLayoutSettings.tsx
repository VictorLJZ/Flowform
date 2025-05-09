"use client"

import React from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Removed most unused imports, keeping only what's needed
import { Separator } from "@/components/ui/separator"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import {
  SlideLayout,
  SlideLayoutType,
  MediaLeftLayout,
  MediaBackgroundLayout,
  MediaTopLayout,
  MediaBottomLayout,
  MediaBetweenLayout
} from "@/types/layout-types"
import {
  StandardLayoutIcon,
  MediaLeftLayoutIcon,
  MediaRightLayoutIcon,
  MediaBackgroundLayoutIcon,
  MediaLeftSplitLayoutIcon,
  MediaRightSplitLayoutIcon,
  MediaTopLayoutIcon,
  MediaBottomLayoutIcon,
  MediaBetweenLayoutIcon,
  MobileBackgroundLayoutIcon
} from "@/components/ui/slide-layout-icons"
import { cn } from "@/lib/utils"
import { MediaSelector } from "@/components/form/media/MediaSelector"

interface BlockLayoutSettingsProps {
  blockId: string
  currentLayout?: SlideLayout
}

interface LayoutOptionProps {
  type: SlideLayoutType
  label: string
  icon: React.FC<{ className?: string }>
  isSelected: boolean
  onSelect: (type: SlideLayoutType) => void
}

// Individual layout option with icon
function LayoutOption({ type, label, icon: Icon, isSelected, onSelect }: LayoutOptionProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center p-2 cursor-pointer rounded-md transition-colors",
        isSelected 
          ? "bg-primary/10 border border-primary/30" 
          : "border border-transparent hover:bg-muted"
      )}
      onClick={() => onSelect(type)}
      aria-selected={isSelected}
      role="option"
    >
      <Icon className={cn(
        "w-7 h-7 mb-1",
        isSelected ? "text-primary" : "text-muted-foreground"
      )} />
      <span className={cn(
        "text-xs text-center",
        isSelected ? "font-medium text-primary" : "text-muted-foreground"
      )}>
        {label}
      </span>
    </div>
  )
}

export function BlockLayoutSettings({ blockId, currentLayout }: BlockLayoutSettingsProps) {
  const { updateBlockLayout, viewportMode, getEffectiveLayout } = useFormBuilderStore()
  
  // Get layouts for both desktop and mobile modes
  const desktopLayout = getEffectiveLayout(blockId, 'desktop') || { type: 'standard' }
  const mobileLayout = getEffectiveLayout(blockId, 'mobile') || { type: 'standard' }
  
  // Get the types for both layouts
  const desktopLayoutType: SlideLayoutType = desktopLayout.type || 'standard'
  const mobileLayoutType: SlideLayoutType = mobileLayout.type || 'standard'
  
  // Handle layout type change for desktop
  const handleDesktopLayoutChange = (type: SlideLayoutType) => {
    updateBlockLayout(blockId, { type }, 'desktop')
  }
  
  // Handle layout type change for mobile
  const handleMobileLayoutChange = (type: SlideLayoutType) => {
    updateBlockLayout(blockId, { type }, 'mobile')
  }
  
  // Define options for desktop and mobile layouts
  const desktopLayoutOptions: Array<{ type: SlideLayoutType; label: string; icon: React.FC<{ className?: string }> }> = [
    { type: 'standard', label: 'Standard', icon: StandardLayoutIcon },
    { type: 'media-right', label: 'Media Right', icon: MediaRightLayoutIcon },
    { type: 'media-left', label: 'Media Left', icon: MediaLeftLayoutIcon },
    { type: 'media-right-split', label: 'Split Right', icon: MediaRightSplitLayoutIcon },
    { type: 'media-left-split', label: 'Split Left', icon: MediaLeftSplitLayoutIcon },
    { type: 'media-background', label: 'Background', icon: MediaBackgroundLayoutIcon },
  ]
  
  const mobileLayoutOptions: Array<{ type: SlideLayoutType; label: string; icon: React.FC<{ className?: string }> }> = [
    { type: 'standard', label: 'Standard', icon: StandardLayoutIcon },
    { type: 'media-top', label: 'Media Top', icon: MediaTopLayoutIcon },
    { type: 'media-bottom', label: 'Media Bottom', icon: MediaBottomLayoutIcon },
    { type: 'media-between', label: 'Media Between', icon: MediaBetweenLayoutIcon },
    { type: 'media-background', label: 'Background', icon: MobileBackgroundLayoutIcon },
  ]
  
  return (
    <div className="space-y-6">
      {/* Desktop Layout Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label>Desktop Layout</Label>
          <div className="text-xs flex items-center gap-2 bg-muted/50 rounded-md px-2 py-1">
            <span className={cn(
              "text-xs",
              viewportMode === 'desktop' ? "text-primary font-medium" : "text-muted-foreground"
            )}>Desktop View</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {desktopLayoutOptions.map((option) => (
            <LayoutOption
              key={`desktop-${option.type}`}
              type={option.type}
              label={option.label}
              icon={option.icon}
              isSelected={desktopLayoutType === option.type}
              onSelect={handleDesktopLayoutChange}
            />
          ))}
        </div>
        
        {/* Desktop layout specific settings */}
        {(desktopLayoutType === 'media-left' || desktopLayoutType === 'media-right') && (
          <MediaPositionSettings 
            blockId={blockId} 
            currentLayout={desktopLayout} 
          />
        )}
        
        {desktopLayoutType === 'media-background' && (
          <MediaBackgroundSettings 
            blockId={blockId} 
            currentLayout={desktopLayout} 
          />
        )}
        
        {/* Common media settings for desktop */}
        {desktopLayoutType !== 'standard' && (
          <MediaSettings
            blockId={blockId}
            currentLayout={desktopLayout}
          />
        )}
      </div>
      
      <Separator />
      
      {/* Mobile Layout Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label>Mobile Layout</Label>
          <div className="text-xs flex items-center gap-2 bg-muted/50 rounded-md px-2 py-1">
            <span className={cn(
              "text-xs",
              viewportMode === 'mobile' ? "text-primary font-medium" : "text-muted-foreground"
            )}>Mobile View</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {mobileLayoutOptions.map((option) => (
            <LayoutOption
              key={`mobile-${option.type}`}
              type={option.type}
              label={option.label}
              icon={option.icon}
              isSelected={mobileLayoutType === option.type}
              onSelect={handleMobileLayoutChange}
            />
          ))}
        </div>
        
        {/* Mobile layout specific settings */}
        {(mobileLayoutType === 'media-top' || mobileLayoutType === 'media-bottom' || mobileLayoutType === 'media-between') && (
          <MediaMobilePositionSettings
            blockId={blockId}
            currentLayout={mobileLayout}
          />
        )}
        
        {mobileLayoutType === 'media-background' && (
          <MediaBackgroundSettings 
            blockId={blockId} 
            currentLayout={mobileLayout} 
          />
        )}
        
        {/* Common media settings for mobile */}
        {mobileLayoutType !== 'standard' && (
          <MediaSettings
            blockId={blockId}
            currentLayout={mobileLayout}
          />
        )}
      </div>
    </div>
  )
}

interface MediaPositionSettingsProps {
  blockId: string
  currentLayout?: SlideLayout
}

// Settings for media-left and media-right layouts
export function MediaPositionSettings({ blockId, currentLayout }: MediaPositionSettingsProps) {
  const { updateBlockLayout } = useFormBuilderStore()
  
  // Extract media-specific settings
  const isMediaLayout = 
    currentLayout?.type === 'media-left' || 
    currentLayout?.type === 'media-right';
    
  if (!isMediaLayout) return null;
  
  // Get settings or use defaults
  const mediaProportion = (currentLayout as MediaLeftLayout)?.mediaProportion || 0.4;
  const textAlignment = (currentLayout as MediaLeftLayout)?.textAlignment || 'left';
  const spacing = (currentLayout as MediaLeftLayout)?.spacing || 'normal';
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="media-proportion">Media Size</Label>
        <Select
          value={mediaProportion.toString()}
          onValueChange={(value) => updateBlockLayout(blockId, { mediaProportion: parseFloat(value) })}
        >
          <SelectTrigger id="media-proportion">
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.3">Small (30%)</SelectItem>
            <SelectItem value="0.4">Medium (40%)</SelectItem>
            <SelectItem value="0.5">Half (50%)</SelectItem>
            <SelectItem value="0.6">Large (60%)</SelectItem>
            <SelectItem value="0.7">Extra Large (70%)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="text-alignment">Text Alignment</Label>
        <Select
          value={textAlignment}
          onValueChange={(value) => updateBlockLayout(blockId, { textAlignment: value as 'left' | 'center' | 'right' })}
        >
          <SelectTrigger id="text-alignment">
            <SelectValue placeholder="Select alignment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="spacing">Spacing</Label>
        <Select
          value={spacing}
          onValueChange={(value) => updateBlockLayout(blockId, { spacing: value as 'compact' | 'normal' | 'spacious' })}
        >
          <SelectTrigger id="spacing">
            <SelectValue placeholder="Select spacing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="compact">Compact</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="spacious">Spacious</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

interface MediaBackgroundSettingsProps {
  blockId: string
  currentLayout?: SlideLayout
}

// Settings for media-background layout
export function MediaBackgroundSettings({ blockId, currentLayout }: MediaBackgroundSettingsProps) {
  const { updateBlockLayout } = useFormBuilderStore()
  
  // Extract media-background specific settings
  const isMediaBgLayout = currentLayout?.type === 'media-background';
  if (!isMediaBgLayout) return null;
  
  // Get settings or use defaults
  const overlayColor = (currentLayout as MediaBackgroundLayout)?.overlayColor || '#000000';
  const overlayOpacity = (currentLayout as MediaBackgroundLayout)?.overlayOpacity || 50;
  const contentPosition = (currentLayout as MediaBackgroundLayout)?.contentPosition || 'center';
  const textAlignment = (currentLayout as MediaBackgroundLayout)?.textAlignment || 'center';
  const textColor = (currentLayout as MediaBackgroundLayout)?.textColor || 'light';
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="overlay-color">Overlay Color</Label>
        <div className="flex gap-2">
          <input 
            type="color" 
            value={overlayColor} 
            onChange={(e) => updateBlockLayout(blockId, { overlayColor: e.target.value })}
            className="h-9 w-9 rounded-md border"
          />
          <input 
            type="text" 
            value={overlayColor} 
            onChange={(e) => updateBlockLayout(blockId, { overlayColor: e.target.value })}
            className="flex-1 h-9 px-3 rounded-md border"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="overlay-opacity">
          Overlay Opacity: {overlayOpacity}%
        </Label>
        <input
          type="range"
          min="0"
          max="100"
          value={overlayOpacity}
          onChange={(e) => updateBlockLayout(blockId, { overlayOpacity: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="content-position">Content Position</Label>
        <Select
          value={contentPosition}
          onValueChange={(value) => updateBlockLayout(blockId, { contentPosition: value as 'top' | 'center' | 'bottom' })}
        >
          <SelectTrigger id="content-position">
            <SelectValue placeholder="Select position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="top">Top</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="bottom">Bottom</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="text-alignment">Text Alignment</Label>
        <Select
          value={textAlignment}
          onValueChange={(value) => updateBlockLayout(blockId, { textAlignment: value as 'left' | 'center' | 'right' })}
        >
          <SelectTrigger id="text-alignment">
            <SelectValue placeholder="Select alignment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="text-color">Text Color</Label>
        <Select
          value={textColor}
          onValueChange={(value) => updateBlockLayout(blockId, { textColor: value as 'light' | 'dark' })}
        >
          <SelectTrigger id="text-color">
            <SelectValue placeholder="Select color scheme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light (for dark backgrounds)</SelectItem>
            <SelectItem value="dark">Dark (for light backgrounds)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

interface MediaMobilePositionSettingsProps {
  blockId: string
  currentLayout?: SlideLayout
}

// Settings for mobile layouts (media-top, media-bottom, media-between)
export function MediaMobilePositionSettings({ blockId, currentLayout }: MediaMobilePositionSettingsProps) {
  const { updateBlockLayout } = useFormBuilderStore()
  
  // Skip if not a mobile media layout
  if (!currentLayout || 
      (currentLayout.type !== 'media-top' && 
       currentLayout.type !== 'media-bottom' && 
       currentLayout.type !== 'media-between')) {
    return null
  }
  
  // Get settings or use defaults based on the type
  const mediaProportion = (() => {
    if (currentLayout.type === 'media-top') {
      return (currentLayout as MediaTopLayout).mediaProportion || 0.4
    } else if (currentLayout.type === 'media-bottom') {
      return (currentLayout as MediaBottomLayout).mediaProportion || 0.4
    } else { // media-between
      return (currentLayout as MediaBetweenLayout).mediaProportion || 0.3
    }
  })()
  
  const textAlignment = (() => {
    if (currentLayout.type === 'media-top') {
      return (currentLayout as MediaTopLayout).textAlignment || 'center'
    } else if (currentLayout.type === 'media-bottom') {
      return (currentLayout as MediaBottomLayout).textAlignment || 'center'
    } else { // media-between
      return (currentLayout as MediaBetweenLayout).textAlignment || 'center'
    }
  })()
  
  const spacing = (() => {
    if (currentLayout.type === 'media-top') {
      return (currentLayout as MediaTopLayout).spacing || 'normal'
    } else if (currentLayout.type === 'media-bottom') {
      return (currentLayout as MediaBottomLayout).spacing || 'normal'
    } else { // media-between
      return (currentLayout as MediaBetweenLayout).spacing || 'normal'
    }
  })()
  
  return (
    <div className="space-y-4">
      <Separator />
      <div className="space-y-2">
        <Label>Layout Settings</Label>
        
        <div className="space-y-2">
          <Label htmlFor="media-proportion">
            Media Size: {Math.round(mediaProportion * 100)}%
          </Label>
          <input
            type="range"
            min="0.2"
            max="0.7"
            step="0.05"
            value={mediaProportion}
            onChange={(e) => updateBlockLayout(blockId, { mediaProportion: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="text-alignment">Text Alignment</Label>
          <Select
            value={textAlignment}
            onValueChange={(value) => updateBlockLayout(blockId, { textAlignment: value as 'left' | 'center' | 'right' })}
          >
            <SelectTrigger id="text-alignment">
              <SelectValue placeholder="Select alignment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="spacing">Content Spacing</Label>
          <Select
            value={spacing}
            onValueChange={(value) => updateBlockLayout(blockId, { spacing: value as 'compact' | 'normal' | 'spacious' })}
          >
            <SelectTrigger id="spacing">
              <SelectValue placeholder="Select spacing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="spacious">Spacious</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

interface MediaSettingsProps {
  blockId: string
  currentLayout?: SlideLayout
}

// Shared media settings for all layouts with media
export function MediaSettings({ blockId, currentLayout }: MediaSettingsProps) {
  const { updateBlockLayout } = useFormBuilderStore()
  
  // Check if this is a media layout
  const isMediaLayout = 
    currentLayout?.type === 'media-left' || 
    currentLayout?.type === 'media-right' ||
    currentLayout?.type === 'media-background' ||
    currentLayout?.type === 'media-left-split' ||
    currentLayout?.type === 'media-right-split' ||
    currentLayout?.type === 'media-top' ||
    currentLayout?.type === 'media-bottom' ||
    currentLayout?.type === 'media-between';
  
  if (!isMediaLayout) return null;
  
  // Get settings or use defaults
  // Use a type assertion to MediaLeftLayout which extends MediaConfig
  const mediaId = (currentLayout as MediaLeftLayout)?.mediaId || '';
  const sizingMode = (currentLayout as MediaLeftLayout)?.sizingMode || 'cover';
  const opacity = (currentLayout as MediaLeftLayout)?.opacity || 100;
  
  // Handle media selection
  const handleMediaSelect = (selectedMediaId: string) => {
    updateBlockLayout(blockId, { mediaId: selectedMediaId });
  };
  
  return (
    <div className="space-y-4">
      <Separator />
      <div className="space-y-2">
        <Label>Media</Label>
        
        {/* Media selector */}
        <div className="mt-2">
          <MediaSelector 
            selectedMediaId={mediaId} 
            onSelect={handleMediaSelect}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="sizing-mode">Sizing Mode</Label>
        <Select
          value={sizingMode}
          onValueChange={(value) => updateBlockLayout(blockId, { sizingMode: value as 'contain' | 'cover' | 'fill' })}
        >
          <SelectTrigger id="sizing-mode">
            <SelectValue placeholder="Select sizing mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="contain">Contain</SelectItem>
            <SelectItem value="cover">Cover</SelectItem>
            <SelectItem value="fill">Fill</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="media-opacity">
          Media Opacity: {opacity}%
        </Label>
        <input
          type="range"
          min="0"
          max="100"
          value={opacity}
          onChange={(e) => updateBlockLayout(blockId, { opacity: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  )
}
