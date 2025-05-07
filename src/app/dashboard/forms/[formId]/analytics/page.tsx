"use client"

import { useParams } from "next/navigation"
import { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useForm } from "@/hooks/useForm"

import { VersionedResponsesTable } from "@/components/analytics/versioned-responses-table"
import { useVersionedFormResponses } from "@/hooks/useVersionedAnalyticsData"
import { FormAnalyticsDashboard } from "@/components/analytics/form-analytics-dashboard"
import { BasicMetricsCard } from "@/components/analytics/basic-metrics-card"
import { FormInsights } from "@/components/analytics/form-insights"

// Component to display responses with versioning support
function ResponsesWithVersioningSupport({ formId }: { formId: string }) {
  const {
    responses,
    versions,
    loading,
    error
  } = useVersionedFormResponses(formId);

  // State for version selection
  const [selectedVersionId, setSelectedVersionId] = useState<string | 'all'>('all');

  // Check if the form has multiple versions
  const hasMultipleVersions = versions.length > 1;

  // Filter responses based on selected version
  const filteredResponses = useMemo(() => {
    if (selectedVersionId === 'all') return responses;
    return responses.filter(r => r.form_version?.id === selectedVersionId);
  }, [responses, selectedVersionId]);

  // Get the selected version number for display
  const selectedVersionNumber = useMemo(() => {
    if (selectedVersionId === 'all') return null;
    const version = versions.find(v => v.id === selectedVersionId);
    return version?.version_number || null;
  }, [selectedVersionId, versions]);

  return (
    <div className="space-y-4">
      {hasMultipleVersions && (
        <div className="flex flex-col space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Form Versions</h3>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                {versions.length} versions detected
              </span>
            </div>
          </div>
          
          {/* Version selector */}
          <div className="inline-flex items-center p-0.5 rounded-md bg-muted text-sm">
            <button
              onClick={() => setSelectedVersionId('all')}
              className={cn(
                "px-3 py-1.5 rounded-sm transition-all",
                selectedVersionId === 'all' 
                  ? "bg-background shadow-sm" 
                  : "hover:bg-background/50"
              )}
            >
              All Versions
            </button>
            
            {versions.map(version => (
              <button
                key={version.id}
                onClick={() => setSelectedVersionId(version.id)}
                className={cn(
                  "px-3 py-1.5 rounded-sm transition-all",
                  selectedVersionId === version.id 
                    ? "bg-background shadow-sm" 
                    : "hover:bg-background/50"
                )}
              >
                v{version.version_number}
              </button>
            ))}
          </div>
          
          {/* Additional context about current view */}
          <div className="text-xs text-muted-foreground">
            {selectedVersionId === 'all' 
              ? `Showing all responses across ${versions.length} versions` 
              : `Showing responses from version ${selectedVersionNumber}`}
          </div>
        </div>
      )}

      {error ? (
        <div className="p-8 text-center text-destructive">
          Error loading responses: {error.message}
        </div>
      ) : (
        <VersionedResponsesTable
          responses={filteredResponses}
          loading={loading}
          selectedVersionId={selectedVersionId}
        />
      )}
    </div>
  );
}

export default function FormAnalyticsPage() {
  const params = useParams()
  const formId = params.formId as string
  
  const { form, isLoading, error } = useForm(formId)

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
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
                  <BreadcrumbLink href={`/dashboard/forms/builder/${formId}`}>
                    {form?.title || "Form"}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Analytics</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">
            {isLoading ? "Loading..." : form?.title || "Form Analytics"}
          </h1>
          <p className="text-muted-foreground mt-1">
            View and analyze form responses and metrics
          </p>
        </div>

        {isLoading ? (
          <div className="w-full p-12 text-center">Loading form data...</div>
        ) : error ? (
          <div className="w-full p-12 text-center text-destructive">
            Error loading form: {error}
          </div>
        ) : !form ? (
          <div className="w-full p-12 text-center">Form not found</div>
        ) : (
          <Card className="p-4">
            <Tabs defaultValue="responses" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="responses">Responses</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="summary" disabled>Summary</TabsTrigger>
              </TabsList>
              
              <TabsContent value="responses" className="mt-0">
                <ResponsesWithVersioningSupport formId={formId} />
              </TabsContent>
              
              <TabsContent value="insights" className="space-y-8">
                {/* New Form Insights Component */}
                <FormInsights formId={formId} />
                
                {/* Legacy metrics cards */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Legacy Analytics</h3>
                  <BasicMetricsCard formId={String(params.formId)} />
                </div>
                
                {/* Additional dashboard components */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Detailed Analytics</h3>
                  <FormAnalyticsDashboard formId={formId} />
                </div>
              </TabsContent>
              
              <TabsContent value="summary">
                <div className="text-center p-12 text-muted-foreground">
                  Summary coming soon
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        )}
      </div>
    </div>
  )
}
