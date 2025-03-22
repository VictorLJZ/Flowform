"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, FileText, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FormRecord, FormSession, QuestionRecord, AnswerRecord } from "@/types/supabase-types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

interface ResponseData {
  session: FormSession
  questions: QuestionRecord[]
  answers: AnswerRecord[]
}

export default function FormResponsesPage() {
  const params = useParams()
  const formId = params.formId as string
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<FormRecord | null>(null)
  const [responses, setResponses] = useState<ResponseData[]>([])
  
  useEffect(() => {
    async function fetchFormAndResponses() {
      try {
        setLoading(true)
        
        // Fetch the form data
        const formResponse = await fetch(`/api/forms/${formId}`)
        if (!formResponse.ok) {
          throw new Error('Failed to load form')
        }
        const formData = await formResponse.json()
        setForm(formData.form)
        
        // Fetch responses (this endpoint would need to be implemented)
        const responsesResponse = await fetch(`/api/forms/${formId}/responses`)
        if (!responsesResponse.ok) {
          throw new Error('Failed to load responses')
        }
        const responsesData = await responsesResponse.json()
        setResponses(responsesData.responses || [])
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Error",
          description: "Failed to load form responses. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    if (formId) {
      fetchFormAndResponses()
    }
  }, [formId, toast])
  
  const handleExportCSV = async () => {
    // This would be implemented to export responses as CSV
    toast({
      title: "Not implemented",
      description: "Export functionality will be added in a future update."
    })
  }
  
  const goBack = () => {
    router.push('/dashboard/forms')
  }
  
  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-40" />
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }
  
  if (!form) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Form Not Found</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>The requested form could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={goBack}>Return to Forms</Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">{form.title} Responses</h1>
        </div>
        
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
      
      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{responses.length}</CardTitle>
            <CardDescription>Total Responses</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">
              {new Date(form.created_at).toLocaleDateString()}
            </CardTitle>
            <CardDescription>Created On</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">
              {form.max_questions}
            </CardTitle>
            <CardDescription>Max Questions</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">
              {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
            </CardTitle>
            <CardDescription>Form Status</CardDescription>
          </CardHeader>
        </Card>
      </div>
      
      {responses.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="mb-2">No responses yet</CardTitle>
          <CardDescription className="mb-6">
            Share your form with others to start collecting responses
          </CardDescription>
          <Button 
            variant="outline" 
            onClick={() => router.push(`/dashboard/forms`)}
          >
            Back to Forms
          </Button>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Responses</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="incomplete">Incomplete</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="space-y-6">
              {responses.map((response, index) => (
                <Card key={response.session.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Response #{index + 1}</CardTitle>
                        <CardDescription>
                          Submitted on {new Date(response.session.created_at).toLocaleString()}
                        </CardDescription>
                      </div>
                      <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {response.session.completed ? 'Completed' : 'Incomplete'}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {response.questions.map((question, qIndex) => {
                        const answer = response.answers.find(a => a.question_id === question.id)
                        return (
                          <div key={question.id} className="space-y-2">
                            <div className="font-medium">
                              Q{qIndex + 1}: {question.content}
                            </div>
                            <div className="pl-4 border-l-2 border-muted">
                              {answer ? answer.content : 'No answer provided'}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            <div className="space-y-6">
              {responses
                .filter(r => r.session.completed)
                .map((response, index) => (
                  <Card key={response.session.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Response #{index + 1}</CardTitle>
                          <CardDescription>
                            Submitted on {new Date(response.session.created_at).toLocaleString()}
                          </CardDescription>
                        </div>
                        <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                          Completed
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {response.questions.map((question, qIndex) => {
                          const answer = response.answers.find(a => a.question_id === question.id)
                          return (
                            <div key={question.id} className="space-y-2">
                              <div className="font-medium">
                                Q{qIndex + 1}: {question.content}
                              </div>
                              <div className="pl-4 border-l-2 border-muted">
                                {answer ? answer.content : 'No answer provided'}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
          
          <TabsContent value="incomplete" className="mt-6">
            <div className="space-y-6">
              {responses
                .filter(r => !r.session.completed)
                .map((response, index) => (
                  <Card key={response.session.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Response #{index + 1}</CardTitle>
                          <CardDescription>
                            Started on {new Date(response.session.created_at).toLocaleString()}
                          </CardDescription>
                        </div>
                        <div className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500">
                          Incomplete
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {response.questions.map((question, qIndex) => {
                          const answer = response.answers.find(a => a.question_id === question.id)
                          return (
                            <div key={question.id} className="space-y-2">
                              <div className="font-medium">
                                Q{qIndex + 1}: {question.content}
                              </div>
                              <div className="pl-4 border-l-2 border-muted">
                                {answer ? answer.content : 'No answer provided'}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
