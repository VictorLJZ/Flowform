"use client"

import React, { useEffect } from 'react'
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { Check, ImageIcon, VideoIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCloudinaryUrl } from '@/lib/cloudinary-client'
import { MediaItemMenu } from './MediaItemMenu'

interface MediaBrowserProps {
  onSelect: (mediaId: string) => void
  selectedMediaId?: string
}

export function MediaBrowser({ onSelect, selectedMediaId }: MediaBrowserProps) {
  const { mediaAssets, loadMediaAssets, isLoadingMedia } = useFormBuilderStore()
  const currentWorkspaceId = useWorkspaceStore(state => state.currentWorkspaceId)
  
  // Load media assets when component mounts or workspace changes
  useEffect(() => {
    if (currentWorkspaceId) {
      loadMediaAssets(currentWorkspaceId)
    }
  }, [currentWorkspaceId, loadMediaAssets])
  
  const mediaAssetsList = Object.values(mediaAssets)
  
  // Show loading state
  if (isLoadingMedia) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p>Loading media assets...</p>
      </div>
    )
  }
  
  // Show empty state
  if (mediaAssetsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
        <p>No media assets found</p>
        <p className="text-xs mt-2">Upload some media to get started</p>
      </div>
    )
  }
  
  return (
    <ScrollArea className="h-[300px] w-full pr-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-4">
        {mediaAssetsList.map((asset) => {
          const isSelected = selectedMediaId === asset.mediaId
          
          return (
            <Card 
              key={asset.id} 
              className={cn(
                "cursor-pointer overflow-hidden transition-all",
                isSelected 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "hover:border-primary/50"
              )}
              onClick={() => {
                // Toggle selection - if already selected, unselect it
                if (isSelected) {
                  onSelect('')  // Empty string to indicate no selection
                } else {
                  onSelect(asset.mediaId)
                }
              }}
            >
              <div className="relative aspect-square w-full">
                {asset.type === 'image' ? (
                  <Image 
                    src={asset.mediaId.startsWith('http') 
                      ? (asset.thumbnail || asset.mediaId) 
                      : getCloudinaryUrl(asset.mediaId, {
                          type: 'image',
                          width: 200,
                          height: 200,
                          crop: 'fill',
                          quality: 'auto'
                        })
                    }
                    alt={asset.mediaId.split('/').pop() || 'Media'} 
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                ) : (
                  <div className="relative h-full w-full bg-muted flex items-center justify-center">
                    <VideoIcon className="h-8 w-8 text-muted-foreground" />
                    <div className="absolute bottom-1 right-1 bg-background/80 text-xs px-1 rounded">
                      {asset.duration && Math.round(asset.duration)}s
                    </div>
                  </div>
                )}
                
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                    <Check className="h-8 w-8 text-primary-foreground" />
                  </div>
                )}
                
                {/* Media type badge */}
                <div className="absolute top-1 left-1 bg-background/80 rounded p-1">
                  {asset.type === 'image' 
                    ? <ImageIcon className="h-3 w-3" /> 
                    : <VideoIcon className="h-3 w-3" />
                  }
                </div>
                
                {/* Media item menu */}
                <MediaItemMenu mediaId={asset.mediaId} />
              </div>
              
              <CardContent className="p-2">
                <p className="text-xs truncate">
                  {asset.mediaId.split('/').pop()}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </ScrollArea>
  )
}
