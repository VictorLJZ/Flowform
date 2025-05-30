"use client"

import React, { useState } from 'react';
import { MoreHorizontal, Trash2, PencilIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFormBuilderStore } from '@/stores/formBuilderStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useToast } from '@/components/ui/use-toast';
import { DeleteMediaDialog } from './DeleteMediaDialog';

interface MediaItemMenuProps {
  mediaId: string;
}

export function MediaItemMenu({ mediaId }: MediaItemMenuProps) {
  const { deleteMediaAsset, getMediaAssetByMediaId, startEditingMedia } = useFormBuilderStore();
  const currentWorkspaceId = useWorkspaceStore(state => state.currentWorkspaceId);
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent item selection when clicking delete
    setShowDeleteDialog(true);
  };
  
  const confirmDelete = async () => {
    if (isDeleting || !currentWorkspaceId) return;
    
    setIsDeleting(true);
    
    try {
      const success = await deleteMediaAsset(mediaId, currentWorkspaceId);
      
      if (success) {
        toast({
          title: "Media deleted",
          description: "The media asset has been removed",
        });
      } else {
        throw new Error('Failed to delete media');
      }
    } catch {
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
            className="flex items-center" 
            onClick={(e) => {
              e.stopPropagation();
              // Get the media asset by mediaId and then use its ID to start editing
              const asset = getMediaAssetByMediaId(mediaId);
              if (asset) {
                startEditingMedia(asset.id);
              }
            }}
          >
            <PencilIcon className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive flex items-center" 
            onClick={handleDeleteClick}
            disabled={isDeleting}
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
