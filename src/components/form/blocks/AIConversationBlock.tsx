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

// AI Conversation Block
// 
// This component provides an interactive AI-powered conversation experience in forms.
// 
// Features:
// - Dynamic question generation based on user answers
// - Support for editing previous answers with question regeneration
// - Navigation between questions in a conversation
// - Automatic progression when reaching max questions
// - Persistence of conversation state
//
// The edit feature works as follows:
// 1. Users can click on previous questions in the conversation history
// 2. When editing a previous answer, the component will:
//    - Show the previous question and existing answer
//    - When submitted, truncate the conversation at that point
//    - Regenerate subsequent questions based on the new answer
//    - Move focus to the next question after the edited one
// 3. When returning to a previously completed block:
//    - No automatic forwarding will occur
//    - Users can view and edit their previous answers
// 
// Implementation notes:
// - Uses activeQuestionIndex to track which question is being viewed/edited
// - Tracks hasNavigatedForward to prevent repetitive automatic navigation
// - Detects when users return to a block with hasReturnedToBlock
// - Ensures database saves only happen once per submission

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
  
  // Add state for tracking the active question index and navigation history
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0)
  const [hasNavigatedForward, setHasNavigatedForward] = useState<boolean>(false)
  const [hasReturnedToBlock, setHasReturnedToBlock] = useState<boolean>(false)
  
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
  
  // Log starter prompt for debugging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('AIConversationBlock starterPrompt:', {
        fromStartingPrompt: settings.startingPrompt,
        fromStarterPrompt: settings.starterPrompt,
        effectiveValue: starterPrompt,
        isEmpty: !starterPrompt,
        length: starterPrompt?.length
      });
    }
  }, [settings.startingPrompt, settings.starterPrompt, starterPrompt]);
  
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
  
  // Add activeQuestionIndex initialization based on conversation state
  const initialQuestionIndex = useMemo(() => {
    if (conversation.length === 0) {
      console.log('Initializing with empty conversation, setting index to 0');
      return 0; // Start at the beginning for new blocks
    } else {
      const index = Math.min(conversation.length, settingsMaxQuestions || 5);
      console.log(`Initializing with existing conversation (length ${conversation.length}), setting index to ${index}`);
      return index;
    }
  }, [conversation.length, settingsMaxQuestions]);
  
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
    // Consider complete when either explicitly marked as complete OR max questions reached
    const hasReachedMax = settingsMaxQuestions > 0 && conversation.length >= settingsMaxQuestions;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Checking effective completion status:', {
        isComplete,
        hasReachedMaxQuestions,
        settingsMaxQuestions,
        conversationLength: conversation.length,
        reachedMax: hasReachedMax
      });
    }
    
    return isComplete || hasReachedMax;
  }, [isComplete, hasReachedMaxQuestions, conversation.length, settingsMaxQuestions]);
  
  // Add a ref to track when the component was mounted
  const mountTimeRef = useRef(new Date().getTime());
  
  // Update activeQuestionIndex when initialQuestionIndex changes (on initial load)
  useEffect(() => {
    console.log(`Updating activeQuestionIndex to ${initialQuestionIndex} from initialQuestionIndex calculation`);
    setActiveQuestionIndex(initialQuestionIndex);
  }, [initialQuestionIndex]);
  
  // Handle submit
  const handleSubmit = async () => {
    if (!userInput.trim() || isSubmitting) return
    
    try {
      setIsSubmitting(true)
      
      // Get the appropriate question for submission based on activeQuestionIndex
      let questionToSubmit;
      let isEditingPreviousQuestion = false;
      
      if (activeQuestionIndex < conversation.length) {
        // Editing a previous question
        questionToSubmit = conversation[activeQuestionIndex].question;
        isEditingPreviousQuestion = true;
      } else if (isFirstQuestion) {
        // Answering the starter question
        questionToSubmit = starterPrompt;
      } else {
        // Answering the next/current question
        questionToSubmit = nextQuestion;
      }
      
      // Log what we're about to submit
      console.log('Submitting answer with:', {
        isFirstQuestion,
        isEditingPreviousQuestion,
        activeQuestionIndex,
        questionToSubmit,
        questionLength: questionToSubmit?.length || 0,
        userInput: userInput.length > 20 ? userInput.substring(0, 20) + '...' : userInput,
        conversationLength: conversation.length
      });
      
      // Add fallback for empty question to prevent saving "What's your starter question?"
      const finalQuestion = questionToSubmit || 
        (isFirstQuestion ? title || 'Initial question' : 'Follow-up question');
      
      // Pass the appropriate question index based on what we're editing
      await submitAnswer(
        finalQuestion,
        userInput,
        isEditingPreviousQuestion ? activeQuestionIndex : (isFirstQuestion ? 0 : conversation.length),
        isFirstQuestion && !isEditingPreviousQuestion
      );
      
      // After submitting, if editing a previous question, advance to the next question
      if (isEditingPreviousQuestion) {
        // Move to the next question after the one we just edited
        setActiveQuestionIndex(activeQuestionIndex + 1);
      } else {
        // For new questions, clear input and advance to the next question
        setUserInput('');
        // Set active index to the end of the conversation (the new current question)
        setActiveQuestionIndex(conversation.length + 1);
      }
      
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
        hasNavigatedForward,
        hasReturnedToBlock,
        shouldAutoNavigate: hasReachedMaxQuestions && !isComplete && onNext && !hasNavigatedForward && !hasReturnedToBlock
      });
    }
    
    // Only auto-navigate if:
    // 1. We have reached max questions
    // 2. We haven't already navigated for this block session
    // 3. This isn't a return visit to the block (OR we explicitly want to navigate on returns as well)
    if (hasReachedMaxQuestions && !isComplete && onNext && 
        (!hasNavigatedForward || (effectiveIsComplete && !hasNavigatedForward))) {
      console.log('Max questions reached, triggering completion');
      setHasNavigatedForward(true);
      
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
  }, [isComplete, hasReachedMaxQuestions, conversation.length, onNext, settingsMaxQuestions, hasNavigatedForward, hasReturnedToBlock, effectiveIsComplete]);
  
  // Update effect for detecting return to previous block to properly handle navigating to start
  useEffect(() => {
    // Reset when component first mounts with conversation data
    const isReturnVisit = conversation.length > 0;
    const currentTime = new Date().getTime();
    const timeElapsedSinceMount = currentTime - mountTimeRef.current;
    
    // If significant time has passed (>2s) and we have conversation data, 
    // this is almost certainly a return visit rather than initial load
    const isLikelyReturnFromOtherBlock = timeElapsedSinceMount > 2000 && isReturnVisit;
    
    if (isReturnVisit) {
      console.log('User appears to have returned to a previously answered AIConversationBlock', {
        conversationLength: conversation.length,
        hasReturnedToBlock,
        timeElapsedSinceMount,
        isLikelyReturnFromOtherBlock,
        settingsMaxQuestions,
        isComplete,
        effectiveIsComplete
      });
      
      // Mark as a return visit
      if (!hasReturnedToBlock) {
        setHasReturnedToBlock(true);
        
        // Reset navigation flag if this is a genuine return from another block
        if (isLikelyReturnFromOtherBlock) {
          setHasNavigatedForward(false);
        }
      }
      
      // If we're just returning, we should focus on the latest question
      if (activeQuestionIndex === 0 && conversation.length > 0) {
        // On initial render, set to the latest answer or conversation length (for current)
        const newIndex = Math.min(conversation.length, settingsMaxQuestions);
        console.log(`Setting active question index to ${newIndex} based on return visit detection`);
        setActiveQuestionIndex(newIndex); 
      }
    }
  }, [conversation, hasReturnedToBlock, activeQuestionIndex, settingsMaxQuestions, isComplete, effectiveIsComplete]);
  
  // Update active question index when conversation changes
  useEffect(() => {
    // If we're at a question beyond the conversation length, reset to the latest
    if (activeQuestionIndex > conversation.length) {
      setActiveQuestionIndex(conversation.length);
    }
  }, [conversation.length, activeQuestionIndex]);
  
  // Effect to update user input based on active question index
  useEffect(() => {
    // If viewing a previous question, show its answer
    if (activeQuestionIndex < conversation.length) {
      setUserInput(conversation[activeQuestionIndex].answer || '');
    } else {
      // When viewing the next/current question, clear the input
      setUserInput('');
    }
  }, [activeQuestionIndex, conversation]);
  
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
    // If viewing a past question in the conversation
    if (activeQuestionIndex < conversation.length) {
      return conversation[activeQuestionIndex].question;
    }
    
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
  }, [activeQuestionIndex, conversation, isFirstQuestion, starterPrompt, nextQuestion]);
  
  // Determine if this is the initial unanswered state
  const isInitialState = isFirstQuestion && !isComplete;
  
  // Determine if block can be skipped based on required flag
  const canSkip = !required;
  
  // Helper function to get mapped conversation with first question always showing the starter prompt
  const getMappedConversation = () => {
    if (conversation.length === 0) return [];
    
    return conversation.map((item, idx) => {
      // Make sure the first question always shows the starter prompt
      if (idx === 0) {
        // If this is the first item, always ensure it shows the proper starter prompt
        // regardless of what's actually saved in the database
        // Use multiple fallbacks to ensure we show something meaningful:
        // 1. Original starterPrompt from settings
        // 2. The title of the block
        // 3. The saved question from the database
        // 4. A generic "Initial question" default
        return {
          ...item,
          question: starterPrompt || title || item.question || "Initial question"
        };
      }
      return item;
    });
  };
  
  // Get the mapped conversation for display
  const displayConversation = getMappedConversation();
  
  // For dynamic title, we'll pass the current question as title when not in builder mode
  const effectiveTitle = useMemo(() => {
    if (isBuilder) {
      return title;
    }

    // When editing a previous question, show that question as the title
    if (activeQuestionIndex < conversation.length) {
      return conversation[activeQuestionIndex].question;
    }
    
    // For new questions, use the next question as title
    if (!isFirstQuestion && nextQuestion) {
      return nextQuestion;
    }
    
    // Default to the block title
    return title;
  }, [isBuilder, title, activeQuestionIndex, conversation, isFirstQuestion, nextQuestion]);
  
  // Add effect to log when activeQuestionIndex changes
  useEffect(() => {
    console.log('activeQuestionIndex changed:', {
      activeQuestionIndex,
      conversationLength: conversation.length,
      displayConversationLength: displayConversation.length
    });
  }, [activeQuestionIndex, conversation.length, displayConversation.length]);
  
  // Add custom function to handle navigation to make debugging easier
  const handleQuestionNavigation = (index: number) => {
    console.log(`Navigation requested to question ${index}`, {
      currentIndex: activeQuestionIndex,
      conversationLength: conversation.length
    });
    setActiveQuestionIndex(index);
  };
  
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
              
              {/* Question navigation - Only show if we have more than one question */}
              {conversation.length > 0 && (
                <div className="mb-4 border p-3 rounded-md bg-gray-50">
                  <h4 className="text-sm font-medium mb-2">Navigate Questions</h4>
                  <div className="flex flex-wrap gap-2">
                    {displayConversation.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`px-3 py-1.5 text-sm rounded-md ${
                          activeQuestionIndex === idx 
                            ? 'bg-primary text-primary-foreground font-medium' 
                            : 'bg-white border border-gray-200 hover:bg-gray-100 text-gray-800'
                        }`}
                        onClick={() => handleQuestionNavigation(idx)}
                      >
                        {idx === 0 ? 'Start' : `Q${idx + 1}`}
                      </button>
                    ))}
                    {!effectiveIsComplete && (
                      <button
                        type="button"
                        className={`px-3 py-1.5 text-sm rounded-md ${
                          activeQuestionIndex === conversation.length 
                            ? 'bg-primary text-primary-foreground font-medium' 
                            : 'bg-white border border-gray-200 hover:bg-gray-100 text-gray-800'
                        }`}
                        onClick={() => handleQuestionNavigation(conversation.length)}
                      >
                        Current
                      </button>
                    )}
                  </div>
                  {hasReturnedToBlock && (
                    <p className="text-xs text-gray-500 mt-2">
                      You can edit your previous answers and generate new follow-up questions.
                    </p>
                  )}
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