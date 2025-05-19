"use client";

import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useFormBuilderStore } from '@/stores/formBuilderStore';

interface MediaEditButtonProps {
  mediaId: string;
  buttonType?: 'icon' | 'text' | 'full';
  className?: string;
}

export default function MediaEditButton({ 
  mediaId,
  buttonType = 'full',
  className
}: MediaEditButtonProps) {
  const { startEditingMedia } = useFormBuilderStore();
  
  const handleEditClick = () => {
    startEditingMedia(mediaId);
  };
  
  if (buttonType === 'icon') {
    return (
      <Button
        variant="ghost" 
        size="icon"
        onClick={handleEditClick}
        className={className}
        title="Edit image"
      >
        <Pencil className="h-4 w-4" />
      </Button>
    );
  }
  
  if (buttonType === 'text') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleEditClick}
        className={className}
      >
        Edit
      </Button>
    );
  }
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleEditClick}
      className={className}
    >
      <Pencil className="h-4 w-4 mr-2" />
      Edit
    </Button>
  );
}
