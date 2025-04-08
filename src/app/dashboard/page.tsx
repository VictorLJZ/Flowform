"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWorkspaceStore } from "@/stores/workspaceStore"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { BarChart3, FileText, PlusCircle, Users, AlertCircle } from "lucide-react"
import { useDashboardStore } from "@/stores/dashboard-store"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

export default function Page() {
  const router = useRouter()
  const { stats, recentActivity, recentForms, isLoading, error, fetchDashboardData } = useDashboardStore()
  const { currentWorkspace } = useWorkspaceStore()
  
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])
  
  const handleCreateForm = () => {
    router.push('/dashboard/builder/new')
  }
  
  const handleViewResponses = (formId: string) => {
    router.push(`/dashboard/forms/${formId}/responses`)
  }
  
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">{currentWorkspace?.name || "Dashboard"}</h1>
            <Button onClick={handleCreateForm}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Form
            </Button>
          </div>
          
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 mb-6 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p>Error loading dashboard data: {error}</p>
            </div>
          )}
          
          <div className="grid auto-rows-min gap-6 md:grid-cols-3">
            {isLoading ? (
              <>
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </>
            ) : (
              <>
                <div className="bg-card rounded-xl p-6 shadow-sm border flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Forms</p>
                    <h3 className="text-3xl font-bold mt-1">{stats.totalForms}</h3>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-6 shadow-sm border flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Responses</p>
                    <h3 className="text-3xl font-bold mt-1">{stats.totalResponses}</h3>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-6 shadow-sm border flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Active Users</p>
                    <h3 className="text-3xl font-bold mt-1">ONE TRILLION USERS</h3>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3 md:grid-rows-2">
             <div className="bg-card rounded-xl p-6 shadow-sm border md:col-span-2 md:row-span-2">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="bg-secondary p-2 rounded">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{item.form_title}</p>
                          <p className="text-sm text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-sm rounded-full bg-secondary px-2 py-1"
                        onClick={() => handleViewResponses(item.form_id)}
                      >
                        {item.completed ? "Completed" : "In Progress"}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              )}
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Recent Forms</h2>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  ))}
                </div>
              ) : recentForms.length > 0 ? (
                <div className="space-y-3">
                  {recentForms.map((form) => (
                    <div key={form.id} className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="cursor-pointer hover:text-primary" onClick={() => handleViewResponses(form.id)}>
                        {form.title}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No forms yet</p>
                </div>
              )}
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button 
                  className="w-full text-left flex items-center gap-2 p-2 hover:bg-secondary rounded-md transition-colors"
                  onClick={handleCreateForm}
                >
                  <PlusCircle className="h-4 w-4" /> New Form
                </button>
                {recentForms.length > 0 && (
                  <button 
                    className="w-full text-left flex items-center gap-2 p-2 hover:bg-secondary rounded-md transition-colors"
                    onClick={() => handleViewResponses(recentForms[0].id)}
                  >
                    <FileText className="h-4 w-4" /> View Latest Responses
                  </button>
                )}
                <button className="w-full text-left flex items-center gap-2 p-2 hover:bg-secondary rounded-md transition-colors">
                  <Users className="h-4 w-4" /> Team Sharing
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}
