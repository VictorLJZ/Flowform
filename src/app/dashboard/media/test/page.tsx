"use client"

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MediaUploadWidget } from '@/components/form/media/MediaUploadWidget'
import { MediaBrowser } from '@/components/form/media/MediaBrowser'
import { MediaRenderer } from '@/components/form/media/MediaRenderer'
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function MediaTestPage() {
  const { mediaAssets, loadMediaAssets, isLoadingMedia } = useFormBuilderStore()
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null)
  const [sizingMode, setSizingMode] = useState<'contain' | 'cover' | 'fill'>('cover')
  const [opacity, setOpacity] = useState<number>(100)
  
  // Load media assets when the component mounts
  useEffect(() => {
    loadMediaAssets().catch(error => {
      console.error('Error loading media assets:', error)
    })
  }, [loadMediaAssets])
  
  const mediaAssetsList = Object.values(mediaAssets)
  
  return (
    <div className="container py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Media Management Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Media Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="library" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="library">Media Library</TabsTrigger>
                  <TabsTrigger value="upload">Upload Media</TabsTrigger>
                </TabsList>
                
                <TabsContent value="library" className="pt-4">
                  {isLoadingMedia ? (
                    <div className="flex justify-center items-center h-60">
                      <p>Loading media assets...</p>
                    </div>
                  ) : (
                    <>
                      <p className="mb-4 text-sm text-muted-foreground">
                        {mediaAssetsList.length} media assets found
                      </p>
                      <MediaBrowser 
                        onSelect={(mediaId) => setSelectedMediaId(mediaId)} 
                        selectedMediaId={selectedMediaId || undefined} 
                      />
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="upload" className="pt-4">
                  <MediaUploadWidget onSelect={(mediaId) => setSelectedMediaId(mediaId)} />
                  
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadMediaAssets()}
                      disabled={isLoadingMedia}
                    >
                      {isLoadingMedia ? 'Refreshing...' : 'Refresh Media Library'}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Media Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full rounded-md overflow-hidden mb-4">
                <MediaRenderer
                  mediaId={selectedMediaId || undefined}
                  sizingMode={sizingMode}
                  opacity={opacity}
                  className="h-full w-full"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Sizing Mode</label>
                  <select
                    value={sizingMode}
                    onChange={(e) => setSizingMode(e.target.value as 'contain' | 'cover' | 'fill')}
                    className="w-full mt-1 px-2 py-1 border rounded-md"
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="fill">Fill</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Opacity: {opacity}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(parseInt(e.target.value))}
                    className="w-full mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
