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
import { fetchers } from "@/hooks/useAIConversation"
import { QAPair } from "@/types/supabase-types"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import useSWR, { useSWRConfig } from 'swr'

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
  onNext?: () => void
  isNextDisabled?: boolean
  responseId: string
  formId: string
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
  // Store inputs for each question to preserve them when navigating
  const [questionInputs, setQuestionInputs] = useState<Record<number, string>>({})
  // Add a local loading state to prevent UI changes during submission
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false)

  // Determine if we're in builder or viewer mode
  const { mode } = useFormBuilderStore()
  const isBuilder = mode === 'builder'
  
  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  








  /**
   * Safe AI Conversation Hook
   * 
   * This wrapper hook prevents API calls in builder mode by providing a null key to SWR
   * Only performs real API calls in viewer mode
   */
  function useSafeAIConversation(responseId: string, blockId: string, formId: string, isBuilder: boolean) {
    const { mutate } = useSWRConfig();
    const conversationKey = isBuilder ? null : `conversation:${responseId}:${blockId}`;
    
    // Fetch conversation data (only in viewer mode)
    const { data, error, isLoading, isValidating } = useSWR(
      conversationKey,
      responseId && blockId && !isBuilder ? () => fetchers.getConversation(responseId, blockId) : null,
      {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        dedupingInterval: 5000,
        errorRetryCount: 2
      }
    );
    
    // Safe submit function that works in both modes
    const submitAnswer = async (question: string, answer: string, isStarterQuestion = false) => {
      if (isBuilder) {
        console.log('Builder mode submit:', { question, answer, isStarterQuestion });
        return Promise.resolve(undefined);
      }
      
      try {
        // Create the input data for the answer submission
        const input = {
          responseId,
          blockId,
          formId,
          question, 
          answer,
          isStarterQuestion,
          isComplete: data?.isComplete
        };
        
        // Call the API and update the SWR cache with result
        const result = await mutate(
          conversationKey,
          fetchers.saveAnswer(input),
          {
            optimisticData: data ? {
              ...data,
              conversation: [
                ...data.conversation,
                { question, answer, timestamp: new Date().toISOString(), is_starter: isStarterQuestion }
              ]
            } : undefined,
            rollbackOnError: true,
            populateCache: true,
            revalidate: false
          }
        );
        
        return result;
      } catch (error) {
        console.error('Error in submitAnswer:', error);
        throw error;
      }
    };
    
    return {
      conversation: data?.conversation || [],
      nextQuestion: data?.nextQuestion || '',
      isComplete: data?.isComplete || false,
      maxQuestions: data?.maxQuestions || (settings?.maxQuestions || 5),
      isLoading: isBuilder ? false : isLoading,
      isSubmitting: isBuilder ? false : isValidating,
      error: isBuilder ? null : (error ? (error instanceof Error ? error.message : String(error)) : null),
      submitAnswer
    };
  }
  
  // Use our safe hook that handles both modes properly
  const {
    conversation, 
    nextQuestion, 
    maxQuestions, 
    isSubmitting, 
    error, 
    submitAnswer
  } = useSafeAIConversation(responseId, id, formId, isBuilder);
  
  // Default to value prop in builder mode, but don't use it for UI display in builder
  const effectiveConversation = isBuilder ? (value || []) : conversation;








  // Computed values
  const isFirstQuestion = activeQuestionIndex === 0;
  // Fix the off-by-one error in max questions check
  const hasReachedMaxQuestions = maxQuestions > 0 && activeQuestionIndex >= maxQuestions;
  const starterPrompt = title || '';

  // Get the current question to display
  let activeQuestion = "";
  if (isFirstQuestion) {
    activeQuestion = starterPrompt;
  } else if (effectiveConversation[activeQuestionIndex] !== undefined) {
    activeQuestion = effectiveConversation[activeQuestionIndex].question;
  } else {
    activeQuestion = nextQuestion;
  }
    
  // Calculate display title
  const displayTitle = activeQuestion;

  // Determine if current question is answered
  const isActiveQuestionAnswered = activeQuestionIndex < effectiveConversation.length && !!effectiveConversation[activeQuestionIndex]?.answer;
    
  // Always show input if we're in the process of submitting to prevent UI flicker
  // Otherwise, show input when we're within max questions and the current question needs an answer
  const showInput = isLocalSubmitting || (
    activeQuestionIndex < maxQuestions && 
    (!isActiveQuestionAnswered || effectiveConversation.length <= activeQuestionIndex)
  );
  










  useEffect(() => {
    if (showInput && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showInput]);

  // Focus textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [])

  // Update onChange when conversation changes
  useEffect(() => {
    if (onChange && effectiveConversation.length > 0) {
      onChange(effectiveConversation)
    }
  }, [effectiveConversation, onChange])








  // Compute navigation status
  const canGoPrevious = activeQuestionIndex > 0
  // Allow forward navigation as long as the question has been answered and we're not at max questions
  const canGoNext = activeQuestionIndex < effectiveConversation.length - 1 || 
    (activeQuestionIndex < settings.maxQuestions - 1 && isActiveQuestionAnswered)

  // Navigation between questions
  const handlePrevious = () => {
    if (activeQuestionIndex > 0) {
      // Save current input before navigating
      setQuestionInputs(prev => ({
        ...prev,
        [activeQuestionIndex]: userInput
      }))
      
      // Navigate to previous question
      const prevIndex = activeQuestionIndex - 1
      setActiveQuestionIndex(prevIndex)
      
      // Restore previous input if it exists
      setUserInput(questionInputs[prevIndex] || "")
    }
  }

  const handleNext = () => {
    // Go to next question if we can
    if (canGoNext) {
      // Save current input before navigating
      setQuestionInputs(prev => ({
        ...prev,
        [activeQuestionIndex]: userInput
      }))
      
      // Navigate to next question
      const nextIndex = activeQuestionIndex + 1
      setActiveQuestionIndex(nextIndex)
      
      // Restore next input if it exists
      setUserInput(questionInputs[nextIndex] || "")
    }
  }







  // Handle form submission
  const handleSubmit = async () => {
    if (!userInput.trim() || isSubmitting) return
    
    try {
      // Set local submitting state to prevent UI changes
      setIsLocalSubmitting(true)
      
      // If this is the first question, use the starter prompt
      const questionToAnswer = isFirstQuestion ? starterPrompt : activeQuestion
      
      // Save the current input in our record before submitting
      setQuestionInputs(prev => ({
        ...prev,
        [activeQuestionIndex]: userInput
      }))
      
      // Check if we've reached max questions and should move to next block
      const isLastQuestion = activeQuestionIndex >= maxQuestions - 1;
      const result = await submitAnswer(questionToAnswer, userInput, isFirstQuestion)
      
      // If this is the last question and we have onNext, use it to move to next block
      if (isLastQuestion && onNext) {
        // Update the conversation first to ensure the answer is saved
        if (onChange) {
          onChange([...effectiveConversation, { 
            question: questionToAnswer, 
            answer: userInput,
            timestamp: new Date().toISOString(),
            is_starter: isFirstQuestion
          }])
        }
        setUserInput("")
        // Use the onNext prop to go to the next block/question
        onNext()
        setIsLocalSubmitting(false)
        return
      }
      
      // For normal flow, just clear input and move to next question in this conversation
      setUserInput("")
      setActiveQuestionIndex(activeQuestionIndex + 1)
      setIsLocalSubmitting(false)
    } catch (err) {
      console.error("Error submitting answer:", err)
      setIsLocalSubmitting(false)
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
      index={isBuilder && index ? index - 1 : index}
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
        {/* Subtle navigation controls - show when we're past first question or have answers */}
        {(activeQuestionIndex > 0 || effectiveConversation.length > 1) && (
          <div className="flex items-center justify-end gap-2 text-gray-500 text-sm">
            <span>
              {activeQuestionIndex + 1} of {settings.maxQuestions}
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
        
        {/* We no longer display the previously answered question box in any mode */}
        
        {/* Input area - always visible, disabled during submission */}
        {showInput && (
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
              onClick={handleSubmit}
              disabled={isSubmitting || isLocalSubmitting}
              className={cn(
                "absolute bottom-2 right-2 h-8 w-8",
                (isSubmitting || isLocalSubmitting) ? "bg-green-100 text-green-600" : "",
                !userInput.trim() && "opacity-50 cursor-not-allowed"
              )}
            >
              {(isSubmitting || isLocalSubmitting) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
        
        {/* Completed message when reached max questions */}
        {hasReachedMaxQuestions && activeQuestionIndex === effectiveConversation.length + 1 && (
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
