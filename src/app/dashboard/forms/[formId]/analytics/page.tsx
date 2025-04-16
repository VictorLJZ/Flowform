"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
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
import { Separator } from "@/components/ui/separator"
import { useFormStore } from "@/stores/formStore"

import { ResponsesTable } from "@/components/analytics/responses-table"

export default function FormAnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.formId as string
  
  const { fetchFormById, currentForm, isLoading, error } = useFormStore()

  useEffect(() => {
    if (formId) {
      fetchFormById(formId)
    }
  }, [formId, fetchFormById])

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
                    {currentForm?.title || "Form"}
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
            {isLoading ? "Loading..." : currentForm?.title || "Form Analytics"}
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
        ) : !currentForm ? (
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
                <ResponsesTable formId={formId} />
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
