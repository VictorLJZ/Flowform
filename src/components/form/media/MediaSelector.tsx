"use client"

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MediaBrowser } from './MediaBrowser'
import { MediaUploadWidget } from './MediaUploadWidget'

interface MediaSelectorProps {
  selectedMediaId?: string
  onSelect: (mediaId: string) => void
}

export function MediaSelector({ selectedMediaId, onSelect }: MediaSelectorProps) {
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="library">Media Library</TabsTrigger>
          <TabsTrigger value="upload">Add New</TabsTrigger>
        </TabsList>
        
        <TabsContent value="library" className="pt-4">
          <MediaBrowser onSelect={onSelect} selectedMediaId={selectedMediaId} />
        </TabsContent>
        
        <TabsContent value="upload" className="pt-4 space-y-4">
          <MediaUploadWidget onSelect={onSelect} />
          
          <div className="text-xs text-muted-foreground">
            <p>Supported formats: PNG, JPG, GIF, MP4, WEBM</p>
            <p>Max file size: 10MB</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
