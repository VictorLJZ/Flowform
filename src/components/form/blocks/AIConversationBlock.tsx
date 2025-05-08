"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
// import { cn } from "@/lib/utils" - removed unused import
// Removed unused imports
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { SlideWrapper } from "@/components/form/SlideWrapper"
import { BlockPresentation, SlideLayout } from "@/types/form-presentation-types"
import { QAPair } from '@/types/supabase-types'
import { useAIConversation } from '@/hooks/useAIConversation'
import { useConversationDisplay } from '@/hooks/useConversationDisplay'
import { useConversationInteraction } from '@/hooks/useConversationInteraction'
import { useConversationNavigation } from '@/hooks/useConversationNavigation'
import { AIConversationHandle } from '@/types/form-types'

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
    starterPrompt?: string
    startingPrompt?: string // Added this to handle both naming conventions
    maxQuestions?: number
  }
  value?: QAPair[]
  onChange?: (value: QAPair[]) => void
  onUpdate?: (updates: any) => void
  // Navigation props
  onNext?: () => void
  isNextDisabled?: boolean
  responseId: string
  formId: string
  blockRef?: React.RefObject<HTMLDivElement>
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
  formId,
  blockRef
}: AIConversationBlockProps) {
  // Local state
  const [userInput, setUserInput] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isNavigating, setIsNavigating] = useState<boolean>(false)
  const [navigationAttempted, setNavigationAttempted] = useState<boolean>(false)
  
  // Ref for auto-scrolling the conversation history
  const historyContainerRef = useRef<HTMLDivElement>(null)
  
  // Create a local ref if no blockRef is provided
  const localRef = useRef<HTMLDivElement>(null)
  
  // Use the provided blockRef or fall back to local ref
  const effectiveRef = blockRef || localRef
  
  // Determine if we're in builder or viewer mode
  const { mode } = useFormBuilderStore()
  const isBuilder = mode === 'builder'
  
  // Get starter prompt from settings, supporting both naming conventions
  const starterPrompt = settings.startingPrompt || settings.starterPrompt || ''
  
  // Extract maxQuestions from settings if available, otherwise use prop value
  const settingsMaxQuestions = settings.maxQuestions !== undefined ? 
    Number(settings.maxQuestions) : maxQuestions;
    
  // Log maxQuestions data
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('AIConversationBlock maxQuestions:', {
        propValue: maxQuestions,
        settingsValue: settings.maxQuestions,
        effectiveValue: settingsMaxQuestions
      });
    }
  }, [maxQuestions, settings.maxQuestions, settingsMaxQuestions]);
  
  // Use AI conversation hook with maxQuestions passed through
  const {
    conversation = [], 
    nextQuestion = '', 
    isComplete = false,
    submitAnswer,
    isLoading,
    error
  } = useAIConversation(
    responseId || '', 
    id, 
    formId || '', 
    isBuilder,
    settingsMaxQuestions // Use the value from settings
  )
  
  // Track if this is the first question - it's only true if conversation is empty
  const isFirstQuestion = useMemo(() => conversation.length === 0, [conversation])
  
  // Calculate progress information
  const questionCount = conversation.length
  const showMaxQuestions = settingsMaxQuestions > 0
  const progressText = showMaxQuestions 
    ? `Question ${questionCount + (isFirstQuestion ? 0 : 1)} of ${settingsMaxQuestions}` 
    : `Question ${questionCount + (isFirstQuestion ? 0 : 1)}`
  
  // Check if we've reached max questions
  const hasReachedMaxQuestions = settingsMaxQuestions > 0 && conversation.length >= settingsMaxQuestions;
  
  // Add derived state for more accurate tracking
  const effectiveIsComplete = useMemo(() => {
    return isComplete || hasReachedMaxQuestions
  }, [isComplete, hasReachedMaxQuestions])
  
  // Handle submit
  const handleSubmit = async () => {
    if (!userInput.trim() || isSubmitting) return
    
    try {
      setIsSubmitting(true)
      
      // Get the appropriate question for submission
      const questionToSubmit = isFirstQuestion 
        ? starterPrompt 
        : nextQuestion;
      
      await submitAnswer(
        questionToSubmit,
        userInput,
        isFirstQuestion ? 0 : conversation.length,
        isFirstQuestion
      )
      
      // Clear input after submission
      setUserInput('')
      
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle navigation to next section with error resilience
  const handleNext = () => {
    if (!onNext || isNavigating) return
    
    // Track that navigation was attempted (for error resilience)
    setNavigationAttempted(true)
    setIsNavigating(true)
    
    try {
      // Set a max timeout to ensure navigation happens even if there's an error
      const timeoutId = setTimeout(() => {
        if (isNavigating && navigationAttempted) {
          console.log('Navigation timeout reached - forcing navigation')
          onNext()
          setIsNavigating(false)
        }
      }, 1500)
      
      // Add a small delay to prevent double clicks
      setTimeout(() => {
        try {
          onNext()
        } catch (error) {
          console.error('Error during navigation:', error)
          // Continue anyway after a short delay
          setTimeout(() => onNext(), 100)
        } finally {
          clearTimeout(timeoutId)
          setIsNavigating(false)
        }
      }, 100)
    } catch (error) {
      console.error('Error setting up navigation:', error)
      // Last resort - direct call
      onNext()
      setIsNavigating(false)
    }
  }
  
  // Force navigation if stuck for too long with navigation attempted
  useEffect(() => {
    if (!navigationAttempted || !isNavigating || !onNext) return
    
    const timeoutId = setTimeout(() => {
      if (isNavigating && navigationAttempted) {
        console.log('Navigation appears stuck - forcing navigation')
        try {
          onNext()
        } catch (error) {
          console.error('Forced navigation error:', error)
        }
        setIsNavigating(false)
        setNavigationAttempted(false)
      }
    }, 2500)
    
    return () => clearTimeout(timeoutId)
  }, [navigationAttempted, isNavigating, onNext])
  
  // Implement ref methods for external components to interact with this component
  const conversationHandleRef = useRef<AIConversationHandle>({
    reset: () => {
      setUserInput('');
    },
    submitCurrentAnswer: async () => {
      await handleSubmit();
      return true;
    },
    isComplete: () => effectiveIsComplete,
    getConversation: () => conversation,
    getMessages: () => conversation
  });
  
  // Update handle methods when dependencies change
  useEffect(() => {
    conversationHandleRef.current.isComplete = () => effectiveIsComplete;
    conversationHandleRef.current.getConversation = () => conversation;
    conversationHandleRef.current.getMessages = () => conversation;
  }, [conversation, effectiveIsComplete]);
  
  // Handle form value changes
  useEffect(() => {
    if (onChange && !isBuilder) {
      onChange(conversation)
    }
  }, [conversation, onChange, isBuilder])
  
  // Auto-scroll to the bottom of the conversation history when it updates
  useEffect(() => {
    if (historyContainerRef.current) {
      const container = historyContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [conversation]);
  
  // Log component state updates
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('AIConversationBlock state updated:', {
        isComplete: effectiveIsComplete,
        hasReachedMaxQuestions,
        conversationLength: conversation.length,
        maxQuestions: settingsMaxQuestions,
        nextQuestion: nextQuestion ? nextQuestion.substring(0, 20) + '...' : 'missing'
      });
    }
  }, [effectiveIsComplete, hasReachedMaxQuestions, conversation.length, settingsMaxQuestions, nextQuestion]);
  
  // Auto-trigger isComplete when max questions is reached
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    
    // Debug logging to help track the issue
    if (process.env.NODE_ENV === 'development') {
      console.log('Checking max questions condition:', {
        conversationLength: conversation.length,
        settingsMaxQuestions,
        hasReachedMaxQuestions,
        isComplete,
        shouldAutoNavigate: hasReachedMaxQuestions && !isComplete && onNext
      });
    }
    
    if (hasReachedMaxQuestions && !isComplete && onNext) {
      console.log('Max questions reached, triggering completion');
      // Add a short delay to allow rendering to complete
      timeoutId = setTimeout(() => {
        try {
          onNext();
        } catch (error) {
          console.error('Error in auto-navigation:', error);
        }
      }, 300);
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isComplete, hasReachedMaxQuestions, conversation.length, onNext, settingsMaxQuestions]);
  
  // Create a standard layout for SlideWrapper
  const standardLayout: SlideLayout = {
    type: 'standard',
    alignment: 'left',
    spacing: 'normal'
  };
  
  // Prepare presentation settings
  const presentation = settings.presentation || {
    layout: 'left',
    spacing: 'normal',
    titleSize: 'medium'
  };
  
  // Determine which question to show to the user
  const currentQuestion = useMemo(() => {
    // If we're at the first question, show starter prompt
    if (isFirstQuestion) {
      return starterPrompt;
    }
    
    // Otherwise show the next AI-generated question if we have one
    if (nextQuestion) {
      return nextQuestion;
    }
    
    // Fallback to the last question in conversation if no next question exists
    const lastQuestion = conversation.length > 0 ? conversation[conversation.length - 1]?.question : '';
    if (lastQuestion) {
      return lastQuestion;
    }
    
    // Final fallback
    return starterPrompt;
  }, [isFirstQuestion, starterPrompt, conversation, nextQuestion]);
  
  // Determine if this is the initial unanswered state
  const isInitialState = isFirstQuestion && !isComplete;
  
  // Determine if block can be skipped based on required flag
  const canSkip = !required;
  
  // Helper function to get mapped conversation with first question always showing the starter prompt
  const getMappedConversation = () => {
    if (conversation.length === 0) return [];
    
    return conversation.map((item, idx) => {
      // Make sure the first question always shows the starter prompt
      if (idx === 0 && item.question !== starterPrompt) {
        return {
          ...item,
          question: starterPrompt
        };
      }
      return item;
    });
  };
  
  // Get the mapped conversation for display
  const displayConversation = getMappedConversation();
  
  // For dynamic title, we'll pass the current question as title when not in builder mode
  const effectiveTitle = !isBuilder && !isFirstQuestion && nextQuestion ? nextQuestion : title;
  
  // Render
  return (
    <SlideWrapper
      id={id}
      title={effectiveTitle}
      description={description}
      required={required}
      index={index}
      totalBlocks={totalBlocks}
      settings={{
        presentation: presentation,
        layout: settings.layout || standardLayout
      }}
      onUpdate={onUpdate}
      onNext={onNext}
      isNextDisabled={isNextDisabled}
      blockRef={effectiveRef}
    >
      {isBuilder && !starterPrompt ? (
        <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-md">
          <h3 className="font-medium mb-2">AI Conversation Configuration</h3>
          <p className="text-sm mb-4">Please configure a starting prompt/question in the block settings.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Loading indicator */}
          {(isLoading || isSubmitting) && (
            <div className="text-center py-4">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full inline-block mr-2" />
              <span>Loading conversation...</span>
            </div>
          )}
          
          {/* Display errors if any */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
              <p className="text-sm">Error: {typeof error === 'string' ? error : (error as any)?.message || 'Failed to load conversation'}</p>
            </div>
          )}
          
          {!isLoading && (
            <>
              {/* Progress indicator */}
              {settingsMaxQuestions > 0 && (
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>{progressText}</span>
                  <span>{Math.min(conversation.length, settingsMaxQuestions)} of {settingsMaxQuestions} completed</span>
                </div>
              )}
              
              {/* Current Question - Only show if there's actually a question to display and we're in builder mode */}
              {currentQuestion && isBuilder && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p>{currentQuestion}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Previous conversation history (if any) - Only include questions after the first one */}
              {displayConversation.length > 0 && (
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-sm font-medium">Conversation History</h3>
                    <span className="text-xs text-gray-500">{displayConversation.length} {displayConversation.length === 1 ? 'response' : 'responses'}</span>
                  </div>
                  <div 
                    ref={historyContainerRef}
                    className="p-4 space-y-4 max-h-64 overflow-y-auto"
                  >
                    {displayConversation.map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        {/* Always show the question in history */}
                        <div className="bg-blue-50 p-3 rounded-md">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-blue-800">Question {idx + 1}:</p>
                            {idx === 0 && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Starter</span>
                            )}
                          </div>
                          <p className="text-sm">{item.question}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md ml-4">
                          <p className="text-sm font-medium text-gray-800">Your answer:</p>
                          <p className="text-sm">{item.answer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Only show answer field if not complete */}
              {!effectiveIsComplete && (
                <div>
                  <Textarea
                    placeholder="Type your answer here..."
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.shiftKey && !isSubmitting && userInput.trim()) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    rows={4}
                    className="w-full"
                    disabled={isSubmitting || isLoading || effectiveIsComplete}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Press Shift+Enter to submit your answer
                  </p>
                </div>
              )}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <div>
                  {/* Empty div for flex alignment */}
                </div>
                
                {effectiveIsComplete ? (
                  // Show Continue button when all questions are answered
                  <Button 
                    onClick={handleNext}
                    disabled={isNextDisabled || isNavigating}
                  >
                    {isNavigating ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full inline-block mr-2" />
                        Continuing...
                      </>
                    ) : (
                      'Continue'
                    )}
                  </Button>
                ) : isInitialState && canSkip ? (
                  // Show both Submit and Skip buttons for initial question when skippable
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleNext}
                      disabled={isNavigating}
                    >
                      {isNavigating ? 'Skipping...' : 'Skip'}
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || isLoading || !userInput}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full inline-block mr-2" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Answer'
                      )}
                    </Button>
                  </div>
                ) : (
                  // Regular Submit Answer button
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || isLoading || !userInput}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full inline-block mr-2" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Answer'
                    )}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </SlideWrapper>
  )
}

export default AIConversationBlock