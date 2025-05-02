"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { SlideWrapper } from "@/components/form/SlideWrapper"
import { BlockPresentation } from "@/types/theme-types"
import { SlideLayout } from "@/types/layout-types"
import { useAIConversation } from "@/hooks/useAIConversation"
import { QAPair } from "@/types/supabase-types"
import { useFormBuilderStore } from "@/stores/formBuilderStore"

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
  // Response tracking props
  responseId?: string | null
  formId?: string | null
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
  isNextDisabled,
  responseId,
  formId
}: AIConversationBlockProps) {

  // Local component state
  const [userInput, setUserInput] = useState("")
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0)
  const [isTyping, setIsTyping] = useState(false)
  const [displayedText, setDisplayedText] = useState<string>("")

  // Determine if we're in builder or viewer mode
  const { mode } = useFormBuilderStore()
  const isBuilder = mode === 'builder'
  
  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Initialize variables with default values for builder mode
  let conversation = value || [];
  let nextQuestion = "";
  let isComplete = false;
  let maxQuestions = settings.maxQuestions || 5;
  let isLoading = false;
  let isSubmitting = false;
  let error: string | null = null;
  let submitAnswer: (question: string, answer: string, isStarterQuestion?: boolean) => Promise<any> = 
    (question, answer, isStarterQuestion = false) => {
      console.log('Builder mode submit:', { question, answer, isStarterQuestion });
      return Promise.resolve(undefined);
    };
  
  // Only use the hook in viewer mode and when required props are available
  if (!isBuilder && responseId && formId) {
    // Use the AIConversation hook in viewer mode
    const hookResult = useAIConversation(responseId, id, formId);
    conversation = hookResult.conversation;
    nextQuestion = hookResult.nextQuestion || '';
    isComplete = hookResult.isComplete;
    maxQuestions = hookResult.maxQuestions;
    isLoading = hookResult.isLoading;
    isSubmitting = hookResult.isSubmitting;
    error = hookResult.error;
    submitAnswer = hookResult.submitAnswer;
  }

  // Computed values
  const currentQuestionIndex = conversation.length > 0 ? conversation.length - 1 : -1;
  const isFirstQuestion = currentQuestionIndex === -1;
  const effectiveMaxQuestions = maxQuestions || settings.maxQuestions || 5;
  const hasReachedMaxQuestions = effectiveMaxQuestions > 0 && currentQuestionIndex >= effectiveMaxQuestions - 1;
  const starterPrompt = title || '';
  
  // Navigation capabilities will be defined in handlePrevious/handleNext section

  // Get the current question to display
  const activeQuestion = isFirstQuestion 
    ? starterPrompt 
    : (activeQuestionIndex < conversation.length ? conversation[activeQuestionIndex].question : "");

  // Calculate display title
  const displayTitle = isTyping ? 
    `${displayedText}${isTyping ? '|' : ''}` : 
    (isFirstQuestion ? 
      starterPrompt : 
    (activeQuestionIndex < conversation.length ? conversation[activeQuestionIndex].question : title));

  // Determine if we should show input field
  const isActiveQuestionAnswered = activeQuestionIndex < conversation.length && !!conversation[activeQuestionIndex]?.answer;
    
  // Only show input if we're on the latest question and it needs an answer
  const showInput = !isActiveQuestionAnswered && (activeQuestionIndex === currentQuestionIndex || isFirstQuestion);
  
  useEffect(() => {
    if (showInput && textareaRef.current && !isTyping) {
      textareaRef.current.focus();
    }
  }, [showInput, isTyping]);

  // Focus textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [])

  // Update onChange when conversation changes
  useEffect(() => {
    if (onChange && conversation.length > 0) {
      onChange(conversation)
    }
  }, [conversation, onChange])

  // Handle typing animation effect for new questions
  useEffect(() => {
    if (nextQuestion && !isTyping && activeQuestionIndex === currentQuestionIndex) {
      setIsTyping(true)
      setDisplayedText("")
      
      let index = 0
      const intervalId = setInterval(() => {
        if (index < nextQuestion.length) {
          setDisplayedText(prev => prev + nextQuestion.charAt(index))
          index++
        } else {
          clearInterval(intervalId)
          setIsTyping(false)
        }
      }, 30)
      
      return () => clearInterval(intervalId)
    }
  }, [nextQuestion, isTyping, activeQuestionIndex, currentQuestionIndex])
  







  // Compute navigation status
  const canGoPrevious = activeQuestionIndex > 0
  const canGoNext = activeQuestionIndex < currentQuestionIndex

  // Navigation between questions
  const handlePrevious = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(activeQuestionIndex - 1)
    }
  }

  const handleNext = () => {
    // If we're not on the last question, go to next question
    if (activeQuestionIndex < conversation.length - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1)
    }
  }







  // Handle form submission
  const handleSubmit = async () => {
    if (!userInput.trim() || isSubmitting) return
    
    try {
      // If this is the first question, use the starter prompt
      const questionToAnswer = isFirstQuestion ? starterPrompt : activeQuestion
      
      await submitAnswer(questionToAnswer, userInput, isFirstQuestion)
      
      // Clear input and update state
      setUserInput("")
      setActiveQuestionIndex(currentQuestionIndex + 1)
    } catch (err) {
      console.error("Error submitting answer:", err)
    }
  }

  // Handle Enter key to submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  
  
  





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
              {activeQuestionIndex + 1} of {Math.min(settings.maxQuestions, conversation.length)}
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
        {hasReachedMaxQuestions && activeQuestionIndex === conversation.length + 1 && (
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
