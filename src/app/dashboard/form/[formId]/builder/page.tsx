"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ApiBlock } from "@/types/block/ApiBlock"
import { dbToApiBlocks } from "@/utils/type-utils/block/DbToApiBlock"
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
import { usePublishForm } from "@/hooks/usePublishForm"
import { getBlockDefinition } from "@/registry/blockRegistry"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { CustomFormData } from "@/types/form-builder-types"
import { FormTheme, defaultFormTheme } from "@/types/theme-types"
// Updated to use new type system
import FormBuilderSidebar from "@/components/form/builder/form-builder-sidebar"
import FormBuilderContent from "@/components/form/builder/form-builder-content"
import FormBuilderSettings from "@/components/form/builder/form-builder-settings"
import FormBuilderBlockSelector from "@/components/form/builder/form-builder-block-selector"
import WorkflowContent from "@/components/workflow/builder/workflow-content"
import { SidebarTrigger } from "@/components/ui/sidebar"
import ConnectContent from "@/components/form/connect/connect-content"
import { Rule } from '@/types/workflow-types';
import { ToastAction } from "@/components/ui/toast"; // Added ToastAction import

// Wrapper that provides an isolated store per formId
export default function FormBuilderPage() {
  const params = useParams()
  const formId = params.formId as string
  return <FormBuilderPageContent formId={formId} />
}

interface FormBuilderPageContentProps {
  formId: string;
}

