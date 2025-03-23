"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { Send, ArrowUp, ChevronLeft, ChevronRight, CornerRightDown } from "lucide-react"
import { FormRecord, QuestionRecord } from "@/types/supabase-types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface ConversationItem {
  question: string
  answer: string
}

export default function FormSessionPage() {
  const params = useParams()
  const formId = params.formId as string
  const { toast } = useToast()
  
  // Refs
  const answerInputRef = useRef<HTMLTextAreaElement>(null)
  
  // State
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<FormRecord | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<string>("")
  const [userAnswer, setUserAnswer] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [conversation, setConversation] = useState<ConversationItem[]>([])
  const [completed, setCompleted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showHistory, setShowHistory] = useState(false)
  const [animation, setAnimation] = useState<'idle' | 'exit' | 'enter'>('idle')
  
  // Fetch form and initialize session
  // Focus input on load and after each question
  useEffect(() => {
    if (!loading && !completed && answerInputRef.current) {
      setTimeout(() => {
        answerInputRef.current?.focus()
      }, 300)
    }
  }, [loading, currentQuestion, completed])

  // Initialize form and session
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
        
        // Set initial progress (just the starter question)
        setProgress(1 / formData.form.max_questions * 100)
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
  
  // Handle keyboard submit with Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitAnswer()
    }
  }

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || !sessionId || isSubmitting) return
    
    try {
      setIsSubmitting(true)
      
      // Animate current question out
      setAnimation('exit')
      
      // Small delay for animation
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Add current question and answer to conversation history
      const newConversation = [...conversation, {
        question: currentQuestion,
        answer: userAnswer
      }]
      setConversation(newConversation)
      
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
      
      // Calculate new progress percentage
      if (form) {
        // Add 1 to account for the question we just answered
        const questionIndex = newConversation.length
        const progressPercentage = Math.min(
          (questionIndex / form.max_questions) * 100,
          100
        )
        setProgress(progressPercentage)
      }
      
      // Check if this was the last question
      if (data.isLastQuestion) {
        setCompleted(true)
      } else {
        // Set the next question and prepare animation
        setCurrentQuestion(data.nextQuestion)
        setAnimation('enter')
        
        // Reset animation state after a moment
        setTimeout(() => {
          setAnimation('idle')
        }, 300)
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
      // Reset animation on error
      setAnimation('idle')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }
  
  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto px-6">
          <h2 className="text-2xl font-semibold text-destructive mb-4">Form Not Found</h2>
          <p className="text-muted-foreground mb-6">This form may have been removed or is no longer available.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-10">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-in-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <header className="border-b py-4 sticky top-0 bg-background z-10">
        <div className="container max-w-3xl mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">{form.title}</h1>
            {form.description && (
              <p className="text-muted-foreground mt-1">{form.description}</p>
            )}
          </div>
          {conversation.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs flex items-center gap-1"
            >
              {showHistory ? (
                <>
                  <ChevronRight className="h-3 w-3" />
                  Hide History
                </>
              ) : (
                <>
                  <ChevronLeft className="h-3 w-3" />
                  Show History
                </>
              )}
            </Button>
          )}
        </div>
      </header>
      
      <main className="flex-1 flex flex-col justify-center items-center py-8 px-4">
        {completed ? (
          <div className="max-w-3xl w-full bg-card rounded-xl p-12 shadow-md border text-center">
            <div className="flex justify-center items-center mb-8 w-20 h-20 bg-primary/10 rounded-full mx-auto">
              <ArrowUp className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-medium mb-4">Thank you for your responses!</h2>
            <p className="text-muted-foreground mb-8 text-lg">Your answers have been submitted successfully.</p>
            <div className="mt-12">
              <Button 
                onClick={() => window.location.reload()}
                size="lg"
                className="px-8 py-6 text-lg h-auto"
              >
                Start a New Session
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl w-full">
            {/* Previous conversation (collapsible) */}
            {showHistory && conversation.length > 0 && (
              <div className="mb-8 space-y-6 max-h-[40vh] overflow-y-auto p-4 border rounded-xl">
                <h3 className="font-medium text-sm uppercase tracking-wide mb-4 text-muted-foreground">Previous Responses</h3>
                {conversation.map((exchange, index) => (
                  <div key={index} className="space-y-3">
                    <div className="bg-primary/5 rounded-lg p-4">
                      <p className="text-sm font-medium mb-1">Question {index + 1}:</p>
                      <p>{exchange.question}</p>
                    </div>
                    <div className="bg-secondary/20 rounded-lg p-4 ml-6 mb-6">
                      <p className="text-sm font-medium mb-1">Your answer:</p>
                      <p>{exchange.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Current question with animation */}
            <div 
              className={cn(
                "mb-6 transition-all duration-300 transform",
                animation === 'exit' && "opacity-0 -translate-y-10",
                animation === 'enter' && "opacity-0 translate-y-10",
              )}
            >
              <div className="bg-card rounded-xl p-8 shadow-md border">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-3 mt-1">
                    <CornerRightDown className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">Question {conversation.length + 1} of {form.max_questions}</h3>
                    <p className="text-xl">{currentQuestion}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div 
              className={cn(
                "space-y-4 transition-all duration-300 transform",
                animation === 'exit' && "opacity-0 translate-y-10",
                animation === 'enter' && "opacity-0 -translate-y-10",
              )}
            >
              <Textarea
                ref={answerInputRef}
                placeholder="Type your answer here..."
                className="min-h-[120px] resize-none p-4 text-lg shadow-sm focus-visible:ring-primary"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={isSubmitting}
                onKeyDown={handleKeyDown}
              />
              
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> to submit
                </p>
                <Button 
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer.trim() || isSubmitting}
                  size="lg"
                  className="px-6"
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
          </div>
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
