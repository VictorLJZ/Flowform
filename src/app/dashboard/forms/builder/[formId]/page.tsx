"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Loader2 } from "lucide-react"
import { useFormStore } from "@/stores/formStore"
import FormBuilderContent from "./components/form-builder-content"
import FormBuilderSettings from "./components/form-builder-settings"
import FormBuilderSidebar from "./components/form-builder-sidebar"

export default function FormBuilderPage() {
  const params = useParams()
  const formId = params.formId as string
  const { fetchFormById, currentForm, isLoading } = useFormStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    // Initial loading state
    setPageLoading(true)
    
    // Simulating form initialization delay
    const loadingTimeout = setTimeout(() => {
      setPageLoading(false)
    }, 1000)
    
    if (formId !== "new") {
      fetchFormById(formId)
    }
    
    return () => clearTimeout(loadingTimeout)
  }, [formId, fetchFormById])

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
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard/forms">Forms</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {formId === "new" ? "New Form" : currentForm?.title || "Form Builder"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {pageLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Preparing form builder...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Left sidebar - collapsed by default */}
            <FormBuilderSidebar 
              isOpen={sidebarOpen} 
              onToggle={() => setSidebarOpen(!sidebarOpen)} 
            />

            {/* Main content */}
            <FormBuilderContent />

            {/* Right settings panel */}
            <FormBuilderSettings />
          </>
        )}
      </div>
    </div>
  )
}
