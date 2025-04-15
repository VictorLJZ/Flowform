"use client"

import React from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { BlockLayout, LayoutType } from "@/types/layout-types"

interface BlockLayoutSettingsProps {
  blockId: string
  currentLayout?: BlockLayout
}

export function BlockLayoutSettings({ blockId, currentLayout }: BlockLayoutSettingsProps) {
  const { updateBlockLayout } = useFormBuilderStore()
  
  // Default to standard layout if none is set
  const layoutType: LayoutType = currentLayout?.type || 'standard'
  
  // Handle layout type change
  const handleLayoutTypeChange = (type: LayoutType) => {
    updateBlockLayout(blockId, { type })
  }
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="layout-type">Layout Type</Label>
        <Select
          value={layoutType}
          onValueChange={(value) => handleLayoutTypeChange(value as LayoutType)}
        >
          <SelectTrigger id="layout-type">
            <SelectValue placeholder="Select a layout" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard Layout</SelectItem>
            <SelectItem value="grid">Grid Layout</SelectItem>
            <SelectItem value="card">Card Layout</SelectItem>
            <SelectItem value="section">Section Layout</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Layout specific settings */}
      {layoutType === 'grid' && (
        <div className="mt-6">
          <GridLayoutSettings 
            blockId={blockId} 
            currentLayout={currentLayout} 
          />
        </div>
      )}
      
      {layoutType === 'card' && (
        <div className="mt-6">
          <CardLayoutSettings 
            blockId={blockId} 
            currentLayout={currentLayout} 
          />
        </div>
      )}
      
      {layoutType === 'section' && (
        <div className="mt-6">
          <SectionLayoutSettings 
            blockId={blockId} 
            currentLayout={currentLayout} 
          />
        </div>
      )}
    </div>
  )
}

interface GridLayoutSettingsProps {
  blockId: string
  currentLayout?: BlockLayout
}

export function GridLayoutSettings({ blockId, currentLayout }: GridLayoutSettingsProps) {
  const { updateBlockLayout } = useFormBuilderStore()
  
  // Extract grid-specific settings
  const gridLayout = currentLayout?.type === 'grid' ? currentLayout : undefined
  const columns = gridLayout?.columns || 2
  const gapX = gridLayout?.gapX || 'medium'
  const gapY = gridLayout?.gapY || 'medium'
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Columns</Label>
        <RadioGroup 
          value={columns.toString()} 
          onValueChange={(value) => updateBlockLayout(blockId, { columns: parseInt(value) as 1 | 2 | 3 | 4 })}
          className="flex space-x-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="1" id="columns-1" />
            <Label htmlFor="columns-1">1</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="2" id="columns-2" />
            <Label htmlFor="columns-2">2</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="3" id="columns-3" />
            <Label htmlFor="columns-3">3</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="4" id="columns-4" />
            <Label htmlFor="columns-4">4</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="gap-x">Horizontal Spacing</Label>
        <Select
          value={gapX}
          onValueChange={(value) => updateBlockLayout(blockId, { gapX: value as 'none' | 'small' | 'medium' | 'large' })}
        >
          <SelectTrigger id="gap-x">
            <SelectValue placeholder="Select spacing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="gap-y">Vertical Spacing</Label>
        <Select
          value={gapY}
          onValueChange={(value) => updateBlockLayout(blockId, { gapY: value as 'none' | 'small' | 'medium' | 'large' })}
        >
          <SelectTrigger id="gap-y">
            <SelectValue placeholder="Select spacing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

interface CardLayoutSettingsProps {
  blockId: string
  currentLayout?: BlockLayout
}

export function CardLayoutSettings({ blockId, currentLayout }: CardLayoutSettingsProps) {
  const { updateBlockLayout } = useFormBuilderStore()
  
  // Extract card-specific settings
  const cardLayout = currentLayout?.type === 'card' ? currentLayout : undefined
  const shadow = cardLayout?.shadow || 'sm'
  const border = cardLayout?.border !== false
  const padding = cardLayout?.padding || 'md'
  const rounded = cardLayout?.rounded || 'md'
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="shadow">Shadow</Label>
        <Select
          value={shadow}
          onValueChange={(value) => updateBlockLayout(blockId, { shadow: value as 'none' | 'sm' | 'md' | 'lg' })}
        >
          <SelectTrigger id="shadow">
            <SelectValue placeholder="Select shadow" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="sm">Small</SelectItem>
            <SelectItem value="md">Medium</SelectItem>
            <SelectItem value="lg">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          checked={border}
          onCheckedChange={(checked) => updateBlockLayout(blockId, { border: checked })}
          id="border"
        />
        <Label htmlFor="border">Show Border</Label>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="padding">Padding</Label>
        <Select
          value={padding}
          onValueChange={(value) => updateBlockLayout(blockId, { padding: value as 'none' | 'sm' | 'md' | 'lg' })}
        >
          <SelectTrigger id="padding">
            <SelectValue placeholder="Select padding" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="sm">Small</SelectItem>
            <SelectItem value="md">Medium</SelectItem>
            <SelectItem value="lg">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="rounded">Corner Radius</Label>
        <Select
          value={rounded}
          onValueChange={(value) => updateBlockLayout(blockId, { rounded: value as 'none' | 'sm' | 'md' | 'lg' })}
        >
          <SelectTrigger id="rounded">
            <SelectValue placeholder="Select radius" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="sm">Small</SelectItem>
            <SelectItem value="md">Medium</SelectItem>
            <SelectItem value="lg">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

interface SectionLayoutSettingsProps {
  blockId: string
  currentLayout?: BlockLayout
}

export function SectionLayoutSettings({ blockId, currentLayout }: SectionLayoutSettingsProps) {
  const { updateBlockLayout } = useFormBuilderStore()
  
  // Extract section-specific settings
  const sectionLayout = currentLayout?.type === 'section' ? currentLayout : undefined
  const titleSize = sectionLayout?.titleSize || 'medium'
  const separator = sectionLayout?.separator !== false
  const spacing = sectionLayout?.spacing || 'normal'
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title-size">Title Size</Label>
        <Select
          value={titleSize}
          onValueChange={(value) => updateBlockLayout(blockId, { titleSize: value as 'small' | 'medium' | 'large' })}
        >
          <SelectTrigger id="title-size">
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          checked={separator}
          onCheckedChange={(checked) => updateBlockLayout(blockId, { separator: checked })}
          id="separator"
        />
        <Label htmlFor="separator">Show Separator</Label>
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
