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
import { useFormStore } from "@/stores/formStore"
import { useToast } from "@/components/ui/use-toast"
import FormBuilderSidebar from "./components/form-builder-sidebar"
import FormBuilderContent from "./components/form-builder-content"
import FormBuilderSettings from "./components/form-builder-settings"
import FormBuilderBlockSelector from "./components/form-builder-block-selector"

export default function FormBuilderPage() {
  const params = useParams()
  const formId = params.formId as string
  
  const { 
    loadForm, 
    isLoading, 
    isSaving,
    formData,
    saveForm
  } = useFormBuilderStore()
  
  const { publishForm } = useFormStore()
  const { toast } = useToast()
  const [isPublishing, setIsPublishing] = useState(false)
  
  // Load form data on mount
  useEffect(() => {
    loadForm(formId)
  }, [formId, loadForm])
  
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
                setIsPublishing(true);
                const success = await publishForm(formData.form_id);
                
                if (success) {
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
                }
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
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={30} className="animate-spin mx-auto mb-4 text-primary" />
            <p className="font-medium">Loading form...</p>
            <p className="text-sm text-muted-foreground mt-1">Preparing your form builder</p>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  )
}
