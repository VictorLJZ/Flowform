"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { 
  getDynamicBlockQuestion, 
  saveDynamicBlockResponse 
} from "@/services/form"
import { QAPair } from "@/types/supabase-types"

interface DynamicBlockResponseProps {
  blockId: string
  formId: string
  responseId: string
  required: boolean
  onComplete?: () => void
}

export function DynamicBlockResponse({ 
  blockId, 
  formId, 
  responseId, 
  required,
  onComplete
}: DynamicBlockResponseProps) {
  // Conversation state
  const [conversation, setConversation] = useState<QAPair[]>([])
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [userAnswer, setUserAnswer] = useState("")
  const [isComplete, setIsComplete] = useState(false)
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Load initial question
  useEffect(() => {
    const loadInitialQuestion = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const result = await getDynamicBlockQuestion(blockId)
        
        if (result.success && result.data) {
          setCurrentQuestion(result.data.question)
        } else {
          setError("Failed to load the conversation question")
        }
      } catch (error) {
        console.error("Error loading initial question:", error)
        setError("An error occurred while starting the conversation")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadInitialQuestion()
  }, [blockId])
  
  // Handle submitting an answer
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return
    
    try {
      setIsSaving(true)
      setError(null)
      
      const result = await saveDynamicBlockResponse({
        responseId,
        blockId,
        formId,
        question: currentQuestion,
        answer: userAnswer.trim(),
        isStarterQuestion: conversation.length === 0
      })
      
      if (result.success && result.data) {
        // Update conversation history
        setConversation(result.data.conversation)
        setUserAnswer("")
        
        if (result.data.isComplete) {
          setIsComplete(true)
          onComplete?.()
        } else if (result.data.nextQuestion) {
          // Set up next question
          setCurrentQuestion(result.data.nextQuestion)
        } else {
          setError("Failed to generate next question")
        }
      } else {
        setError("Failed to save your response")
      }
    } catch (error) {
      console.error("Error submitting answer:", error)
      setError("An error occurred. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }
  
  // Handle keyboard submission (Shift+Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      handleSubmitAnswer()
    }
  }
  
  if (isLoading) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-center">
        <Loader2 size={30} className="animate-spin mb-4 text-primary" />
        <p className="text-muted-foreground">Loading conversation...</p>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-destructive mb-2">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.location.reload()}
        >
          Reload
        </Button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6 py-2">
      {/* Conversation history */}
      {conversation.map((pair, index) => (
        <div key={index} className="space-y-3">
          <div className="bg-primary/10 p-4 rounded-lg">
            <p className="font-medium">{pair.question}</p>
          </div>
          <div className="bg-muted p-4 rounded-lg ml-4">
            <p>{pair.answer}</p>
          </div>
        </div>
      ))}
      
      {/* Current question and response input */}
      {!isComplete && (
        <div className="space-y-4">
          <div className="bg-primary/10 p-4 rounded-lg">
            <p className="font-medium">{currentQuestion}</p>
            {required && <span className="text-sm text-destructive ml-1">*</span>}
          </div>
          
          <div className="space-y-3">
            <Textarea
              placeholder="Type your answer here..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              rows={4}
              className="resize-y min-h-[100px]"
            />
            
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Press Shift+Enter to submit
              </p>
              
              <Button
                onClick={handleSubmitAnswer}
                disabled={isSaving || !userAnswer.trim()}
                className="ml-auto"
                size="sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Completion message */}
      {isComplete && (
        <div className="bg-primary/5 p-4 rounded-lg text-center">
          <p className="text-muted-foreground">
            Conversation complete. Thank you for your responses!
          </p>
        </div>
      )}
    </div>
  )
}
