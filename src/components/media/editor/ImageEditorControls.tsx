"use client";

import { Button } from "@/components/ui/button";

interface ImageEditorControlsProps {
  onReset: () => void;
  onSave: () => void;
}

export default function ImageEditorControls({ onReset, onSave }: ImageEditorControlsProps) {
  return (
    <div className="border-t p-4 flex justify-end space-x-4">
      <Button 
        variant="outline" 
        onClick={onReset}
      >
        Reset
      </Button>
      <Button 
        onClick={onSave}
      >
        Save
      </Button>
    </div>
  );
}
