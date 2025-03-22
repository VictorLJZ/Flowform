"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { useFormBuilderStore } from "@/stores/form-builder-store"

export default function AIFormBuilderPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const { 
    config, 
    status, 
    error, 
    formId,
    setConfig, 
    createForm 
  } = useFormBuilderStore()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createForm()
  }
  
  // Handle form completion and redirect
  if (status === 'success' && formId) {
    toast({
      title: "Form created successfully!",
      description: "Your AI-generated form is ready to view.",
    })
    
    // Reset and redirect to the new form
    setTimeout(() => {
      router.push(`/dashboard/forms/edit/${formId}`)
    }, 500)
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">AI Form Generator</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Configuration</CardTitle>
              <CardDescription>
                Configure how the AI should generate your form. Be specific with your instructions for better results.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 text-sm bg-destructive/15 text-destructive rounded-md">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="starterQuestion">Starter Question</Label>
                  <Input 
                    id="starterQuestion"
                    placeholder="What's your favorite hobby and why do you enjoy it?"
                    value={config.starterQuestion}
                    onChange={(e) => setConfig({ starterQuestion: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">The first question that will be asked in your form.</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instructions">Form Instructions</Label>
                  <Textarea 
                    id="instructions"
                    placeholder="Create a conversational form that explores the person's interests and hobbies in depth..."
                    className="min-h-[120px]"
                    value={config.instructions}
                    onChange={(e) => setConfig({ instructions: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">Guide the AI on what kind of form to create and what information to collect.</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="temperature">Creativity Level</Label>
                    <span className="text-sm text-muted-foreground">{config.temperature.toFixed(1)}</span>
                  </div>
                  <Slider
                    id="temperature"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[config.temperature]}
                    onValueChange={(values: number[]) => setConfig({ temperature: values[0] })}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Focused</span>
                    <span>Creative</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxQuestions">Maximum Questions</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setConfig({ maxQuestions: Math.max(1, config.maxQuestions - 1) })}
                    >
                      -
                    </Button>
                    <div className="w-12 text-center">{config.maxQuestions}</div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setConfig({ maxQuestions: Math.min(20, config.maxQuestions + 1) })}
                    >
                      +
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">The total number of questions in your form.</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Form...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate AI Form
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>
                The AI form generator creates dynamic, conversational forms based on your specifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium text-sm">1. Configure Your Form</h3>
                <p className="text-sm text-muted-foreground">
                  Specify a starter question and provide detailed instructions about the purpose of your form.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium text-sm">2. Adjust Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Set the creativity level and maximum number of questions based on your needs.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium text-sm">3. Generate Your Form</h3>
                <p className="text-sm text-muted-foreground">
                  The AI will create a dynamic form that adapts questions based on previous answers.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium text-sm">4. Customize If Needed</h3>
                <p className="text-sm text-muted-foreground">
                  After generation, you can further refine the questions before publishing your form.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start space-y-2">
              <h3 className="font-medium text-sm">Example Use Cases</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Customer feedback surveys</li>
                <li>Job application questionnaires</li>
                <li>User research interviews</li>
                <li>Product discovery sessions</li>
                <li>Educational assessments</li>
              </ul>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
