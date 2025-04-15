"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CopyField } from "@/components/ui/copy-button"
import { Plus, Edit, MoreHorizontal, Copy, ExternalLink, Trash, FileText, Check } from "lucide-react"
import { toast, useToast } from "@/components/ui/use-toast"
import { useFormStore } from "@/stores/formStore"
import { useWorkspaceStore } from "@/stores/workspaceStore"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function FormsPage() {
  const router = useRouter()
  const { fetchForms, forms, isLoading, publishForm } = useFormStore()
  const { toast } = useToast()
  const [publishingFormId, setPublishingFormId] = useState<string | null>(null)
  
  // Handle form publishing
  const handlePublishForm = async (formId: string) => {
    try {
      setPublishingFormId(formId);
      const success = await publishForm(formId);
      
      if (success) {
        toast({
          title: "Form published",
          description: "Your form is now publicly accessible via the share link.",
          action: (
            <Button variant="outline" size="sm" onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/f/${formId}`);
              toast({
                description: "Share link copied to clipboard",
              });
            }}>
              Copy Link
            </Button>
          ),
        });
      } else {
        toast({
          variant: "destructive",
          title: "Publishing failed",
          description: "There was an error publishing your form.",
        });
      }
    } catch (error) {
      console.error("Error publishing form:", error);
      toast({
        variant: "destructive",
        title: "Publishing failed",
        description: "There was an unexpected error publishing your form.",
      });
    } finally {
      setPublishingFormId(null);
    }
  };

  useEffect(() => {
    fetchForms()
  }, [fetchForms])

  const handleCreateForm = async () => {
    try {
      // Get current workspace and user data from the workspace store
      const { currentWorkspace, userId } = useWorkspaceStore.getState();
      
      if (!currentWorkspace?.id) {
        console.error('No current workspace selected');
        return; // Add proper error handling/toast in production
      }
      
      if (!userId) {
        console.error('No user ID available');
        return; // Add proper error handling/toast in production
      }
      
      // Create the form record using actual workspace and user IDs
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          workspace_id: currentWorkspace.id,
          user_id: userId
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

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem key="dashboard" className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator key="separator" className="hidden md:block" />
              <BreadcrumbItem key="forms">
                <BreadcrumbPage>My Forms</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6 pt-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My Forms</h1>
          <Button onClick={handleCreateForm}>
            <Plus className="mr-2 h-4 w-4" /> Create Form
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-pulse">Loading forms...</div>
          </div>
        ) : forms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forms.map((form, index) => (
              <Card key={form.form_id || `form-${index}`} className="overflow-hidden flex flex-col">
                {/* Thumbnail preview */}
                <div className="h-32 bg-muted flex items-center justify-center border-b">
                  {/* Form preview placeholder */}
                  <div className="text-muted-foreground text-sm flex flex-col items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <span>Form Preview</span>
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="line-clamp-1">{form.title}</CardTitle>
                      <CardDescription className="mt-1 text-xs">Last edited: {new Date(form.updated_at).toLocaleDateString()}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
                
                <CardContent className="pt-0">
                  {/* Shareable link field */}
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1.5">Share link</p>
                    <CopyField 
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/f/${form.form_id}`} 
                      className="text-xs bg-muted h-8" 
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
