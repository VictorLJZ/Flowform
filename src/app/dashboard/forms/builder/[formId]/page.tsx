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
import { mapFromDbBlockType } from "@/utils/blockTypeMapping"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { publishFormWithFormBuilderStore } from "@/services/form/publishFormWithFormBuilderStore"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import FormBuilderSidebar from "./components/form-builder-sidebar"
import FormBuilderContent from "./components/form-builder-content"
import FormBuilderSettings from "./components/form-builder-settings"
import FormBuilderBlockSelector from "./components/form-builder-block-selector"
import WorkflowContent from "./components/workflow-content"
import { SidebarTrigger } from "@/components/ui/sidebar"

// Wrapper that provides an isolated store per formId
export default function FormBuilderPage() {
  const params = useParams()
  const formId = params.formId as string
  return <FormBuilderPageContent formId={formId} />
}

interface FormBuilderPageContentProps { formId: string }
function FormBuilderPageContent({ formId }: FormBuilderPageContentProps) {
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
  
  // Add state for view mode
  const [viewMode, setViewMode] = useState<"form" | "workflow">("form")
  
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
        // Use mapFromDbBlockType to get the correct blockTypeId for all block types
        // This properly handles mapping dynamic blocks to 'ai_conversation'
        const blockTypeId = mapFromDbBlockType(block.type || 'static', block.subtype || 'short_text');
        console.log('Block mapping in useEffect:', { 
          id: block.id,
          dbType: block.type, 
          dbSubtype: block.subtype,
          mappedBlockTypeId: blockTypeId 
        });
        
        // Get block definition using the mapped blockTypeId
        const def = getBlockDefinition(blockTypeId)
        
        // Prepare base settings from the block
        let settings = block.settings as Record<string, unknown> || {};
        
        // Special handling for dynamic blocks to merge dynamic_config
        if (block.type === 'dynamic' && block.dynamic_config) {
          console.log('Dynamic block config found in useEffect:', block.dynamic_config);
          const dynamicSettings = {
            startingPrompt: block.dynamic_config.starter_question || 'How can I help you today?',
            temperature: block.dynamic_config.temperature || 0.7,
            maxQuestions: block.dynamic_config.max_questions || 5,
            contextInstructions: block.dynamic_config.ai_instructions || ''
          };
          
          // Merge dynamic settings with any existing settings
          settings = {
            ...settings,
            ...dynamicSettings
          };
          console.log('Merged dynamic settings:', settings);
        }
        
        return {
          id: block.id,
          blockTypeId,
          type: def?.type || block.type || 'static', // Use the correct type
          title: block.title || def?.defaultTitle || '', // Ensure title is always string
          description: block.description || def?.defaultDescription || '',
          required: block.required,
          order: block.order_index,
          settings
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
      <header className="bg-background border-b px-4 py-3 flex items-center">
        {/* Left side with sidebar toggle and breadcrumbs */}
        <div className="flex items-center w-1/3">
          <SidebarTrigger className="mr-3" />
          
          <Breadcrumb>
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
        
        {/* Center section with toggle - will stay centered in content area */}
        <div className="flex justify-center items-center w-1/3">
          <div className="flex h-9 items-center overflow-hidden rounded-full border bg-background p-1" style={{ width: "240px" }}>
            <button
              className={cn(
                "flex h-7 items-center justify-center rounded-full px-6 text-sm font-medium transition-colors w-full",
                viewMode === "form" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setViewMode("form")}
            >
              Form
            </button>
            <button
              className={cn(
                "flex h-7 items-center justify-center rounded-full px-6 text-sm font-medium transition-colors w-full",
                viewMode === "workflow" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setViewMode("workflow")}
            >
              Workflow
            </button>
          </div>
        </div>
        
        {/* Right side with action buttons */}
        <div className="flex items-center justify-end gap-3 w-1/3">
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
                
                // Get current blocks from the store
                const blocks = useFormBuilderStore.getState().blocks;
                
                // Publish with versioning - this uses the current blocks in the UI
                const { version } = await publishFormWithFormBuilderStore(formData.form_id, blocks);
                
                await mutate()
                
                // Add version info to the toast
                const versionInfo = version ? ` (Version ${version.version_number})` : '';
                
                toast({
                  title: `Form published${versionInfo}`,
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
        {viewMode === "form" ? (
          <>
            {/* Form builder UI */}
            <FormBuilderSidebar />
            <FormBuilderContent />
            <FormBuilderSettings />
            <FormBuilderBlockSelector />
          </>
        ) : (
          /* Workflow UI */
          <WorkflowContent />
        )}
      </main>
    </div>
  )
}
