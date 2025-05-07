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
import { usePublishForm } from "@/hooks/usePublishForm"
import { getBlockDefinition } from "@/registry/blockRegistry"
import { mapFromDbBlockType } from '@/utils/blockTypeMapping'
import { BlockType } from '@/types/block-types'
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { FormData } from "@/types/form-builder-types"
import { FormTheme, defaultFormTheme } from "@/types/theme-types"
import FormBuilderSidebar from "./components/form-builder-sidebar"
import FormBuilderContent from "./components/form-builder-content"
import FormBuilderSettings from "./components/form-builder-settings"
import FormBuilderBlockSelector from "./components/form-builder-block-selector"
import WorkflowContent from "./components/workflow-content"
import { SidebarTrigger } from "@/components/ui/sidebar"
import ConnectContent from "./components/connect-content"

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
          console.log(`Auto-saving workflow state: ${connections.length} connections`);
          saveForm();
        }
      }, 30000); // Only save after 30 seconds of inactivity
    }
    
    return () => {
      if (saveTimer) clearTimeout(saveTimer);
    };
  }, [viewMode, saveForm, connections.length]); // Include connections.length since it's used in the effect
  
  // Load form data from API
  useEffect(() => {
    if (form) {
      console.log('🔄 FORM LOAD: Loading form data from API');
      
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
        settings: form.settings as FormData['settings'],
        theme: ensureValidTheme(form.theme),
      })
      
      // Transform blocks from API to our internal format
      if (form.blocks && Array.isArray(form.blocks)) {
        // Transform blocks from API format to our internal format
        const transformedBlocks = form.blocks.map((block, index) => {
          // Map database types to our frontend types
          const blockTypeId = mapFromDbBlockType(block.type || 'static', block.subtype || 'short_text');
          const blockDef = getBlockDefinition(blockTypeId);
          
          return {
            id: block.id,
            blockTypeId,
            type: block.type as BlockType,
            title: block.title || blockDef?.defaultTitle || '',
            description: block.description || '',
            required: !!block.required,
            order_index: block.order_index || index,
            settings: block.settings || {}
          }
        })
        
        setBlocks(transformedBlocks)
        
        // Set the first block as current
        if (transformedBlocks.length > 0) {
          setCurrentBlockId(transformedBlocks[0].id)
        }
      }
      
      // Process workflow connections from API response
      if (form.workflow_edges && Array.isArray(form.workflow_edges)) {
        console.log(`🔄 FORM LOAD: Processing ${form.workflow_edges.length} workflow connections from API`);
        
        // Transform workflow edges to our internal Connection format
        const connections = form.workflow_edges.map(edge => {
          // Determine condition type based on edge data
          const hasCondition = !!edge.condition_field;
          const conditionType = hasCondition ? 
            (edge.condition_type || 'conditional') : 
            (edge.condition_type || 'always');
          
          // Create the conditions array
          const conditions = [];
          
          // If there's a condition field, add it to the conditions array
          if (hasCondition) {
            conditions.push({
              id: edge.id + '-condition-1', // Generate a unique ID for the condition
              field: edge.condition_field,
              operator: edge.condition_operator as 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than',
              value: edge.condition_value
            });
          }
          
          // Try to parse conditions JSON if it exists
          if (edge.conditions) {
            try {
              const parsedConditions = typeof edge.conditions === 'string' ? 
                JSON.parse(edge.conditions) : edge.conditions;
              if (Array.isArray(parsedConditions)) {
                // Use the parsed conditions instead
                return {
                  id: edge.id,
                  sourceId: edge.source_block_id,
                  targetId: edge.target_block_id,
                  order_index: edge.order_index || 0,
                  conditionType: conditionType as 'always' | 'conditional' | 'fallback',
                  conditions: parsedConditions
                };
              }
            } catch (e) {
              console.warn('Failed to parse condition_json:', e);
            }
          }
          
          // Return the standardized connection format
          return {
            id: edge.id,
            sourceId: edge.source_block_id,
            targetId: edge.target_block_id,
            order_index: edge.order_index || 0,
            conditionType: conditionType as 'always' | 'conditional' | 'fallback',
            conditions: conditions
          };
        });
        
        // Set connections in the store
        setConnections(connections);
        console.log(`🔄 FORM LOAD: Set ${connections.length} connections in store`);
      } else {
        console.log('🔄 FORM LOAD: No workflow connections found in API response');
      }
    }
  }, [form, setFormData, setBlocks, setCurrentBlockId, setConnections])
  
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
          published_at: result.form.published_at || undefined
        })
      }
      
      // Refresh form data
      mutate()
      
      toast({
        title: "Form published!",
        description: result.version 
          ? `Version ${result.version.version_number} created.` 
          : "Your form is now live.",
      })
    } catch (error) {
      console.error('Error publishing form:', error)
      toast({
        variant: "destructive",
        title: "Publish failed",
        description: "There was an error publishing your form. Please try again.",
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
  if (isLoading && !formData.form_id) {
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
                <BreadcrumbLink href="/dashboard/forms">Forms</BreadcrumbLink>
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
