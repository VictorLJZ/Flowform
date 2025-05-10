"use client"

import React, { useMemo } from 'react'
import Image from 'next/image'
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { cn } from '@/lib/utils'
import { getCloudinaryUrl } from '@/lib/cloudinary-client'

interface MediaRendererProps {
  mediaId?: string
  sizingMode?: 'contain' | 'cover' | 'fill'
  opacity?: number
  className?: string
}

export function MediaRenderer({ 
  mediaId, 
  sizingMode = 'cover', 
  opacity = 100,
  className 
}: MediaRendererProps) {
  const { mode, getMediaAssetByMediaId } = useFormBuilderStore()
  const isBuilder = mode === 'builder'
  
  // Find the media asset by its mediaId
  const mediaAsset = mediaId ? getMediaAssetByMediaId(mediaId) : undefined
  
  // Determine media type based on mediaId or mediaAsset
  const mediaType = useMemo(() => {
    // If we have the media asset from the store, use its type
    if (mediaAsset) return mediaAsset.type;
    
    // If we only have the mediaId, try to determine type from extension
    if (mediaId) {
      const fileName = mediaId.split('/').pop() || '';
      return /\.(mp4|webm|mov|avi)$/i.test(fileName) ? 'video' : 'image';
    }
    
    return null; // No media type could be determined
  }, [mediaAsset, mediaId]);
  
  // Placeholder for when no media is set
  if (!mediaId) {
    return (
      <div 
        className={cn(
          "w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md",
          className
        )}
      >
        <span className="text-gray-400">
          {isBuilder ? "Click to add media" : "No media"}
        </span>
      </div>
    )
  }
  
  // Render based on media type
  if (mediaType === 'image') {
    // Generate optimized Cloudinary URL based on available data
    const imageUrl = mediaAsset?.url && mediaAsset.mediaId?.startsWith('http') 
      ? mediaAsset.url 
      : getCloudinaryUrl(mediaId || '', {
          type: 'image',
          quality: 'auto',
          crop: sizingMode === 'contain' ? 'fit' : 'fill'
        });

    return (
      <div className={cn("w-full h-full relative overflow-hidden rounded-md", className)}>
        <Image 
          src={imageUrl}
          alt="Slide media"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={true}
          style={{ 
            objectFit: sizingMode,
            opacity: opacity / 100
          }}
        />
      </div>
    )
  } else if (mediaType === 'video') {
    // Generate optimized Cloudinary URL based on available data
    const videoUrl = mediaAsset?.url && mediaAsset.mediaId?.startsWith('http')
      ? mediaAsset.url
      : getCloudinaryUrl(mediaId || '', { type: 'video' });
      
    return (
      <div className={cn("w-full h-full relative overflow-hidden rounded-md", className)}>
        <video
          src={videoUrl}
          autoPlay={!isBuilder}
          loop
          muted
          playsInline
          controls={false}
          style={{ 
            width: '100%',
            height: '100%',
            objectFit: sizingMode,
            opacity: opacity / 100
          }}
        />
      </div>
    )
  }
  
  // Fallback if media type is not supported
  return (
    <div className={cn(
      "w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md",
      className
    )}>
      <span className="text-gray-400">Unsupported media type</span>
    </div>
  )
}
