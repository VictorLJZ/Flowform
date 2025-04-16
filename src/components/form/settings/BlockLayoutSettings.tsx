"use client"

import React from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { SlideLayout, SlideLayoutType } from "@/types/layout-types"
import {
  StandardLayoutIcon,
  MediaLeftLayoutIcon,
  MediaRightLayoutIcon,
  MediaBackgroundLayoutIcon,
  MediaLeftSplitLayoutIcon,
  MediaRightSplitLayoutIcon
} from "@/components/ui/slide-layout-icons"
import { cn } from "@/lib/utils"

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
  const { updateBlockLayout } = useFormBuilderStore()
  
  // Default to standard layout if none is set
  const layoutType: SlideLayoutType = currentLayout?.type || 'standard'
  
  // Handle layout type change
  const handleLayoutTypeChange = (type: SlideLayoutType) => {
    updateBlockLayout(blockId, { type })
  }
  
  // Layout options with their icons
  const layoutOptions: Array<{ type: SlideLayoutType; label: string; icon: React.FC<{ className?: string }> }> = [
    { type: 'standard', label: 'Standard', icon: StandardLayoutIcon },
    { type: 'media-right', label: 'Media Right', icon: MediaRightLayoutIcon },
    { type: 'media-left', label: 'Media Left', icon: MediaLeftLayoutIcon },
    { type: 'media-right-split', label: 'Split Right', icon: MediaRightSplitLayoutIcon },
    { type: 'media-left-split', label: 'Split Left', icon: MediaLeftSplitLayoutIcon },
    { type: 'media-background', label: 'Background', icon: MediaBackgroundLayoutIcon },
  ]
  
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Slide Layout</Label>
        <div className="grid grid-cols-3 gap-2">
          {layoutOptions.map((option) => (
            <LayoutOption
              key={option.type}
              type={option.type}
              label={option.label}
              icon={option.icon}
              isSelected={layoutType === option.type}
              onSelect={handleLayoutTypeChange}
            />
          ))}
        </div>
      </div>
      
      {/* Layout specific settings based on selected layout type */}
      {layoutType === 'media-left' || layoutType === 'media-right' ? (
        <MediaPositionSettings 
          blockId={blockId} 
          currentLayout={currentLayout} 
        />
      ) : layoutType === 'media-background' ? (
        <MediaBackgroundSettings 
          blockId={blockId} 
          currentLayout={currentLayout} 
        />
      ) : null}
      
      {/* Common settings for all layouts with media */}
      {layoutType !== 'standard' && (
        <MediaSettings
          blockId={blockId}
          currentLayout={currentLayout}
        />
      )}
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
  const mediaProportion = (currentLayout as any)?.mediaProportion || 0.4;
  const textAlignment = (currentLayout as any)?.textAlignment || 'left';
  const spacing = (currentLayout as any)?.spacing || 'normal';
  
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
  const overlayColor = (currentLayout as any)?.overlayColor || '#000000';
  const overlayOpacity = (currentLayout as any)?.overlayOpacity || 50;
  const contentPosition = (currentLayout as any)?.contentPosition || 'center';
  const textAlignment = (currentLayout as any)?.textAlignment || 'center';
  const textColor = (currentLayout as any)?.textColor || 'light';
  
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

interface MediaSettingsProps {
  blockId: string
  currentLayout?: SlideLayout
}

// Shared media settings for all media layouts
export function MediaSettings({ blockId, currentLayout }: MediaSettingsProps) {
  const { updateBlockLayout } = useFormBuilderStore()
  
  // Check if this is a media layout
  const isMediaLayout = 
    currentLayout?.type === 'media-left' || 
    currentLayout?.type === 'media-right' ||
    currentLayout?.type === 'media-background' ||
    currentLayout?.type === 'media-left-split' ||
    currentLayout?.type === 'media-right-split';
  
  if (!isMediaLayout) return null;
  
  // Get settings or use defaults
  const mediaId = (currentLayout as any)?.mediaId || '';
  const sizingMode = (currentLayout as any)?.sizingMode || 'cover';
  const opacity = (currentLayout as any)?.opacity || 100;
  
  return (
    <div className="space-y-4">
      <Separator />
      <div className="space-y-2">
        <Label>Media Settings</Label>
        
        {/* We'll add an actual media selector later */}
        <div className="p-4 border border-dashed rounded-md bg-muted/50 text-center">
          <span className="text-sm text-muted-foreground">
            {mediaId ? 'Media: ' + mediaId : 'Click to add media'}
          </span>
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
