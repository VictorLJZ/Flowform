"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { PaperPlaneIcon, ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { AnimatePresence, motion } from '@/lib/motion'
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { SlideWrapper } from "@/components/form/SlideWrapper"
import { BlockPresentation } from "@/types/theme-types"
import { SlideLayout } from "@/types/layout-types"
import { QAPair, FormBlock } from '@/types/supabase-types'
import { useAIConversation } from '@/hooks/useAIConversation'
import { useConversationDisplay } from '@/hooks/useConversationDisplay'
import { useConversationInteraction } from '@/hooks/useConversationInteraction'
import { useConversationNavigation } from '@/hooks/useConversationNavigation'

interface AIConversationBlockProps {
  id: string
  title?: string
  description?: string
  required: boolean
  index?: number
  totalBlocks?: number
  maxQuestions?: number
  temperature?: number
  settings?: {
    presentation?: BlockPresentation
    layout?: SlideLayout
  }
  value?: QAPair[]
  onChange?: (value: QAPair[]) => void
  onUpdate?: (updates: Partial<{
    title: string;
    description: string | null;
    settings: {
      maxQuestions?: number,
      temperature?: number,
      presentation?: BlockPresentation,
      layout?: SlideLayout
    } | null;
  }>) => void
  // Navigation props
  onNext?: () => void
  isNextDisabled?: boolean
  responseId: string
  formId: string
}

