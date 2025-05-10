"use client"

import { useParams } from 'next/navigation';
import { useForm } from '@/hooks/useForm';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormInsightsChatbot } from '@/components/analytics/FormInsightsChatbot';

// Placeholder for FormInsights
function FormInsights({ formId }: { formId: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Form Insights</h3>
      <p className="text-muted-foreground">
        Insights for form {formId} would be displayed here.
      </p>
    </div>
  );
}

// Placeholder for QuestionMetrics
function QuestionMetrics({ formId }: { formId: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Question Metrics</h3>
      <p className="text-muted-foreground">
        Metrics for individual questions in form {formId} would be displayed here.
      </p>
    </div>
  );
}

// Placeholder for ResponsesWithVersioningSupport
function ResponsesWithVersioningSupport({ formId }: { formId: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Form Responses</h3>
      <p className="text-muted-foreground">
        Responses for form {formId} would be displayed here.
      </p>
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

      <div className="flex-1 space-y-4 p-6">
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
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="responses">Responses</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="chat">Chat with Data</TabsTrigger>
              <TabsTrigger value="summary" disabled>Summary</TabsTrigger>
            </TabsList>
              
            <TabsContent value="responses" className="mt-0 bg-white border rounded-md">
              <div className="p-4">
                <ResponsesWithVersioningSupport formId={formId} />
              </div>
            </TabsContent>
            
            <TabsContent value="insights" className="mt-0">
              {/* Form Insights Component */}
              <div className="bg-white border rounded-md p-6 mb-6">
                <FormInsights formId={formId} />
              </div>
              
              {/* Question by Question metrics */}
              <div className="bg-white border rounded-md p-6">
                <QuestionMetrics formId={formId} />
              </div>
            </TabsContent>
            
            <TabsContent value="chat" className="mt-0 h-[70vh]">
              <FormInsightsChatbot formId={formId} />
            </TabsContent>
            
            <TabsContent value="summary" className="mt-0">
              <div className="text-center p-12 text-muted-foreground">
                Summary coming soon
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
