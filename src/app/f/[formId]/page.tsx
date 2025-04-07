"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { Send, ArrowUp, ChevronLeft, ChevronRight, CornerRightDown } from "lucide-react"
import { FormRecord } from "@/types/supabase-types"
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
  
  // Focus input on load and after each question
  useEffect(() => {
    if (!loading && !completed && answerInputRef.current) {
      setTimeout(() => {
        answerInputRef.current?.focus()
      }, 300)
    }
  }, [loading, currentQuestion, completed])
  
  // Handle keyboard submit with Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitAnswer()
    }
  }

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || !sessionId || isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      // Add the current Q&A to conversation history
      const newConversationItem = {
        question: currentQuestion,
        answer: userAnswer.trim()
      }
      
      setConversation(prev => [...prev, newConversationItem])
      
      // Animate the transition
      setAnimation('exit')
      
      // Submit the answer to get the next question
      const response = await fetch(`/api/forms/${formId}/sessions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          currentQuestion,
          userAnswer: userAnswer.trim()
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit answer')
      }
      
      const data = await response.json()
      
      // Clear the input
      setUserAnswer("")
      
      // Update progress
      if (form) {
        const currentCount = conversation.length + 1
        const newProgress = Math.min(100, (currentCount / form.max_questions) * 100)
        setProgress(newProgress)
      }
      
      // Check if the form is completed
      if (data.completed) {
        setCompleted(true)
      } else {
        // Set the next question
        setTimeout(() => {
          setAnimation('enter')
          setCurrentQuestion(data.nextQuestion)
        }, 300)
      }
      
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
  
  // Reset animation state after transition
  useEffect(() => {
    if (animation !== 'idle') {
      const timer = setTimeout(() => {
        setAnimation('idle')
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [animation])
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with form title and progress */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">{form?.title || "Interactive Form"}</h1>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-6 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : completed ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Thank you for your responses!</h2>
            <p className="text-gray-600 max-w-md">
              Your form has been submitted successfully. We appreciate your time and input.
            </p>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? "Hide Responses" : "View Your Responses"}
              </Button>
              <Button onClick={() => window.location.href = '/'}>
                Return Home
              </Button>
            </div>
            
            {showHistory && (
              <div className="mt-6 w-full max-w-2xl border rounded-lg p-4 bg-white">
                <h3 className="text-lg font-medium mb-4">Your Responses</h3>
                <div className="space-y-4">
                  {conversation.map((item, index) => (
                    <div key={index} className="border-b pb-3 last:border-b-0">
                      <p className="font-medium text-gray-700">{item.question}</p>
                      <p className="text-gray-600 mt-1">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Conversation history toggle */}
            {conversation.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-sm flex items-center gap-1 text-gray-500 hover:text-gray-700"
                >
                  {showHistory ? (
                    <>
                      <ChevronRight className="w-4 h-4" />
                      Hide previous questions
                    </>
                  ) : (
                    <>
                      <ChevronLeft className="w-4 h-4" />
                      Show previous questions ({conversation.length})
                    </>
                  )}
                </button>
              </div>
            )}
            
            {/* Conversation history */}
            {showHistory && conversation.length > 0 && (
              <div className="space-y-4 mb-6 bg-white rounded-lg p-4 border">
                {conversation.map((item, index) => (
                  <div key={index} className="border-b pb-3 last:border-b-0">
                    <p className="font-medium text-gray-700">{item.question}</p>
                    <div className="flex gap-2 items-start mt-2">
                      <CornerRightDown className="w-4 h-4 text-gray-400 mt-1" />
                      <p className="text-gray-600">{item.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Current question */}
            <div className={cn(
              "flex-1 transition-all duration-300 transform",
              animation === 'exit' && '-translate-y-4 opacity-0',
              animation === 'enter' && 'translate-y-0 opacity-100'
            )}>
              <h2 className="text-xl font-medium text-gray-900 mb-6">{currentQuestion}</h2>
              
              <div className="bg-white rounded-lg border p-4">
                <Textarea
                  ref={answerInputRef}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer here..."
                  className="min-h-24 border-0 focus-visible:ring-0 resize-none"
                  disabled={isSubmitting}
                />
                <div className="flex justify-between items-center mt-2 pt-2 border-t">
                  <p className="text-xs text-gray-500">
                    Press Enter to submit or Shift+Enter for a new line
                  </p>
                  <Button 
                    onClick={handleSubmitAnswer} 
                    disabled={!userAnswer.trim() || isSubmitting}
                    size="sm"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">Sending...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