export function AIConversationBlock({
  id,
  title = '',
  description,
  required,
  index,
  totalBlocks,
  maxQuestions = 0,
  temperature = 0.7,
  settings = {},
  value = [],
  onChange,
  onUpdate,
  onNext,
  isNextDisabled,
  responseId,
  formId
}: AIConversationBlockProps) {
  // Local state
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0)
  const [questionInputs, setQuestionInputs] = useState<Record<number, string>>({})

  // Determine if we're in builder or viewer mode
  const { mode } = useFormBuilderStore()
  const isBuilder = mode === 'builder'

  // Use our AIConversation hook for managing the conversation state
  const {
    conversation, 
    nextQuestion, 
    maxQuestions: configuredMaxQuestions, 
    isComplete,
    isLoading: isConversationLoading,
    submitAnswer
  } = useAIConversation(responseId, id, formId, isBuilder)

  // Effective max questions (from config or prop)
  const effectiveMaxQuestions = configuredMaxQuestions || maxQuestions
  
  // Effective conversation (from hook or prop)
  const effectiveConversation = isBuilder ? value || [] : conversation

  // Use our conversation display hook to manage what question is shown
  const { 
    displayQuestion, 
    isLoading: isQuestionLoading 
  } = useConversationDisplay({
    conversation: effectiveConversation,
    nextQuestion,
    activeQuestionIndex,
    isFirstQuestion: activeQuestionIndex === 0 && effectiveConversation.length === 0,
    starterPrompt: title || ''
  })

  // Create an adapter for the onUpdate function to match what useConversationInteraction expects
  // The hook expects onUpdate?: () => void with no parameters
  const interactionUpdateAdapter = onUpdate ? () => {
    // This adapter calls onUpdate with default/empty values if needed
    // This is just a simple callback that useConversationInteraction can call
    console.log('Interaction update triggered');
  } : undefined;

  // Use our interaction hook to manage user input and submissions
  const {
    userInput,
    setUserInput,
    isLocalSubmitting,
    isChangingEarlierAnswer,
    textareaRef,
    handleInputChange,
    handleSubmit,
    handleKeyDown
  } = useConversationInteraction({
    conversation: effectiveConversation,
    activeQuestionIndex,
    questionInputs,
    isFirstQuestion: activeQuestionIndex === 0 && effectiveConversation.length === 0,
    starterPrompt: title || '',
    submitAnswer,
    onNext,
    onChange,
    onUpdate: interactionUpdateAdapter
  })
  
  // Use our navigation hook to manage question navigation
  const {
    isFirstQuestion,
    isFinalQuestion,
    isLastAnswered,
    hasReachedMaxQuestions,
    canMoveToNextQuestion,
    handlePreviousQuestion,
    handleNextQuestion,
    moveToSpecificQuestion,
    handleCompletingConversation
  } = useConversationNavigation({
    conversation: effectiveConversation,
    nextQuestion,
    isComplete,
    maxQuestions: effectiveMaxQuestions,
    activeQuestionIndex,
    setActiveQuestionIndex,
    questionInputs,
    displayQuestion,
    onNext
  })

  // Loading states
  const isLoading = isConversationLoading || isQuestionLoading || isLocalSubmitting
  
  // Component state to track rendering updates
  const [renderKey, setRenderKey] = useState(0);
  
  // Force UI updates when key props change - enhanced for debugging and reliability
  useEffect(() => {
    if (nextQuestion) {
      console.log('Next question changed in parent component, updating UI', {
        question: nextQuestion.substring(0, 30) + '...',
        displayedQuestion: displayQuestion?.substring(0, 30) + '...',
        conversation: effectiveConversation.length
      });
      
      // Force a component re-render when the question changes
      // This is critical to ensure the UI updates with the new question
      if (nextQuestion !== displayQuestion) {
        console.log('Forcing complete UI re-render in AIConversationBlock');
        setRenderKey(prev => prev + 1);
      }
    }
  }, [nextQuestion, effectiveConversation.length, displayQuestion])

  // Create a direct question display element - separate from the SlideWrapper title
  // This is necessary to show the AI-generated follow-up questions
  const questionDisplay = displayQuestion ? (
    <h3 className="text-lg font-medium mb-4">{displayQuestion}</h3>
  ) : (
    <div className="h-8 bg-slate-100 animate-pulse rounded mb-4" />
  );
  
  // The actual conversation interface that will be wrapped by SlideWrapper
  const conversationInterface = (
    <div className="flex flex-col gap-4 w-full">
      {/* Question display - critical for showing new questions */}
      {questionDisplay}
      
      {/* Warning when changing earlier answers */}
      {isChangingEarlierAnswer && (
        <div className="bg-yellow-50 border border-yellow-200 p-2 rounded-md text-sm text-yellow-700">
          Changing this answer will reset later questions in the conversation.
        </div>
      )}
      
      {/* Input area - only shown when appropriate */}
      {(!isComplete && !hasReachedMaxQuestions) && (
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "Processing..." : "Type your response..."}
            disabled={isLoading}
            className="pr-12 min-h-[100px] resize-none"
            data-testid="ai-conversation-input"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={handleSubmit}
            disabled={!userInput.trim() || isLoading}
            className="absolute right-2 bottom-2 rounded-full w-8 h-8"
            aria-label="Submit response"
          >
            <PaperPlaneIcon className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      {/* History of previous questions and answers */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {effectiveConversation.map((item, index) => (
            // Only show items that come before the current active index
            index < activeQuestionIndex && (
              <motion.div
                key={`qa-${index}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="border rounded-lg p-3"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{item.question}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveToSpecificQuestion(index)}
                      disabled={isLoading}
                    >
                      Edit
                    </Button>
                  </div>
                  <p className="text-muted-foreground">{item.answer}</p>
                </div>
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>
      
      {/* Complete button shown when all questions are answered */}
      {isComplete && onNext && (
        <Button
          type="button"
          onClick={handleCompletingConversation}
          disabled={isNextDisabled}
          className="mt-2"
        >
          Complete
        </Button>
      )}
    </div>
  )

  // Create a wrapper for onUpdate to match the SlideWrapper's expected function signature
  // The SlideWrapper expects onUpdate: (updates: Partial<FormBlock>) => void
  const handleSlideUpdate = onUpdate ? (formBlockUpdates: Partial<FormBlock>) => {
    // Convert the FormBlock updates to our component's expected update format
    const mappedUpdates: Partial<{
      title: string;
      description: string | null;
      settings: {
        maxQuestions?: number,
        temperature?: number,
        presentation?: BlockPresentation,
        layout?: SlideLayout
      } | null;
    }> = {};
    
    // Map the properties correctly
    if (formBlockUpdates.title !== undefined) mappedUpdates.title = formBlockUpdates.title;
    if (formBlockUpdates.description !== undefined) mappedUpdates.description = formBlockUpdates.description as string | null;
    if (formBlockUpdates.settings) {
      mappedUpdates.settings = {
        ...settings, // Preserve existing settings
        ...(formBlockUpdates.settings as any) // Apply new settings
      };
    }
    
    // Call the original onUpdate with our mapped updates
    onUpdate(mappedUpdates);
  } : undefined;

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
      onUpdate={handleSlideUpdate}
      onNext={onNext}
      isNextDisabled={isNextDisabled || (required && isFirstQuestion)}
      blockRef={analytics?.blockRef}
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
              onFocus={() => {
                if (analytics?.trackFocus) {
                  analytics.trackFocus({
                    input_type: 'ai_conversation',
                    question_index: activeQuestionIndex,
                    is_first_question: isFirstQuestion
                  });
                }
              }}
              onBlur={() => {
                if (analytics?.trackBlur) {
                  analytics.trackBlur({
                    input_type: 'ai_conversation',
                    has_draft: userInput.trim().length > 0,
                    draft_length: userInput.length
                  });
                }
              }}
            />
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={isSubmitting || isLocalSubmitting}
              className={cn(
                "absolute bottom-2 right-2 h-8 w-8",
                (isSubmitting || isLocalSubmitting) ? "bg-gray-100" : "",
                !userInput.trim() && "opacity-50 cursor-not-allowed"
              )}
            >
              {(isSubmitting || isLocalSubmitting) ? (
                <div className="flex items-center justify-center h-full w-full">
                  <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
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

export default AIConversationBlock
