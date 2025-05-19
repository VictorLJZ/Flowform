"use client";

import { useState, useEffect, useCallback } from 'react';
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
    updateEditorTransformations,
    cancelEditing,
    saveEditedMedia,
    getEditorPreviewUrl,
    getNonCropPreviewUrl,
    getAdjustmentsPreviewUrl,
    getFiltersPreviewUrl
  } = useFormBuilderStore();
  
  // Get the media asset being edited
  const mediaAsset = editingMediaId ? mediaAssets[editingMediaId] : null;
  
  const [activeTab, setActiveTab] = useState("crop");
  const [previewUrl, setPreviewUrl] = useState("");
  const [nonCropPreviewUrl, setNonCropPreviewUrl] = useState("");
  const [adjustmentsPreviewUrl, setAdjustmentsPreviewUrl] = useState("");
  const [filtersPreviewUrl, setFiltersPreviewUrl] = useState("");
  
  // Handle tab changes
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);

    // Reset the preview URL when changing tabs to ensure it's updated
    setTimeout(() => {
      const currentPreviewUrl = getEditorPreviewUrl();
      if (currentPreviewUrl) {
        // Add cache busting parameter to ensure preview refreshes
        const cacheBuster = `_t=${Date.now()}`;
        const newUrl = currentPreviewUrl.includes('?') 
          ? `${currentPreviewUrl}&${cacheBuster}` 
          : `${currentPreviewUrl}?${cacheBuster}`;
        setPreviewUrl(newUrl);
      }
      
      // Update the non-crop preview URL for the crop tab
      const nonCropUrl = getNonCropPreviewUrl();
      if (nonCropUrl) {
        setNonCropPreviewUrl(nonCropUrl);
      }

      // Update the adjustments preview URL for the adjustments tab
      const adjustmentsUrl = getAdjustmentsPreviewUrl();
      if (adjustmentsUrl) {
        setAdjustmentsPreviewUrl(adjustmentsUrl);
      }
      
      // Update the filters preview URL for the filters tab
      const filtersUrl = getFiltersPreviewUrl();
      if (filtersUrl) {
        setFiltersPreviewUrl(filtersUrl);
      }
    }, 0);
  }, [editingMediaId, getEditorPreviewUrl, getNonCropPreviewUrl, getAdjustmentsPreviewUrl, getFiltersPreviewUrl, mediaAsset]);
  
  const { editingHistory = {} } = useFormBuilderStore();
  
  useEffect(() => {
    // Ensure we have a valid previewUrl whenever component renders or editingMediaId changes
    if (mediaAsset && editingMediaId) {
      const currentPreviewUrl = getEditorPreviewUrl();
      const currentNonCropUrl = getNonCropPreviewUrl();
      const currentAdjustmentsUrl = getAdjustmentsPreviewUrl();
      const currentFiltersUrl = getFiltersPreviewUrl();
      
      // If we don't have a preview URL, regenerate it from the transformations
      if (!currentPreviewUrl) {
        if (editingHistory[editingMediaId]?.transformations) {
          // Reapply saved transformations to regenerate the preview
          updateEditorTransformations(editingHistory[editingMediaId].transformations);
          // Wait for the update to complete and then get the new URLs
          setTimeout(() => {
            const newUrl = getEditorPreviewUrl();
            const newNonCropUrl = getNonCropPreviewUrl();
            const newAdjustmentsUrl = getAdjustmentsPreviewUrl();
            const newFiltersUrl = getFiltersPreviewUrl();
            
            if (newUrl) {
              setPreviewUrl(newUrl);
            }
            
            if (newNonCropUrl) {
              setNonCropPreviewUrl(newNonCropUrl);
            }

            if (newAdjustmentsUrl) {
              setAdjustmentsPreviewUrl(newAdjustmentsUrl);
            }

            if (newFiltersUrl) {
              setFiltersPreviewUrl(newFiltersUrl);
            }
          }, 10);
        } else {
          setPreviewUrl(mediaAsset.url); // Fallback to original
          setNonCropPreviewUrl(mediaAsset.url); // Fallback to original
          setAdjustmentsPreviewUrl(mediaAsset.url); // Fallback to original
          setFiltersPreviewUrl(mediaAsset.url); // Fallback to original
        }
      } else {
        setPreviewUrl(currentPreviewUrl);
        setNonCropPreviewUrl(currentNonCropUrl || mediaAsset.url);
        setAdjustmentsPreviewUrl(currentAdjustmentsUrl || mediaAsset.url);
        setFiltersPreviewUrl(currentFiltersUrl || mediaAsset.url);
      }
    } else if (mediaAsset) {
      setPreviewUrl(mediaAsset.url);
      setNonCropPreviewUrl(mediaAsset.url);
      setAdjustmentsPreviewUrl(mediaAsset.url);
      setFiltersPreviewUrl(mediaAsset.url);
    }
  }, [getEditorPreviewUrl, getNonCropPreviewUrl, getAdjustmentsPreviewUrl, getFiltersPreviewUrl, mediaAsset, editingMediaId, editingHistory, updateEditorTransformations]);
  
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
        
        <Tabs value={activeTab} onValueChange={handleTabChange}>
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
          
          <div className="flex-grow overflow-y-auto p-4">
            <div className="flex flex-col items-center justify-start">
              {/* Only show preview for adjustments and filters tabs */}
              {activeTab !== "crop" && (
                <div className="mb-4 relative overflow-hidden bg-[url('/grid-pattern-gray.svg')] rounded-md w-full max-h-[200px]">
                  <img 
                    src={
                      activeTab === "adjustments" ? adjustmentsPreviewUrl : 
                      activeTab === "filters" ? filtersPreviewUrl : 
                      previewUrl || mediaAsset.url
                    } 
                    alt="Preview" 
                    className="max-w-full max-h-[200px] mx-auto object-contain"
                  />
                </div>
              )}
              
              <TabsContent value="crop" className="w-full mt-4">
                <CropTab 
                  imageUrl={nonCropPreviewUrl || mediaAsset.url} 
                  onChange={handleCropChange} 
                />
              </TabsContent>
              
              <TabsContent value="adjustments" className="w-full mt-4">
                <AdjustmentsTab
                  onChange={handleAdjustmentsChange}
                  initialAdjustments={editingMediaId ? editingHistory[editingMediaId]?.transformations?.adjustments : undefined}
                />
              </TabsContent>
              
              <TabsContent value="filters" className="w-full mt-4">
                <FiltersTab 
                  imageUrl={mediaAsset.url}
                  onChange={handleFilterChange}
                  initialFilter={editingMediaId ? editingHistory[editingMediaId]?.transformations?.filter : undefined}
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
