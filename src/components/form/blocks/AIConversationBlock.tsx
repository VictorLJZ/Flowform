"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useCallback } from "react"
import { SlideWrapper } from "@/components/form/SlideWrapper"
import { BlockPresentation } from "@/types/theme-types"
import { SlideLayout } from "@/types/layout-types"

interface QAPair {
  question: string
  answer: string
  timestamp: string
  is_starter: boolean
}

export interface AIConversationBlockProps {
  id: string
  title: string
  description?: string
  required: boolean
  index?: number
  totalBlocks?: number
  settings: {
    startingPrompt: string
    maxQuestions: number
    temperature: number
    contextInstructions?: string
    presentation?: BlockPresentation
    layout?: SlideLayout
  }
  value?: QAPair[]
  onChange?: (value: QAPair[]) => void
  onUpdate?: (updates: Partial<{
    title: string,
    description: string,
    settings: {
      startingPrompt?: string,
      maxQuestions?: number,
      temperature?: number,
      contextInstructions?: string,
      presentation?: BlockPresentation,
      layout?: SlideLayout
    }
  }>) => void
  // Navigation props
  onNext?: () => void
  isNextDisabled?: boolean
}

export function AIConversationBlock({
  id,
  title,
  description,
  required,
  index,
  totalBlocks,
  settings,
  value = [],
  onChange,
  onUpdate,
  onNext,
  isNextDisabled
}: AIConversationBlockProps) {

  const [userInput, setUserInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversation, setConversation] = useState<QAPair[]>(value)
  

  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const formId = window.location.pathname.split('/').pop() || ""

  const currentQuestionIndex = conversation.length > 0 ? conversation.length - 1 : -1
  const isFirstQuestion = currentQuestionIndex === -1
  const hasReachedMaxQuestions = settings.maxQuestions > 0 && currentQuestionIndex >= settings.maxQuestions - 1
  const starterPrompt = settings.startingPrompt || "How can I help you today?"

  // Scroll to bottom of chat when conversation updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [conversation])

  // Focus textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!userInput.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Create timestamp in ISO format
      const timestamp = new Date().toISOString()
      
      // Add user's answer to conversation
      const updatedConversation = [...conversation]
      
      // If this is the first question, add the starter prompt
      if (isFirstQuestion) {
        updatedConversation.push({
          question: starterPrompt,
          answer: userInput,
          timestamp,
          is_starter: true
        })
      } else {
        // Update the answer for the current question
        updatedConversation[currentQuestionIndex] = {
          ...updatedConversation[currentQuestionIndex],
          answer: userInput,
          timestamp
        }
      }
      
      setConversation(updatedConversation)
      
      // Call onChange callback with updated conversation
      if (onChange) {
        onChange(updatedConversation)
      }
      
      // If we've reached max questions, don't fetch next question
      if (hasReachedMaxQuestions) {
        setUserInput("")
        setIsSubmitting(false)
        return
      }
      
      // Save the response and get the next question from the API
      const response = await fetch(`/api/forms/${formId}/sessions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responseId: id,
          blockId: id,
          blockType: "dynamic",
          answer: userInput,
          currentQuestion,
          isFirstQuestion
        })
      })
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.nextQuestion) {
        // Add the next AI question to the conversation
        const newConversation = [
          ...updatedConversation,
          {
            question: data.nextQuestion,
            answer: "",
            timestamp: new Date().toISOString(),
            is_starter: false
          }
        ]
        
        setConversation(newConversation)
        
        // Call onChange callback with conversation including new question
        if (onChange) {
          onChange(newConversation)
        }
      }
      
      setUserInput("")
    } catch (err) {
      console.error("Error in AI conversation:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInput, isSubmitting, isFirstQuestion, starterPrompt, currentQuestionIndex, conversation, hasReachedMaxQuestions, onChange, id, formId])
  
  // Handle Enter key to submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }
  
  // Get current question text
  const currentQuestion = isFirstQuestion 
    ? starterPrompt 
    : conversation[currentQuestionIndex]?.question || ""

  // Check if we should show the input field (only if we haven't answered the current question yet)
  const showInput = isFirstQuestion || (currentQuestionIndex >= 0 && !conversation[currentQuestionIndex]?.answer)


  // Build the conversation UI component
  const conversationContent = (
    <div className="space-y-4">
      <div className="overflow-y-auto max-h-[400px] mb-4 bg-white rounded-lg border shadow-sm p-4">
        <div className="space-y-4">
          <AnimatePresence>
            {/* Show conversation history or starter prompt */}
            {isFirstQuestion ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-100 p-4 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800">{starterPrompt}</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              conversation.map((item, idx) => (
                <React.Fragment key={idx}>
                  {/* AI Question */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-gray-100 p-4 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800">{item.question}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* User Answer (if provided) */}
                  {item.answer && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-primary/10 p-4 rounded-lg ml-6"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <p className="text-gray-800">{item.answer}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </React.Fragment>
              ))
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>
      </div>
      
      {/* Input area - only show if waiting for an answer and not reached max questions */}
      {showInput && !hasReachedMaxQuestions && (
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer here..."
            className="min-h-[100px] pr-12 resize-none"
            disabled={isSubmitting}
          />
          <Button
            size="icon"
            className={cn(
              "absolute bottom-2 right-2 h-8 w-8",
              !userInput.trim() && "opacity-50 cursor-not-allowed"
            )}
            onClick={handleSubmit}
            disabled={!userInput.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
      
      {/* Completed message when reached max questions */}
      {hasReachedMaxQuestions && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <p className="text-green-700 text-center">
              Conversation complete! Please proceed to the next question.
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Error display */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );


  // Wrap conversation in SlideWrapper for consistent styling and layout
  return (
    <SlideWrapper
      id={id}
      title={title}
      description={description}
      required={required}
      index={index}
      totalBlocks={totalBlocks}
      settings={{
        presentation: settings.presentation,
        layout: settings.layout || { type: 'standard' }
      }}
      onUpdate={onUpdate}
      onNext={onNext}
      isNextDisabled={isNextDisabled || (required && isFirstQuestion)}
    >
      {conversationContent}
    </SlideWrapper>
  )
}
