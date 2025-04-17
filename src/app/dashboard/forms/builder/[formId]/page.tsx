"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Loader2, Save, Globe } from "lucide-react"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { useForm } from "@/hooks/useForm"
import { getBlockDefinition } from "@/registry/blockRegistry"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { updateForm } from "@/services/form/updateForm"
import { useToast } from "@/components/ui/use-toast"
import FormBuilderSidebar from "./components/form-builder-sidebar"
import FormBuilderContent from "./components/form-builder-content"
import FormBuilderSettings from "./components/form-builder-settings"
import FormBuilderBlockSelector from "./components/form-builder-block-selector"

export default function FormBuilderPage() {
  const params = useParams()
  const formId = params.formId as string
  
  // Select state slices individually to prevent infinite loops
  const isSaving = useFormBuilderStore(state => state.isSaving);
  const formData = useFormBuilderStore(state => state.formData);
  const saveForm = useFormBuilderStore(state => state.saveForm);
  const setFormData = useFormBuilderStore(state => state.setFormData);
  const setBlocks = useFormBuilderStore(state => state.setBlocks);
  const setCurrentBlockId = useFormBuilderStore(state => state.setCurrentBlockId);
  
  const { form, isLoading, error, mutate } = useForm(formId)
  const { toast } = useToast()
  const [isPublishing, setIsPublishing] = useState(false)
  
  // Map SWR data to builder store
  useEffect(() => {
    if (form) {
      // Map settings safely
      const settingsObj = (form.settings ?? {}) as Record<string, unknown>
      setFormData({
        form_id: form.form_id,
        title: form.title,
        description: form.description ?? '',
        workspace_id: form.workspace_id,
        created_by: form.created_by,
        status: form.status,
        settings: {
          showProgressBar: Boolean(settingsObj.showProgressBar),
          requireSignIn: Boolean(settingsObj.requireSignIn),
          theme: String(settingsObj.theme),
          primaryColor: String(settingsObj.primaryColor),
          fontFamily: String(settingsObj.fontFamily),
          estimatedTime: typeof settingsObj.estimatedTime === 'number' ? settingsObj.estimatedTime : undefined,
          estimatedTimeUnit: (settingsObj.estimatedTimeUnit as 'minutes' | 'hours') ?? undefined,
          redirectUrl: settingsObj.redirectUrl as string | undefined,
          customCss: settingsObj.customCss as string | undefined
        }
      })
      // Map blocks
      const mappedBlocks = form.blocks.map(block => {
        const def = getBlockDefinition(block.subtype || 'short_text')
        return {
          id: block.id,
          blockTypeId: block.subtype || 'short_text',
          type: def?.type || 'static', // Provide default BlockType
          title: block.title || def?.defaultTitle || '', // Ensure title is always string
          description: block.description || def?.defaultDescription || '',
          required: block.required,
          order: block.order_index,
          settings: block.settings as Record<string, unknown>
        }
      })
      setBlocks(mappedBlocks)
      setCurrentBlockId(mappedBlocks[0]?.id ?? null)
    }
  }, [form, setFormData, setBlocks, setCurrentBlockId])
  
  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center"><Skeleton className="h-48 w-full" /></div>
  }
  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTitle>Error loading form</AlertTitle>
        <AlertDescription>{error.message || String(error)}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-background border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Breadcrumb className="mr-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/forms">Forms</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{formData.title || "Untitled Form"}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1" 
            onClick={() => window.open(`/preview/${formId}`, '_blank')}
          >
            Preview
          </Button>
          
          <Button 
            onClick={saveForm}
            disabled={isSaving}
            size="sm"
            className="gap-1"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save
              </>
            )}
          </Button>
          
          <Button 
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={isPublishing || !formData.form_id}
            onClick={async () => {
              if (!formData.form_id) return;
              
              try {
                setIsPublishing(true)
                // Publish via status update
                await updateForm(formData.form_id, { status: 'published' })
                await mutate()
                toast({
                  title: "Form published",
                  description: "Your form is now publicly accessible",
                  action: (
                    <Button variant="outline" size="sm" onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/f/${formData.form_id}`);
                      toast({
                        description: "Share link copied to clipboard",
                      });
                    }}>
                      Copy Link
                    </Button>
                  ),
                });
              } catch (error) {
                console.error("Error publishing form:", error);
                toast({
                  variant: "destructive",
                  title: "Publishing failed",
                  description: "There was an error publishing your form.",
                });
              } finally {
                setIsPublishing(false);
              }
            }}
          >
            {isPublishing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Globe size={16} />
                Publish
              </>
            )}
          </Button>
        </div>
      </header>
      
      {/* Main content area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left sidebar - list of blocks */}
        <FormBuilderSidebar />
        
        {/* Main content - single block slide */}
        <FormBuilderContent />
        
        {/* Right settings panel - block settings */}
        <FormBuilderSettings />
        
        {/* Block selector dialog */}
        <FormBuilderBlockSelector />
      </main>
    </div>
  )
}
