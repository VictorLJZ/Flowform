"use client";

import { useState, useEffect } from 'react';
import { X as XIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import CropTab from '@/components/media/editor/CropTab';
import AdjustmentsTab from '@/components/media/editor/AdjustmentsTab';
import FiltersTab from '@/components/media/editor/FiltersTab';
import ImageEditorControls from '@/components/media/editor/ImageEditorControls';
import { useFormBuilderStore } from '@/stores/formBuilderStore';
import { ImageEditorTransformations } from '@/types/form-store-slices-types-media';

export default function ImageEditor() {
  const { 
    editingMediaId, 
    mediaAssets, 
    cancelEditing, 
    updateEditorTransformations,
    saveEditedMedia,
    getEditorPreviewUrl
  } = useFormBuilderStore();
  
  const [activeTab, setActiveTab] = useState("crop");
  const [previewUrl, setPreviewUrl] = useState("");
  
  const mediaAsset = editingMediaId ? mediaAssets[editingMediaId] : null;
  
  const { editingHistory = {} } = useFormBuilderStore();
  
  useEffect(() => {
    // Ensure we have a valid previewUrl whenever component renders or editingMediaId changes
    if (mediaAsset && editingMediaId) {
      const currentPreviewUrl = getEditorPreviewUrl();
      
      // If we don't have a preview URL, regenerate it from the transformations
      if (!currentPreviewUrl) {
        if (editingHistory[editingMediaId]?.transformations) {
          // Reapply saved transformations to regenerate the preview
          updateEditorTransformations(editingHistory[editingMediaId].transformations);
          // Wait for the update to complete and then get the new URL
          setTimeout(() => {
            const newUrl = getEditorPreviewUrl();
            if (newUrl) {
              setPreviewUrl(newUrl);
            }
          }, 10);
        } else {
          setPreviewUrl(mediaAsset.url); // Fallback to original
        }
      } else {
        setPreviewUrl(currentPreviewUrl);
      }
    } else if (mediaAsset) {
      setPreviewUrl(mediaAsset.url);
    }
  }, [getEditorPreviewUrl, mediaAsset, editingMediaId, editingHistory, updateEditorTransformations]);
  
  if (!mediaAsset) return null;
  
  const handleCropChange = (crop: ImageEditorTransformations['crop']) => {
    updateEditorTransformations({ crop });
  };
  
  const handleAdjustmentsChange = (adjustments: ImageEditorTransformations['adjustments']) => {
    updateEditorTransformations({ adjustments });
  };
  
  const handleFilterChange = (filter: string | null) => {
    updateEditorTransformations({ filter });
  };
  
  const handleSave = async () => {
    // Get the current workspace ID from the media asset
    const { workspaceId } = mediaAsset;
    if (workspaceId) {
      await saveEditedMedia(workspaceId);
    }
  };
  
  const handleReset = () => {
    // Reset all transformations
    updateEditorTransformations({
      crop: undefined,
      adjustments: {
        rotate: 0,
        flip: null,
        brightness: 0,
        contrast: 0,
        opacity: 100
      },
      filter: null
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-hidden">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 flex justify-between border-b">
          <h2 className="text-xl font-semibold">Image editor</h2>
          <Button variant="ghost" size="icon" onClick={cancelEditing} aria-label="Close editor">
            <XIcon className="h-5 w-5" />
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b">
            <TabsList className="w-full justify-start p-0">
              <TabsTrigger value="crop" className="py-3 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
                Crop
              </TabsTrigger>
              <TabsTrigger value="adjustments" className="py-3 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
                Adjustments
              </TabsTrigger>
              <TabsTrigger value="filters" className="py-3 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
                Filters
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-grow overflow-y-auto">
            <div className="flex flex-col items-center justify-center p-4">
              {/* Only show preview for adjustments and filters tabs */}
              {activeTab !== "crop" && (
                <div className="mb-4 relative overflow-hidden bg-[url('/grid-pattern-gray.svg')] rounded-md max-h-[40vh]">
                  <img 
                    src={previewUrl || mediaAsset.url} 
                    alt="Preview" 
                    className="max-w-full max-h-[40vh] mx-auto object-contain"
                  />
                </div>
              )}
              
              <TabsContent value="crop" className="w-full mt-4">
                <CropTab 
                  imageUrl={mediaAsset.url}
                  onChange={handleCropChange}
                />
              </TabsContent>
              
              <TabsContent value="adjustments" className="w-full mt-4">
                <AdjustmentsTab
                  onChange={handleAdjustmentsChange}
                />
              </TabsContent>
              
              <TabsContent value="filters" className="w-full mt-4">
                <FiltersTab 
                  imageUrl={mediaAsset.url}
                  onChange={handleFilterChange}
                />
              </TabsContent>
            </div>
          </div>
          
          <ImageEditorControls
            onReset={handleReset}
            onSave={handleSave}
          />
        </Tabs>
      </div>
    </div>
  );
}
