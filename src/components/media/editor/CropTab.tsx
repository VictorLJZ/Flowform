"use client";

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ImageEditorTransformations } from '@/types/form-store-slices-types-media';

interface CropTabProps {
  imageUrl: string;
  onChange: (crop: ImageEditorTransformations['crop']) => void;
}

export default function CropTab({ imageUrl, onChange }: CropTabProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number; } | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);

  const onCropComplete = useCallback(
    (_croppedArea: any, croppedAreaPixels: { x: number; y: number; width: number; height: number; }) => {
      setCroppedAreaPixels(croppedAreaPixels);
      onChange(croppedAreaPixels);
    },
    [onChange]
  );

  const handleAspectRatioChange = (value: string) => {
    switch(value) {
      case "free":
        setAspectRatio(undefined);
        break;
      case "1:1":
        setAspectRatio(1);
        break;
      case "4:3":
        setAspectRatio(4/3);
        break;
      case "16:9":
        setAspectRatio(16/9);
        break;
      case "3:2":
        setAspectRatio(3/2);
        break;
      default:
        setAspectRatio(undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative h-[300px] w-full">
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          objectFit="contain"
          classes={{
            containerClassName: "rounded-md",
          }}
        />
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label className="text-sm font-medium">Aspect ratio</Label>
            <Select onValueChange={handleAspectRatioChange} defaultValue="free">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Free" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="1:1">Square (1:1)</SelectItem>
                <SelectItem value="4:3">Standard (4:3)</SelectItem>
                <SelectItem value="16:9">Widescreen (16:9)</SelectItem>
                <SelectItem value="3:2">Photo (3:2)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label className="text-sm font-medium">Zoom</Label>
            <span className="text-sm">{Math.round(zoom * 100)}%</span>
          </div>
          <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.01}
            onValueChange={(value) => setZoom(value[0])}
          />
        </div>
        
        {/* Rotation feature has been removed */}
      </div>
    </div>
  );
}
