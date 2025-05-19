"use client";

import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  RotateCcw as RotateCounterClockwiseIcon, 
  RotateCw as RotateClockwiseIcon,
  FlipHorizontal as FlipHorizontalIcon,
  FlipVertical as FlipVerticalIcon
} from 'lucide-react';
import type { ImageEditorTransformations } from '@/types/form-store-slices-types-media';

interface AdjustmentsTabProps {
  onChange: (adjustments: ImageEditorTransformations['adjustments']) => void;
}

export default function AdjustmentsTab({ onChange }: AdjustmentsTabProps) {
  const [adjustments, setAdjustments] = useState({
    rotate: 0,
    flip: null as 'horizontal' | 'vertical' | null,
    brightness: 0,
    contrast: 0,
    opacity: 100
  });
  
  const handleChange = (key: keyof typeof adjustments, value: any) => {
    const newAdjustments = { ...adjustments, [key]: value };
    setAdjustments(newAdjustments);
    onChange(newAdjustments);
  };
  
  const handleRotate = (amount: number) => {
    const newRotate = adjustments.rotate + amount;
    handleChange('rotate', newRotate);
  };
  
  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    // Toggle flip state
    const newFlip = adjustments.flip === direction ? null : direction;
    handleChange('flip', newFlip);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg mb-4">Transform</h3>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <Label className="text-sm font-medium">Rotate</Label>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleRotate(-90)}
                title="Rotate counter-clockwise"
              >
                <RotateCounterClockwiseIcon className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleRotate(90)}
                title="Rotate clockwise"
              >
                <RotateClockwiseIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-center">
            <span className="text-sm">{adjustments.rotate}°</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <Label className="text-sm font-medium">Flip</Label>
            <div className="flex space-x-2">
              <Button 
                variant={adjustments.flip === 'vertical' ? "default" : "outline"} 
                size="icon"
                onClick={() => handleFlip('vertical')}
                title="Flip vertical"
              >
                <FlipVerticalIcon className="h-4 w-4" />
              </Button>
              <Button 
                variant={adjustments.flip === 'horizontal' ? "default" : "outline"} 
                size="icon"
                onClick={() => handleFlip('horizontal')}
                title="Flip horizontal"
              >
                <FlipHorizontalIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg mb-4">Color</h3>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <Label className="text-sm font-medium">Brightness</Label>
            <span className="text-sm">{adjustments.brightness}</span>
          </div>
          <Slider
            value={[adjustments.brightness]}
            min={-100}
            max={100}
            step={1}
            onValueChange={(value) => handleChange('brightness', value[0])}
          />
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <Label className="text-sm font-medium">Contrast</Label>
            <span className="text-sm">{adjustments.contrast}</span>
          </div>
          <Slider
            value={[adjustments.contrast]}
            min={-100}
            max={100}
            step={1}
            onValueChange={(value) => handleChange('contrast', value[0])}
          />
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <Label className="text-sm font-medium">Opacity</Label>
            <span className="text-sm">{adjustments.opacity}%</span>
          </div>
          <Slider
            value={[adjustments.opacity]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) => handleChange('opacity', value[0])}
          />
        </div>
      </div>
    </div>
  );
}
