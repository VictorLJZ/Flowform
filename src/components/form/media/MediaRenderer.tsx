"use client"

import React from 'react'
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
  
  // Placeholder for when no media is set
  if (!mediaId || !mediaAsset) {
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
  if (mediaAsset.type === 'image') {
    // Generate optimized Cloudinary URL if it's a Cloudinary asset
    const imageUrl = mediaAsset.mediaId?.startsWith('http') 
      ? mediaAsset.url 
      : getCloudinaryUrl(mediaAsset.mediaId, {
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
  } else if (mediaAsset.type === 'video') {
    // Generate optimized Cloudinary URL if it's a Cloudinary asset
    const videoUrl = mediaAsset.mediaId?.startsWith('http')
      ? mediaAsset.url
      : getCloudinaryUrl(mediaAsset.mediaId, { type: 'video' });
      
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