function FormBuilderPageContent({ formId }: FormBuilderPageContentProps) {
  // Select state slices individually to prevent infinite loops
  const isSaving = useFormBuilderStore(state => state.isSaving);
  const formData = useFormBuilderStore(state => state.formData);
  const saveForm = useFormBuilderStore(state => state.saveForm);
  const setFormData = useFormBuilderStore(state => state.setFormData);
  const setBlocks = useFormBuilderStore(state => state.setBlocks);
  const setCurrentBlockId = useFormBuilderStore(state => state.setCurrentBlockId);
  const connections = useFormBuilderStore(state => state.connections);
  const setConnections = useFormBuilderStore(state => state.setConnections);
  
  const { form, isLoading, error, mutate } = useForm(formId)
  const { toast } = useToast()
  const { publishCurrentForm, isPublishing } = usePublishForm()
  
  // Update viewMode state
  const [viewMode, setViewMode] = useState<"form" | "workflow" | "connect">("form")
  
  // Replace aggressive auto-save with a much less frequent one
  useEffect(() => {
    // Only save if there are more than 5 connections and we've been on the page for a while
    // This prevents frequent saving during initial setup
    let saveTimer: NodeJS.Timeout | null = null;
    
    if (viewMode === "workflow") {
      // Wait until user has had time to make multiple changes
      saveTimer = setTimeout(() => {
        // Only save if we're still in workflow view
        if (viewMode === "workflow") {
          saveForm();
        }
      }, 30000); // Only save after 30 seconds of inactivity
    }
    
    return () => {
      if (saveTimer) clearTimeout(saveTimer);
    };
  }, [viewMode, saveForm, connections.length, formId]); // Include connections.length since it's used in the effect
  
  // Load form data from API
  useEffect(() => {
    if (form) {
      
      // Helper function to ensure we have a valid FormTheme
      const ensureValidTheme = (themeData: Record<string, unknown> | null): FormTheme => {
        if (!themeData) return defaultFormTheme;
        
        // Check if theme has required properties
        const hasRequiredProps = 
          themeData.colors && 
          themeData.typography && 
          themeData.layout;
          
        if (!hasRequiredProps) return defaultFormTheme;
        
        // Return as FormTheme since it has required properties
        return themeData as unknown as FormTheme;
      };
      
      // Set form data
      setFormData({
        form_id: form.form_id,
        title: form.title || 'Untitled Form',
        description: form.description || '',
        workspace_id: form.workspace_id,
        created_by: form.created_by,
        status: form.status || 'draft',
        published_at: form.published_at || undefined,
        settings: form.settings as CustomFormData['settings'],
        theme: ensureValidTheme(form.theme),
      })
      
      // Transform blocks from DB format to API format
      // This ensures we have proper camelCase properties throughout
      const apiBlocks = dbToApiBlocks(form.blocks || []);
      
      // Ensure each block has the formId property required by ApiBlock
      // Map the API blocks with the formId and other required properties
      const parsedBlocks = apiBlocks.map((block: ApiBlock) => {
        // Handle both old and new block formats
        // In legacy format, block might have type but not subtype
        // In new format, block will have both type and subtype
        
        // Determine the appropriate blockTypeId
        // For newer blocks, use subtype; for legacy blocks, fallback to type
        const blockTypeId = block.subtype || block.type || 'static';
        
        // Get the block definition
        const blockDef = getBlockDefinition(blockTypeId);
        
        // Set the block type based on available data or defaults
        const blockType = block.type || (blockTypeId === 'ai_conversation' ? 'dynamic' : 
                         blockTypeId === 'hubspot' ? 'integration' : 
                         (blockTypeId === 'page_break' || blockTypeId === 'redirect') ? 'layout' : 
                         'static');
                         
        // Fixed property mapping - ensure all required fields have values
        return {
          id: block.id,
          formId: formId, // Add the formId to meet ApiBlock requirements
          blockTypeId: blockTypeId, // Ensure this is always a string
          type: blockType, // Always has a value
          subtype: blockTypeId, // Use the same value for consistency 
          title: block.title || blockDef?.defaultTitle || '',
          description: block.description || undefined, // Ensure undefined instead of null
          required: block.required !== undefined ? block.required : false,
          orderIndex: block.orderIndex || 0, // Now using only camelCase
          settings: block.settings || {},
          // Add timestamp fields for completeness
          createdAt: block.createdAt || new Date().toISOString(),
          updatedAt: block.updatedAt || new Date().toISOString()
        };
      });
      
      setBlocks(parsedBlocks)
      
      // Set the first block as current
      if (parsedBlocks.length > 0) {
        setCurrentBlockId(parsedBlocks[0].id)
      }
      
      // Process workflow connections from API response
      if (form.workflow_edges && Array.isArray(form.workflow_edges)) {
        
        // Transform workflow edges to our internal Connection format
        const connections = form.workflow_edges.map((edge: { 
          id: string; 
          source_id: string; 
          target_id: string; 
          source_handle?: string; 
          target_handle?: string; 
          rules?: string;
          source_block_id?: string;
          default_target_id?: string;
          is_explicit?: boolean;
          order_index?: number;
        }) => {
          let parsedRules: Rule[] = [];
          if (edge.rules) { // edge.rules is the JSON string from the DB
            try {
              const rulesFromEdge = JSON.parse(edge.rules);
              if (Array.isArray(rulesFromEdge)) {
                // Basic validation: check if objects have essential Rule properties
                parsedRules = rulesFromEdge.filter(
                  (r: Partial<Rule>) => r.id && r.target_block_id && r.condition_group
                ) as Rule[];
              } else {
                console.warn(`Parsed edge.rules for edge ${edge.id} is not an array:`, rulesFromEdge);
              }
            } catch (e) {
              console.warn(`Failed to parse edge.rules JSON for edge ${edge.id}:`, e, "Raw edge.rules:", edge.rules);
            }
          }

          // Return the standardized connection format adhering to the Connection interface
          return {
            id: edge.id,
            sourceId: edge.source_block_id || '', // Ensure sourceId is never undefined
            defaultTargetId: edge.default_target_id || null, // Ensure it's null if undefined
            is_explicit: edge.is_explicit || false, // Default to false if undefined
            rules: parsedRules, 
            order_index: edge.order_index || 0
          };
        });
        
        // Set connections in the store
        setConnections(connections);
      } else {
        
      }
    }
  }, [form, setFormData, setBlocks, setCurrentBlockId, setConnections, formId])
  
  const handlePublish = async () => {
    if (isPublishing) return
    
    try {
      // First save the form to ensure all changes are persisted
      await saveForm()
      
      // Then publish using our new centralized hook (which uses blocks from store)
      const result = await publishCurrentForm(formId)
      
      // Update the form data in state to reflect published status
      if (result.form) {
        setFormData({
          status: 'published',
          published_at: result.form.publishedAt || undefined
        })
      }
      
      // Refresh form data
      mutate()
      
      const shareableLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/f/${formId}`;

      toast({
        title: "Form published!",
        description: result.version 
          ? `Version ${result.version.versionNumber} created.` 
          : "Your form is now live.",
        action: (
          <ToastAction
            altText="Copy link"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(shareableLink);
                toast({
                  description: "Link copied to clipboard!",
                  duration: 2000,
                });
              } catch (copyError) {
                console.error('Failed to copy link:', copyError);
                toast({
                  variant: "destructive",
                  title: "Failed to copy link",
                  description: "Could not copy link to clipboard.",
                });
              }
            }}
          >
            Copy Link
          </ToastAction>
        ),
      });
    } catch (error) {
      console.error('Error publishing form:', error)
      toast({
        variant: "destructive",
        title: "Error Publishing Form",
        description: (error as Error)?.message || "An unknown error occurred.",
      })
    }
  }
  
  // Display error state
  if (error && !isLoading) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Error loading form</AlertTitle>
          <AlertDescription>
            There was an error loading the form. Please try again or contact support.
          </AlertDescription>
        </Alert>
      </div>
    )
  }
  
  // Display loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-1/4" />
        <div className="grid grid-cols-3 gap-4 mt-8">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }
  
  // Render form editor
  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="mr-2" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/workspace">Workspaces</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {formData.title || 'Untitled Form'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        {/* Center with view mode switch */}
        <div className="flex justify-center items-center w-1/3">
          <div className="flex h-9 items-center overflow-hidden rounded-full border bg-background p-1" style={{ width: "320px" }}>
            <button
              className={cn(
                "flex h-7 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors w-full",
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
                "flex h-7 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors w-full",
                viewMode === "workflow" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setViewMode("workflow")}
            >
              Workflow
            </button>
            <button
              className={cn(
                "relative flex h-7 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors w-full",
                viewMode === "connect" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setViewMode("connect")}
            >
              Connect
            </button>
          </div>
        </div>
        
        {/* Right side with action buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={saveForm}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-1" />
                Save
              </>
            )}
          </Button>
          
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={isPublishing || isSaving}
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
        ) : viewMode === "workflow" ? (
          /* Workflow UI */
          <WorkflowContent />
        ) : (
          /* Connect UI - now imported from separate file */
          <ConnectContent />
        )}
      </main>
    </div>
  )
}
