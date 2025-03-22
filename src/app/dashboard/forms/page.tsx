"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FileText, Plus, Edit, Eye, Trash2, Share2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { FormRecord } from "@/types/supabase-types"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

export default function FormsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [forms, setForms] = useState<FormRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchForms() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/forms')
        
        if (!response.ok) {
          throw new Error('Failed to fetch forms')
        }
        
        const data = await response.json()
        setForms(data.forms || [])
      } catch (error) {
        console.error('Error fetching forms:', error)
        toast({
          title: "Error",
          description: "Failed to load forms. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchForms()
  }, [])

  const handleCreateForm = () => {
    router.push('/dashboard/builder/new')
  }

  const handleDeleteForm = async (formId: string) => {
    // This would be implemented to delete a form
    toast({
      title: "Not implemented",
      description: "Form deletion functionality will be added in a future update."
    })
  }
  
  const getFormShareUrl = (formId: string) => {
    // Create a public URL for the form
    const baseUrl = window.location.origin
    return `${baseUrl}/f/${formId}`
  }
  
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Link copied!",
      description: "The form link has been copied to your clipboard."
    })
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Forms</h1>
        <Button onClick={handleCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Form
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : forms.length === 0 ? (
        <div className="bg-card rounded-xl p-8 shadow-sm border flex flex-col items-center justify-center text-center h-64">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No forms yet</h3>
          <p className="text-muted-foreground mb-6">Create your first conversational form to get started</p>
          <Button onClick={handleCreateForm}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Form
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {forms.map((form) => (
            <Card key={form.id} className="flex flex-col h-full overflow-hidden py-4">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-medium">{form.title}</h3>
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                  {form.description || 'No description provided'}
                </p>
                <div className="flex flex-col gap-1 text-xs text-muted-foreground mt-4">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium">{form.status || 'Active'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{new Date(form.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Questions:</span>
                    <span>{form.max_questions}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="mt-auto pt-3 flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => router.push(`/dashboard/builder/edit/${form.id}`)}
                >
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => router.push(`/dashboard/forms/${form.id}/responses`)}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Responses
                </Button>
                
                <div className="w-full flex gap-2 mt-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                      >
                        <Share2 className="h-3.5 w-3.5 mr-1" />
                        Share
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <h4 className="font-medium">Share Form</h4>
                        <p className="text-sm text-muted-foreground">Anyone with this link can fill out your form</p>
                        <div className="flex">
                          <Input 
                            readOnly 
                            value={getFormShareUrl(form.id)} 
                            className="flex-1 pr-12 font-mono text-xs"
                          />
                          <Button 
                            className="-ml-10" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleCopyToClipboard(getFormShareUrl(form.id))}
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteForm(form.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
