"use client"

import React from 'react';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFormBuilderStore } from '@/stores/formBuilderStore';
import { toast } from '@/components/ui/use-toast';
import { DeleteMediaDialog } from './DeleteMediaDialog';

interface MediaItemMenuProps {
  mediaId: string;
}

export function MediaItemMenu({ mediaId }: MediaItemMenuProps) {
  const { deleteMediaAsset } = useFormBuilderStore();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  
  // Open the delete confirmation dialog
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent item selection when clicking delete
    setShowDeleteDialog(true);
  };
  
  // Handle delete confirmation
  const confirmDelete = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    
    try {
      const success = await deleteMediaAsset(mediaId);
      
      if (success) {
        toast({
          title: "Media deleted",
          description: "The media asset has been removed",
          variant: "default",
        });
      } else {
        throw new Error('Failed to delete media');
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "There was a problem deleting the media asset",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
          <button className="absolute top-1 right-1 p-1 rounded-full bg-background/80 text-foreground hover:bg-background">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive flex items-center" 
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DeleteMediaDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
