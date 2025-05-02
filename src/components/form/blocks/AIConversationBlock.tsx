"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
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

  // states
  const [userInput, setUserInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversation, setConversation] = useState<QAPair[]>(value)
  // Initialize activeQuestionIndex based on conversation history
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(value.length > 0 ? value.length - 1 : -1)
  const [isTyping, setIsTyping] = useState(false)
  const [displayedText, setDisplayedText] = useState<string>("")
  
  // refs
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const formId = window.location.pathname.split('/').pop() || ""

  // computed
  const currentQuestionIndex = conversation.length > 0 ? conversation.length - 1 : -1
  const isFirstQuestion = currentQuestionIndex === -1
  const hasReachedMaxQuestions = settings.maxQuestions > 0 && currentQuestionIndex >= settings.maxQuestions - 1
  // Use the block title as the starter prompt instead of a separate setting
  const starterPrompt = title
  
  // Get the current question to display
  const activeQuestion = isFirstQuestion 
    ? starterPrompt 
    : (activeQuestionIndex < conversation.length ? conversation[activeQuestionIndex].question : "")

  // Focus textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  // Navigation between questions
  const handlePrevious = useCallback(() => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(activeQuestionIndex - 1)
    }
  }, [activeQuestionIndex])
  
  const handleNext = useCallback(() => {
    // If we're not on the last question, go to next question
    if (activeQuestionIndex < currentQuestionIndex) {
      setActiveQuestionIndex(activeQuestionIndex + 1)
    }
  }, [activeQuestionIndex, currentQuestionIndex])
  
  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!userInput.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Create timestamp in ISO format
      const timestamp = new Date().toISOString()
      
      // Add user's answer to conversation
      let updatedConversation = [...conversation]
      
      // If this is the first question, add the starter prompt
      if (isFirstQuestion) {
        updatedConversation.push({
          question: starterPrompt,
          answer: userInput,
          timestamp,
          is_starter: true
        })
      } else {
        // Check if we're editing a previous answer
        if (activeQuestionIndex < currentQuestionIndex) {
          // Update the answer for the active question
          updatedConversation[activeQuestionIndex] = {
            ...updatedConversation[activeQuestionIndex],
            answer: userInput,
            timestamp
          }
          
          // Remove all subsequent questions as they need to be regenerated
          updatedConversation = updatedConversation.slice(0, activeQuestionIndex + 1)
        } else {
          // Update the answer for the current question
          updatedConversation[currentQuestionIndex] = {
            ...updatedConversation[currentQuestionIndex],
            answer: userInput,
            timestamp
          }
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
          currentQuestion: activeQuestion,
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
        
        // Move to the new question (the last one in the conversation)
        const newIndex = newConversation.length - 1;
        setActiveQuestionIndex(newIndex)
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
  
  // Check if the active question has been answered
  const isActiveQuestionAnswered = !isFirstQuestion && 
    activeQuestionIndex < conversation.length && 
    !!conversation[activeQuestionIndex]?.answer
  
  // Check if we should show the input field (only if we haven't answered the active question yet)
  const showInput = isFirstQuestion || (activeQuestionIndex <= currentQuestionIndex && !isActiveQuestionAnswered)
  
  // Check if we can navigate to next/previous questions
  const canGoNext = activeQuestionIndex < currentQuestionIndex
  const canGoPrevious = activeQuestionIndex > 0
  
  // Focus textarea when new question is rendered or active question changes
  useEffect(() => {
    if (showInput && textareaRef.current && !isTyping) {
      textareaRef.current.focus()
    }
  }, [activeQuestionIndex, showInput, isTyping])


  // Use typing animation for title when showing new questions
  useEffect(() => {
    // Don't animate for the first question (starter prompt)
    if (isFirstQuestion) {
      setDisplayedText(starterPrompt)
      return
    }
    
    // If we have a valid question to show
    if (activeQuestionIndex < conversation.length && conversation[activeQuestionIndex]?.question) {
      const questionText = conversation[activeQuestionIndex].question
      
      // If this is a newly added question (last in the conversation) and it's not answered yet
      if (activeQuestionIndex === currentQuestionIndex && !conversation[activeQuestionIndex].answer) {
        // Start typing animation
        setIsTyping(true)
        setDisplayedText("")
        
        let i = 0
        const typingSpeed = 30 // ms per character
        
        const typingInterval = setInterval(() => {
          if (i < questionText.length) {
            setDisplayedText(prev => prev + questionText.charAt(i))
            i++
          } else {
            clearInterval(typingInterval)
            setIsTyping(false)
          }
        }, typingSpeed)
        
        return () => clearInterval(typingInterval)
      } else {
        // For existing questions, show them immediately
        setDisplayedText(questionText)
      }
    }
  }, [activeQuestionIndex, conversation, isFirstQuestion, starterPrompt, currentQuestionIndex])
  
  // Determine the current title to display based on the active question
  const displayTitle = isTyping ? 
    `${displayedText}${isTyping ? '|' : ''}` : 
    (isFirstQuestion ? 
      starterPrompt : 
      (activeQuestionIndex < conversation.length ? conversation[activeQuestionIndex].question : title))
  
  // Wrap conversation in SlideWrapper for consistent styling and layout
  return (
    <SlideWrapper
      id={id}
      title={displayTitle}
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
      <div className="space-y-4">
        {/* Subtle navigation controls, only visible if we have more than one question */}
        {!isFirstQuestion && conversation.length > 0 && (
          <div className="flex items-center justify-end gap-2 text-gray-500 text-sm">
            <span>
              {currentQuestionIndex >= 0 ? `${activeQuestionIndex + 1} of ${conversation.length}` : ""}
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handlePrevious}
                disabled={!canGoPrevious || isSubmitting}
                className="h-6 w-6 p-0"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleNext}
                disabled={!canGoNext || isSubmitting}
                className="h-6 w-6 p-0"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Previously answered question */}
        {isActiveQuestionAnswered && (
          <div className="bg-primary/10 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-500 mb-1">Your answer:</p>
            <p className="text-gray-800">{conversation[activeQuestionIndex].answer}</p>
          </div>
        )}
        
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
              disabled={isSubmitting || isTyping}
            />
            <Button
              size="icon"
              className={cn(
                "absolute bottom-2 right-2 h-8 w-8",
                (!userInput.trim() || isTyping) && "opacity-50 cursor-not-allowed"
              )}
              onClick={handleSubmit}
              disabled={!userInput.trim() || isSubmitting || isTyping}
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
        {hasReachedMaxQuestions && activeQuestionIndex === currentQuestionIndex && (
          <Card className="border-green-200 bg-green-50 mt-4">
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
    </SlideWrapper>
  )
}
