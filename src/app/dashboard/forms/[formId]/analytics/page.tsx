"use client"

import { useParams } from "next/navigation"
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
import { useForm } from "@/hooks/useForm"

import { VersionedResponsesTable } from "@/components/analytics/versioned-responses-table"
import { useVersionedFormResponses } from "@/hooks/useVersionedAnalyticsData"

// Component to display responses with versioning support
function ResponsesWithVersioningSupport({ formId }: { formId: string }) {
  const {
    responses,
    versions,
    loading,
    error
  } = useVersionedFormResponses(formId);

  // Check if the form has multiple versions
  const hasMultipleVersions = versions.length > 1;

  return (
    <div className="space-y-4">
      {hasMultipleVersions && (
        <div className="bg-muted/50 rounded-md p-4 mb-4">
          <div className="flex items-center">
            <div className="mr-2">
              <span className="text-sm font-medium">Form Versions:</span>
              <span className="ml-2 text-sm text-muted-foreground">
                This form has {versions.length} versions. Responses are shown with their corresponding form version.
              </span>
            </div>
          </div>
        </div>
      )}

      {error ? (
        <div className="p-8 text-center text-destructive">
          Error loading responses: {error.message}
        </div>
      ) : (
        <VersionedResponsesTable
          responses={responses}
          loading={loading}
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
                <TabsTrigger value="summary" disabled>
                  Summary
                </TabsTrigger>
                <TabsTrigger value="insights" disabled>
                  Insights
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="responses" className="mt-0">
                <ResponsesWithVersioningSupport formId={formId} />
              </TabsContent>
              
              <TabsContent value="summary">
                <div className="text-center p-12 text-muted-foreground">
                  Summary analytics coming soon
                </div>
              </TabsContent>
              
              <TabsContent value="insights">
                <div className="text-center p-12 text-muted-foreground">
                  AI-powered insights coming soon
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        )}
      </div>
    </div>
  )
}
