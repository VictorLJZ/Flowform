"use client";

import { useState, useEffect } from 'react';
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
  initialAdjustments?: ImageEditorTransformations['adjustments']; // Optional initial adjustment values
}

export default function AdjustmentsTab({ onChange, initialAdjustments }: AdjustmentsTabProps) {
  // Define default adjustments
  const defaultAdjustments = {
    rotate: 0,
    flip: null as 'horizontal' | 'vertical' | 'both' | null,
    brightness: 0,
    contrast: 0,
    opacity: 100
  };
  
  // Initialize state with initialAdjustments or defaults
  const [adjustments, setAdjustments] = useState({
    ...defaultAdjustments,
    ...initialAdjustments // Override defaults with any initial values
  });
  
  // Update local state when initialAdjustments change
  useEffect(() => {
    if (initialAdjustments) {
      setAdjustments(prev => ({
        ...prev,
        ...initialAdjustments
      }));
    }
  }, [initialAdjustments]);
  
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
    // Enhanced flip logic to handle toggling and both directions
    let newFlip = null;
    
    if (adjustments.flip === 'both') {
      // If both directions are currently active, toggle off the selected direction
      newFlip = direction === 'horizontal' ? 'vertical' : 'horizontal';
    } else if (adjustments.flip === direction) {
      // If the current direction is already active, turn it off
      newFlip = null;
    } else if (adjustments.flip === null) {
      // If no direction is active, set the selected direction
      newFlip = direction;
    } else {
      // If the other direction is active, activate both directions
      newFlip = 'both';
    }
    
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
                variant={adjustments.flip === 'vertical' || adjustments.flip === 'both' ? "default" : "outline"} 
                size="icon"
                onClick={() => handleFlip('vertical')}
                title="Flip vertical"
              >
                <FlipVerticalIcon className="h-4 w-4" />
              </Button>
              <Button 
                variant={adjustments.flip === 'horizontal' || adjustments.flip === 'both' ? "default" : "outline"} 
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
