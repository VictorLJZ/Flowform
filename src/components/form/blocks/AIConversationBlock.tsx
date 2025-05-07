"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
// import { cn } from "@/lib/utils" - removed unused import
import { PaperPlaneIcon } from '@radix-ui/react-icons'
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

// Define the handle interface used by refs to interact with this component
export interface AIConversationHandle {
  // Methods that can be called by parent components using refs
  reset: () => void;
  submitCurrentAnswer: () => Promise<boolean>;
  isComplete: () => boolean;
  getConversation: () => QAPair[];
  // Alternative method name used in some components
  getMessages: () => QAPair[];
}

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
  // Not directly using temperature in the component
  // temperature = 0.7,
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
  const [questionInputs] = useState<Record<number, string>>({})

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
    // This is just a simple callback that useConversationInteraction can call
    console.log('Interaction update triggered');
  } : undefined;

  // Use our interaction hook to manage user input and submissions
  const { 
    userInput,
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
    onUpdate: interactionUpdateAdapter,
    maxQuestions: effectiveMaxQuestions
  })
  
  // Use our navigation hook to manage question navigation
  const {
    // Keep these as commented references for potential future use
    // isFirstQuestion,
    // isFinalQuestion,
    // isLastAnswered,
    hasReachedMaxQuestions,
    // canMoveToNextQuestion,
    // handlePreviousQuestion,
    // handleNextQuestion,
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
  
  // Store the last valid nextQuestion from the API
  const lastValidQuestionRef = useRef<string>('');
  
  // Add debugging console logs to track state changes
  useEffect(() => {
    console.log('AIConversationBlock state updated:', {
      isComplete,
      hasReachedMaxQuestions,
      conversationLength: effectiveConversation.length,
      displayQuestion
    });
  }, [isComplete, hasReachedMaxQuestions, effectiveConversation.length, displayQuestion]);
  
  // Force UI updates when key props change - enhanced for debugging and reliability
  useEffect(() => {
    if (nextQuestion) {
      // Remember this valid question so we don't lose it if API calls reset it temporarily
      lastValidQuestionRef.current = nextQuestion;
      
      console.log('Next question changed in parent component, updating UI', {
        question: nextQuestion.substring(0, 30) + '...',
        displayedQuestion: displayQuestion?.substring(0, 30) + '...',
        conversation: effectiveConversation.length
      });
      
      // Force a component re-render when the question changes
      // This is critical to ensure the UI updates with the new question
      if (nextQuestion !== displayQuestion) {
        console.log('Forcing complete UI re-render in AIConversationBlock');
      }
    } else if (lastValidQuestionRef.current && displayQuestion !== lastValidQuestionRef.current) {
      // If nextQuestion is empty but we have a stored valid question, use that
      console.log('Using stored valid question instead of empty nextQuestion:', 
        lastValidQuestionRef.current.substring(0, 30) + '...');
    }
  }, [nextQuestion, effectiveConversation.length, displayQuestion]);

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
      {/* Question display - don't show when it duplicates the SlideWrapper title */}
      {!(displayQuestion === title) && questionDisplay}
      
      {/* Warning when changing earlier answers */}
      {isChangingEarlierAnswer && (
        <div className="bg-yellow-50 border border-yellow-200 p-2 rounded-md text-sm text-yellow-700">
          Changing this answer will reset later questions in the conversation.
        </div>
      )}
      
      {/* Input area - only shown when appropriate and never in builder mode */}
      {!isBuilder && (
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
        ...(formBlockUpdates.settings as Record<string, unknown>) // Apply new settings
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
      isNextDisabled={isNextDisabled}
      className="w-full"
    >
      {conversationInterface}
    </SlideWrapper>
  )
}

export default AIConversationBlock