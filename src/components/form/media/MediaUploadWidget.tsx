"use client"

import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle, Upload } from 'lucide-react'
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { MediaAsset } from '@/types/media-types'
import { CloudinaryWidgetOptions, CloudinaryWidgetResult } from '@/types/common-types'
import { v4 as uuidv4 } from 'uuid'
import Script from 'next/script'
import { getCloudinaryConfig } from '@/services/media-service'

interface MediaUploadWidgetProps {
  onSelect?: (mediaId: string) => void
}

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (options: CloudinaryWidgetOptions, callback: (error: Error | null, result: CloudinaryWidgetResult) => void) => {
        open: () => void;
        close: () => void;
      };
    };
  }
}

export function MediaUploadWidget({ onSelect }: MediaUploadWidgetProps) {
  const { addMediaAsset } = useFormBuilderStore()
  const [isLoading, setIsLoading] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const currentWorkspaceId = useWorkspaceStore(state => state.currentWorkspaceId)
  const [cloudinaryConfig, setCloudinaryConfig] = useState<{
    cloudName: string;
    uploadPreset: string;
    workspaceId: string;
  } | null>(null)

  // Handle script load event
  const handleScriptLoad = useCallback(() => {
    setScriptLoaded(true)
  }, [])

  // Fetch Cloudinary configuration
  useEffect(() => {
    const fetchConfig = async () => {
      if (!currentWorkspaceId) {
        console.error('No workspace selected, cannot fetch Cloudinary config')
        return
      }
      
      try {
        const config = await getCloudinaryConfig(currentWorkspaceId)
        if (config) {
          setCloudinaryConfig(config)
        }
      } catch (error) {
        console.error('Error fetching Cloudinary config:', error)
      }
    }

    if (currentWorkspaceId) {
      fetchConfig()
    }
  }, [currentWorkspaceId])

  const openCloudinaryWidget = useCallback(() => {
    // Make sure everything is loaded
    if (!cloudinaryConfig || !scriptLoaded || !window.cloudinary) {
      setIsLoading(false)
      return
    }

    const uploadWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudinaryConfig.cloudName,
        uploadPreset: cloudinaryConfig.uploadPreset,
        maxFiles: 1,
        sources: ['local', 'url', 'camera', 'unsplash'],
        resourceType: 'auto',
        multiple: false,
        styles: {
          palette: {
            window: '#ffffff',
            sourceBg: '#f4f4f5',
            windowBorder: '#cbd5e1',
            tabIcon: '#0284c7',
            inactiveTabIcon: '#94a3b8',
            menuIcons: '#0284c7',
            link: '#0284c7',
            action: '#0284c7',
            inProgress: '#0284c7',
            complete: '#22c55e',
            error: '#ef4444',
            textDark: '#334155',
            textLight: '#ffffff'
          }
        }
      },
      (error: Error | null, result: CloudinaryWidgetResult) => {
        setIsLoading(false)
        if (!error && result && result.event === 'success' && result.info) {
          const info = result.info
          
          // Create a new media asset with the uploaded file info
          const newAsset: MediaAsset = {
            id: uuidv4(),
            mediaId: info.public_id,
            type: info.resource_type === 'video' ? 'video' : 'image',
            url: info.secure_url,
            thumbnailUrl: info.thumbnail_url || info.secure_url,
            width: info.width,
            height: info.height,
            duration: info.duration,
            createdAt: new Date(),
            tags: info.tags || [],
            workspaceId: cloudinaryConfig?.workspaceId
          }
          
          // Add to store
          addMediaAsset(newAsset)
          
          // Select the new media if callback provided
          if (onSelect) {
            onSelect(newAsset.mediaId)
          }
        }
      }
    )

    uploadWidget.open()
  }, [cloudinaryConfig, scriptLoaded, addMediaAsset, onSelect])

  const handleUpload = () => {
    if (!cloudinaryConfig) {
      console.error('Cloudinary configuration not loaded')
      return
    }

    setIsLoading(true)
    
    // If script is already loaded, open the widget directly
    if (scriptLoaded && window.cloudinary) {
      openCloudinaryWidget()
    }
  }

  return (
    <>
      {/* Load the Cloudinary Upload Widget script */}
      <Script 
        src="https://upload-widget.cloudinary.com/global/all.js"
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
      />
      
    <div className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 text-center">
      <Upload className="h-8 w-8 text-muted-foreground" />
      <div className="space-y-1">
        <p className="text-sm font-medium">Upload Media</p>
        <p className="text-xs text-muted-foreground">
          Drag and drop files or click to browse
        </p>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-2"
        onClick={handleUpload}
        disabled={isLoading || !cloudinaryConfig}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        {isLoading ? 'Loading...' : 'Add Media'}
      </Button>
    </div>
    </>
  )
}
