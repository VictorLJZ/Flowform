"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Send } from "lucide-react"
import { FormRecord, QuestionRecord } from "@/types/supabase-types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

export default function FormSessionPage() {
  const params = useParams()
  const formId = params.formId as string
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<FormRecord | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<string>("")
  const [userAnswer, setUserAnswer] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [conversation, setConversation] = useState<{question: string, answer: string}[]>([])
  const [completed, setCompleted] = useState(false)
  
  // Fetch form and initialize session
  useEffect(() => {
    async function initializeForm() {
      try {
        setLoading(true)
        // Fetch form data
        const formResponse = await fetch(`/api/forms/${formId}`)
        if (!formResponse.ok) {
          throw new Error('Failed to load form')
        }
        const formData = await formResponse.json()
        setForm(formData.form)
        
        // Initialize a new session
        const sessionResponse = await fetch(`/api/forms/${formId}/sessions`, {
          method: 'POST',
        })
        if (!sessionResponse.ok) {
          throw new Error('Failed to start form session')
        }
        const sessionData = await sessionResponse.json()
        setSessionId(sessionData.sessionId)
        setCurrentQuestion(sessionData.starterQuestion)
      } catch (error) {
        console.error('Error initializing form:', error)
        toast({
          title: "Error",
          description: "Failed to load the form. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    if (formId) {
      initializeForm()
    }
  }, [formId, toast])
  
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || !sessionId) return
    
    try {
      setIsSubmitting(true)
      
      // Add current question and answer to conversation history
      setConversation([...conversation, {
        question: currentQuestion,
        answer: userAnswer
      }])
      
      // Submit the answer and get the next question
      const response = await fetch(`/api/forms/${formId}/sessions/${sessionId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answer: userAnswer })
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit answer')
      }
      
      const data = await response.json()
      
      // Check if this was the last question
      if (data.isLastQuestion) {
        setCompleted(true)
      } else {
        // Set the next question
        setCurrentQuestion(data.nextQuestion)
      }
      
      // Clear answer field
      setUserAnswer("")
    } catch (error) {
      console.error('Error submitting answer:', error)
      toast({
        title: "Error",
        description: "Failed to submit your answer. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }
  
  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-destructive mb-2">Form Not Found</h2>
          <p className="text-muted-foreground">This form may have been removed or is no longer available.</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b py-4">
        <div className="container max-w-3xl mx-auto px-4">
          <h1 className="text-2xl font-semibold">{form.title}</h1>
          {form.description && (
            <p className="text-muted-foreground mt-1">{form.description}</p>
          )}
        </div>
      </header>
      
      <main className="flex-1 container max-w-3xl mx-auto px-4 py-8">
        {completed ? (
          <div className="bg-card rounded-xl p-8 shadow-sm border text-center">
            <h2 className="text-2xl font-medium mb-4">Thank you for your responses!</h2>
            <p className="text-muted-foreground mb-6">Your answers have been submitted successfully.</p>
            <div className="mt-8">
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Start a New Session
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Previous conversation */}
            {conversation.length > 0 && (
              <div className="mb-8 space-y-6">
                {conversation.map((exchange, index) => (
                  <div key={index} className="space-y-4">
                    <div className="bg-primary/5 rounded-lg p-4">
                      <p className="text-sm font-medium mb-1">Question:</p>
                      <p>{exchange.question}</p>
                    </div>
                    <div className="bg-secondary/40 rounded-lg p-4 ml-6">
                      <p className="text-sm font-medium mb-1">Your answer:</p>
                      <p>{exchange.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Current question */}
            <div className="bg-primary/5 rounded-lg p-5 mb-4">
              <p className="text-sm font-medium mb-1">Question:</p>
              <p className="text-lg">{currentQuestion}</p>
            </div>
            
            <div className="space-y-4">
              <Textarea
                placeholder="Type your answer here..."
                className="min-h-[120px] resize-none"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={isSubmitting}
              />
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Continue
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
      
      <footer className="border-t py-4">
        <div className="container max-w-3xl mx-auto px-4 text-center text-xs text-muted-foreground">
          Powered by FlowForm | {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  )
}
