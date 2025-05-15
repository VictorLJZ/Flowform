"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, MoreHorizontal, Link, Trash, FileText, BarChart, FileUp } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useForms } from "@/hooks/useForms"
import { usePublishForm } from "@/hooks/usePublishForm"
import { getFormWithBlocksClient } from "@/services/form/getFormWithBlocksClient"
import { mapFromDbBlockType } from "@/utils/blockTypeMapping"
import type { ApiBlockType, ApiBlockSubtype } from "@/types/block/ApiBlock"
import type { DbBlock } from "@/types/block/DbBlock"
import type { UiBlock } from "@/types/block/UiBlock"

// Extend UiBlock to include our custom properties
interface CustomUiBlock extends UiBlock {
  blockTypeId: string;
}
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface FormsViewProps {
  workspaceId?: string | null;
  className?: string;
  viewMode: 'grid' | 'list';
}

export function FormsView({ workspaceId, viewMode, className = '' }: FormsViewProps) {
  const router = useRouter()
  const { forms, isLoading, error, mutate } = useForms(workspaceId)
  const { toast } = useToast()
  
  const [publishingFormId, setPublishingFormId] = useState<string | null>(null)
  const { publishFormWithBlocks } = usePublishForm()

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
      const convertedBlocks: CustomUiBlock[] = form.blocks.map((dbBlock: DbBlock) => {
        const blockTypeId = mapFromDbBlockType(dbBlock.type || 'static', dbBlock.subtype || 'short_text');
        
        // Determine block type based on db type
        const blockType: ApiBlockType = dbBlock.type === 'dynamic' ? 'dynamic' : 
                                      dbBlock.type === 'integration' ? 'integration' : 
                                      dbBlock.type === 'layout' ? 'layout' : 'static';
        
        // Determine block subtype based on db type
        const blockSubtype: ApiBlockSubtype = dbBlock.subtype?.toLowerCase() as ApiBlockSubtype || 'short_text';
        
        // Create the block with all required properties for UiBlock type
        const uiBlock: CustomUiBlock = {
          id: dbBlock.id,
          formId: formId, // Required by UiBlock
          type: blockType,
          subtype: blockSubtype, // Required by ApiBlock
          title: dbBlock.title || '',
          description: dbBlock.description || null, // Required by ApiBlock
          required: dbBlock.required || false,
          orderIndex: dbBlock.order_index || 0, // camelCase for API layer
          settings: dbBlock.settings || {},
          createdAt: dbBlock.created_at || new Date().toISOString(),
          updatedAt: dbBlock.updated_at || new Date().toISOString(),
          // Optional UI-specific properties
          displayStatus: 'valid',
          isVisible: true,
          isEditable: true,
          hasValidationErrors: false,
          validationMessages: [],
          // Custom property for UI
          blockTypeId,
        };
        
        return uiBlock;
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

      // Navigate directly to the builder
      router.push(`/dashboard/form/${form_id}/builder`);
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
      <div className="flex flex-1 flex-col gap-0">
        {/* View controls moved to dashboard page */}

        {forms.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4 h-full" 
            : "flex flex-col gap-2 h-full"
          }>
            {forms.map((form, index) => (
              <Card 
                key={form.formId || `form-${index}`} 
                // List View: Added gap-x-4
                className={`overflow-hidden flex ${viewMode === 'list' ? 'flex-row p-3 gap-x-4' : 'flex-col !p-0 gap-0'} h-full cursor-pointer hover:shadow-md transition-shadow`}
                onClick={(e) => {
                  // Prevent navigation if clicking on dropdown or buttons
                  if (e.target instanceof Element) {
                    // Check if click is on or within dropdown menu or buttons
                    const isOnDropdown = e.target.closest('[data-dropdown-trigger], [data-dropdown-content], button');
                    if (!isOnDropdown) {
                      router.push(`/dashboard/form/${form.formId}/builder`);
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
                {/* Grid View: CardHeader bottom padding changed from pb-1 to pb-0 */}
                {/* List View: Constrain grid to hug content vertically */}
                <CardHeader className={viewMode === 'list' ? 'flex-1 self-start !px-0 !py-0 grid-rows-1 !gap-0' : 'pt-4 pl-6 pr-4 pb-0'}>
                  {/* Grid View: Parent flex changed to items-center. List View: Added w-full and gap-x-3 */}
                  <div className={`flex w-full ${viewMode === 'list' ? 'flex-row items-center gap-x-3' : 'flex-row justify-between items-center'}`}> 
                    {/* Grid View: Title container is 'pr-2 flex items-center'. List View: Title container is 'flex flex-row items-center gap-2' to include badge */}
                    <div className={`flex-1 min-w-0 ${viewMode === 'grid' ? 'pr-2 flex items-center' : 'flex flex-row items-center gap-2'}`}> 
                      <CardTitle className="line-clamp-1">{form.title}</CardTitle>
                      {/* Badge moved here for list view, next to the title */}
                      {viewMode === 'list' && (
                        <Badge variant="outline" className="text-xs flex-shrink-0">Last edited: {new Date(form.updatedAt).toLocaleDateString()}</Badge>
                      )}
                    </div>
                    {/* Status Indicators - Moved into CardHeader for List View */} 
                    {viewMode === 'list' && (
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground flex-shrink-0 gap-2">
                        <p className="flex items-center gap-1">
                          {form.status === 'published' ? (
                            <><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Published</>
                          ) : (
                            <><span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>Draft</>
                          )}
                        </p>
                      </div>
                    )}
                    <div className={`${viewMode === 'list' ? 'ml-auto flex-shrink-0' : 'flex-shrink-0'}`}> 
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-8 h-8" data-dropdown-trigger>
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Form actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem key="edit" onClick={(e) => {
                            e.stopPropagation(); // Stop event from bubbling up to the Card
                            router.push(`/dashboard/form/${form.formId}/builder`);
                          }}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>

                          {form.status !== 'published' && (
                            <DropdownMenuItem 
                              key="publish"
                              onClick={(e) => {
                                e.stopPropagation(); // Stop event from bubbling up to the Card
                                handlePublishForm(form.formId);
                              }}
                              disabled={publishingFormId === form.formId}
                            >
                              {publishingFormId === form.formId ? (
                                <>
                                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                                  Publishing...
                                </>
                              ) : (
                                <>
                                  <FileUp className="mr-2 h-4 w-4" /> Publish
                                </>
                              )}
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem key="analytics" onClick={(e) => {
                            e.stopPropagation(); // Stop event from bubbling up to the Card
                            router.push(`/dashboard/form/${form.formId}/analytics`);
                          }}>
                            <BarChart className="mr-2 h-4 w-4" /> Analytics
                          </DropdownMenuItem>

                          <DropdownMenuItem key="copyLink" onClick={async (e) => {
                            e.stopPropagation(); // Stop event from bubbling up to the Card
                            // Reverted to dynamic link construction
                            const shareableLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/f/${form.formId}`;
                            try {
                              await navigator.clipboard.writeText(shareableLink);
                              toast({ 
                                title: 'Link Copied!', 
                                description: 'Form link copied to clipboard.' 
                              });
                            } catch (err) {
                              console.error('Failed to copy link: ', err);
                              toast({
                                variant: "destructive",
                                title: "Failed to copy",
                                description: "Could not copy link to clipboard.",
                              });
                            }
                          }}>
                            {/* Link Icon made always visible */}
                            <Link className="mr-2 h-4 w-4" /> Copy link
                          </DropdownMenuItem>
                          <DropdownMenuSeparator key="separator" />
                          <DropdownMenuItem key="delete" className="text-destructive" onClick={(e) => {
                            e.stopPropagation(); // Stop event from bubbling up to the Card
                            /* TODO: Implement delete form functionality */ 
                            toast({ title: 'Delete clicked (not implemented)', description: `Form ID: ${form.formId}`});
                          }}>
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                {viewMode !== 'list' && (
                  <div className="px-[20px] pt-1 text-xs"> 
                    <Badge variant="outline">Last edited: {new Date(form.updatedAt).toLocaleDateString()}</Badge>
                  </div>
                )}

                {viewMode !== 'list' && form.description && (
                  <CardContent className="px-6 pt-2 pb-4"> 
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {form.description}
                    </p>
                  </CardContent>
                )}
                {/* List View: Status indicators moved to CardHeader. Grid View: Renders status here. */}
                <CardContent className={`pt-0 ${viewMode === 'list' ? 'flex-shrink-0 !px-0 !py-0 !min-h-0 hidden' : 'px-6 pt-2 pb-4'}`}> 
                  {viewMode !== 'list' && (
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-[10px] text-muted-foreground">
                        {form.status === 'published' ? (
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Published
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                            Draft
                          </span>
                        )}
                      </p>
                    </div>
                  )}
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
