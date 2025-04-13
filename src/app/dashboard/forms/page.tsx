"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, MoreHorizontal, Copy, ExternalLink, Trash } from "lucide-react"
import { useFormStore } from "@/stores/formStore"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function FormsPage() {
  const router = useRouter()
  const { fetchForms, forms, isLoading } = useFormStore()

  useEffect(() => {
    fetchForms()
  }, [])

  const handleCreateForm = async () => {
    try {
      // Create the form record first on the server
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          workspace_id: '00000000-0000-0000-0000-000000000000', // Default workspace UUID
          user_id: '00000000-0000-0000-0000-000000000000'       // Current user UUID
        })
      });
      
      const { form_id, error } = await response.json();
      
      if (error) {
        console.error('Error creating form:', error);
        return; // Add proper error handling/toast in production
      }
      
      // Navigate to the newly created form with a real UUID
      router.push(`/dashboard/forms/builder/${form_id}`);
    } catch (error) {
      console.error('Failed to create form:', error);
      // Show error notification in production
    }
  }

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
                <BreadcrumbLink href="/dashboard">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>My Forms</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6 pt-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My Forms</h1>
          <Button onClick={handleCreateForm}>
            <Plus className="mr-2 h-4 w-4" /> Create Form
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-pulse">Loading forms...</div>
          </div>
        ) : forms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forms.map((form) => (
              <Card key={form.id} className="overflow-hidden">
                <div className="bg-muted h-3" />
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="line-clamp-1">{form.title}</CardTitle>
                      <CardDescription className="mt-1 text-xs">Last edited: {new Date(form.updated_at).toLocaleDateString()}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/forms/builder/${form.id}`)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" /> Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card rounded-xl p-6 shadow-sm border">
            <div className="text-center py-8">
              <h2 className="text-lg font-semibold mb-2">No Forms Yet</h2>
              <p className="text-muted-foreground mb-4">Create your first form to get started</p>
              <Button onClick={handleCreateForm}>
                <Plus className="mr-2 h-4 w-4" /> Create Form
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
