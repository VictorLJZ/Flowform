"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CopyField } from "@/components/ui/copy-button"
import { Plus, Edit, MoreHorizontal, Copy, ExternalLink, Trash, FileText, Grid, List } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useForms } from "@/hooks/useForms"
import { usePublishForm } from "@/hooks/usePublishForm"
import { getFormWithBlocksClient } from "@/services/form/getFormWithBlocksClient"
import { mapFromDbBlockType } from "@/utils/blockTypeMapping"
import type { BlockType } from "@/types/block-types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ViewAnalyticsButton } from "@/components/ui/view-analytics-button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

interface FormsViewProps {
  workspaceId?: string | null;
  className?: string;
}

export function FormsView({ workspaceId, className = '' }: FormsViewProps) {
  const router = useRouter()
  const { forms, isLoading, error, mutate } = useForms(workspaceId)
  const { toast } = useToast()
  
  const [publishingFormId, setPublishingFormId] = useState<string | null>(null)
  const { publishFormWithBlocks } = usePublishForm()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Handle form publishing
  const handlePublishForm = async (formId: string) => {
    setPublishingFormId(formId)
    try {
      // First, make sure any pending form data is saved to the database
      // by waiting a moment for any autosave to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // First, get the form with its blocks (using client-side function)
      const form = await getFormWithBlocksClient(formId);
      if (!form || !form.blocks) {
        throw new Error('Failed to retrieve form data');
      }
      
      // Convert database blocks to the format expected by our publishing function
      // Using type assertion to handle the complex mapping between DB and form blocks
      const convertedBlocks = form.blocks.map((dbBlock) => {
        const blockTypeId = mapFromDbBlockType(dbBlock.type || 'static', dbBlock.subtype || 'short_text');
        // Determine block type based on db type
        const blockType: BlockType = dbBlock.type === 'dynamic' ? 'dynamic' : 
                                     dbBlock.type === 'integration' ? 'integration' : 
                                     dbBlock.type === 'layout' ? 'layout' : 'static';
        
        // Create the block using the properties that exist in the FormBlock type
        return {
          id: dbBlock.id,
          blockTypeId: blockTypeId,
          type: blockType,
          title: dbBlock.title || '',
          order_index: dbBlock.order_index || 0,
          required: dbBlock.required || false,
          settings: dbBlock.settings || {}
        };
      });
      
      // Publish the form with its blocks
      await publishFormWithBlocks(formId, convertedBlocks);
      
      // Update the UI to reflect the published status
      await mutate();
      
      toast({
        title: "Form published!",
        description: "Your form is now available to the public."
      });
    } catch (error) {
      console.error('Error publishing form:', error);
      toast({
        variant: "destructive",
        title: "Failed to publish form",
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
    } finally {
      setPublishingFormId(null);
    }
  };

  const handleCreateForm = async () => {
    try {
      if (!workspaceId) {
        console.error('No current workspace selected');
        toast({
          variant: "destructive",
          title: "No workspace selected",
          description: "Please select a workspace to create a form."
        });
        return;
      }
      // Authorization will be handled by the API using the session
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: workspaceId
        })
      });

      const { form_id, error } = await response.json();

      if (error) {
        console.error('Error creating form:', error);
        return; // Add proper error handling/toast in production
      }

      // Navigate to the newly created form
      router.push(`/dashboard/forms/builder/${form_id}`);
    } catch (error) {
      console.error('Failed to create form:', error);
      // Show error notification in production
    }
  }

  if (isLoading) {
    return <div className={`flex-1 ${className}`}><Skeleton className="h-48 w-full" /></div>
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className={`m-4 ${className}`}>
        <AlertTitle>Error loading forms</AlertTitle>
        <AlertDescription>{error?.message || 'An unexpected error occurred'}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={`flex flex-1 flex-col ${className}`}>
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My Forms</h1>
          <div className="flex items-center space-x-2">
            <div className="border rounded-md overflow-hidden flex">
              <Button 
                variant={viewMode === 'grid' ? "default" : "ghost"} 
                size="sm" 
                className="rounded-none px-3 h-9" 
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? "default" : "ghost"} 
                size="sm" 
                className="rounded-none px-3 h-9" 
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {forms.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full" 
            : "flex flex-col space-y-2 h-full"
          }>
            {forms.map((form, index) => (
              <Card 
                key={form.form_id || `form-${index}`} 
                className={`overflow-hidden flex ${viewMode === 'list' ? 'flex-row' : 'flex-col'} h-full ${viewMode === 'list' ? 'p-3' : '!pt-0'} cursor-pointer hover:shadow-md transition-shadow`}
                onClick={(e) => {
                  // Prevent navigation if clicking on dropdown or buttons
                  if (e.target instanceof Element) {
                    // Check if click is on or within dropdown menu or buttons
                    const isOnDropdown = e.target.closest('[data-dropdown-trigger], [data-dropdown-content], button');
                    if (!isOnDropdown) {
                      router.push(`/dashboard/forms/builder/${form.form_id}`);
                    }
                  }
                }}
              >
                {viewMode !== 'list' && (
                  /* Thumbnail preview - only in grid view */
                  <div className="h-32 w-full bg-muted flex items-center justify-center border-b">
                    {/* Form preview placeholder */}
                    <div className="text-muted-foreground text-sm flex flex-col items-center">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <span>Form Preview</span>
                    </div>
                  </div>
                )}
                <CardHeader className={`pb-3 ${viewMode === 'list' ? 'flex-1 !px-0 !py-0' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="line-clamp-1">{form.title}</CardTitle>
                      <CardDescription className={`mt-1 text-xs ${viewMode === 'list' ? 'inline-block ml-2' : ''}`}>Last edited: {new Date(form.updated_at).toLocaleDateString()}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-dropdown-trigger>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" data-dropdown-content>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem key="edit" onClick={() => router.push(`/dashboard/forms/builder/${form.form_id}`)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem key="duplicate">
                          <Copy className="mr-2 h-4 w-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem key="share">
                          <ExternalLink className="mr-2 h-4 w-4" /> Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator key="separator" />
                        <DropdownMenuItem key="delete" className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className={`pt-0 ${viewMode === 'list' ? 'flex-1 !px-0' : ''}`}>
                  {/* Shareable link field */}
                  <div className={`${viewMode === 'list' ? 'mt-0' : 'mt-2'} w-full`}>
                    <p className="text-xs text-muted-foreground mb-1.5">Share link</p>
                    <CopyField 
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/f/${form.form_id}`} 
                      className="text-xs bg-muted h-8 w-full" 
                    />
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-[10px] text-muted-foreground">
                        {form.status === 'published' ? (
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Published
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Draft (not publicly accessible)
                          </span>
                        )}
                      </p>
                      <div className="flex gap-2">
                        <ViewAnalyticsButton
                          formId={form.form_id}
                          size="sm"
                          className="h-6 text-[10px] px-2"
                        />
                        {form.status !== 'published' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-6 text-[10px] px-2"
                            onClick={() => handlePublishForm(form.form_id)}
                            disabled={publishingFormId === form.form_id}
                          >
                            {publishingFormId === form.form_id ? (
                              <>
                                <span className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                                Publishing...
                              </>
                            ) : (
                              <>Publish</>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card rounded-xl p-6 shadow-sm border">
            <div className="text-center py-8">
              <h2 className="text-lg font-semibold mb-2">No Forms Yet</h2>
              <p className="text-muted-foreground mb-4">Create your first form to get started</p>
              <Button onClick={handleCreateForm}>
                <Plus className="mr-2 h-4 w-4" /> Create Form
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
