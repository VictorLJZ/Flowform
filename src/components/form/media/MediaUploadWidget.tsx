"use client"

import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { UiMediaAsset } from '@/types/media/UiMedia'
import { CloudinaryWidgetOptions, CloudinaryWidgetResult } from '@/types/common-types'
import { v4 as uuidv4 } from 'uuid'
import Script from 'next/script'
import { getCloudinaryConfig } from '@/services/media-service'

// Helper functions for formatting
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

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
      
      const config = await getCloudinaryConfig(currentWorkspaceId)
      if (config) {
        setCloudinaryConfig({
          cloudName: config.cloudName,
          uploadPreset: config.uploadPreset,
          workspaceId: currentWorkspaceId
        })
      }
    }
    
    fetchConfig()
  }, [currentWorkspaceId])

  const openCloudinaryWidget = useCallback(() => {
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
          const createdAt = new Date().toISOString();
          const filename = (info.original_filename as string) || 'unnamed file';
          const fileSize = (info.bytes as number) || 0;
          const publicId = (info.public_id as string) || '';
          const secureUrl = (info.secure_url as string) || '';
          const resourceType = (info.resource_type as string) || 'image';
          const format = (info.format as string) || '';
          const width = (info.width as number) || undefined;
          const height = (info.height as number) || undefined;
          const duration = (info.duration as number) || undefined;
          const thumbnailUrl = (info.thumbnail_url as string) || secureUrl;
          const tags = (info.tags as string[]) || [];
          
          const newAsset: UiMediaAsset = {
            id: uuidv4(),
            mediaId: publicId,
            userId: '', // Will be filled by backend
            workspaceId: cloudinaryConfig.workspaceId || '',
            filename: filename,
            url: secureUrl,
            secureUrl: secureUrl,
            type: resourceType === 'video' ? 'video' : 'image',
            format: format,
            width: width,
            height: height,
            duration: duration,
            bytes: fileSize,
            resourceType: resourceType,
            tags: tags,
            createdAt: createdAt,
            
            // UI-specific properties
            displayName: filename,
            formattedSize: formatFileSize(fileSize),
            formattedDimensions: width && height ? `${width} × ${height}` : undefined,
            formattedDuration: duration ? formatDuration(duration) : undefined,
            formattedDate: new Date(createdAt).toLocaleDateString(),
            thumbnail: thumbnailUrl,
            isSelected: false
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

  return (
    <div className="flex flex-col items-center gap-4">
      {!scriptLoaded && (
        <Script 
          src="https://upload-widget.cloudinary.com/global/all.js" 
          onLoad={handleScriptLoad} 
        />
      )}
      
      <Button 
        onClick={() => {
          setIsLoading(true)
          if (scriptLoaded && window.cloudinary) {
            openCloudinaryWidget()
          }
        }} 
        variant="outline" 
        size="lg" 
        disabled={isLoading || !cloudinaryConfig}
      >
        {isLoading ? (
          "Loading..."
        ) : (
          <>
            <Upload className="mr-2 h-5 w-5" />
            Upload Media
          </>
        )}
      </Button>
    </div>
  )
}
