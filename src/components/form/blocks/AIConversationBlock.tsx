"use client"

import React, { useState, useEffect, useRef, useMemo, useImperativeHandle, forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Send, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { SlideWrapper } from "@/components/form/SlideWrapper"
import { BlockPresentation } from "@/types/theme-types"
import { SlideLayout } from "@/types/layout-types"
import { useAIConversation } from "@/hooks/useAIConversation"
import { QAPair } from "@/types/supabase-types"
import { useFormBuilderStore } from "@/stores/formBuilderStore"

export interface AIConversationBlockProps {
  // Analytics props
  analytics?: {
    trackFocus?: (data?: Record<string, unknown>) => void
    trackBlur?: (data?: Record<string, unknown>) => void
    trackChange?: (data?: Record<string, unknown>) => void
    blockRef?: React.RefObject<HTMLDivElement | null>
  }
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
    title: string;
    description: string | null;
    settings: { 
      startingPrompt?: string;
      maxQuestions?: number;
      temperature?: number;
      contextInstructions?: string;
      presentation?: BlockPresentation;
      layout?: SlideLayout;
    } | null;
  }>) => void
  onNext?: () => void
  isNextDisabled?: boolean
  responseId: string
  formId: string
}

export interface AIConversationHandle {
  getMessages: () => QAPair[];
}

const AIConversationBlockInternal = forwardRef<AIConversationHandle, AIConversationBlockProps>(({ 
  analytics,
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
}, ref) => {

  // Local component state
  const [userInput, setUserInput] = useState("")
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0)
  // Store inputs for each question to preserve them when navigating
  const [questionInputs, setQuestionInputs] = useState<Record<number, string>>({})
  // Add a local loading state to prevent UI changes during submission
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false)
  // Track whether we're changing an earlier answer that will reset later questions
  const [isChangingEarlierAnswer, setIsChangingEarlierAnswer] = useState(false)

  // Determine if we're in builder or viewer mode
  const { mode } = useFormBuilderStore()
  const isBuilder = mode === 'builder'
  
  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Use our safe hook that handles both modes properly
  const {
    conversation, 
    nextQuestion, 
    maxQuestions, 
    isSubmitting, 
    error, 
    submitAnswer
  } = useAIConversation(responseId, id, formId, isBuilder);
  
  // Default to value prop in builder mode, but don't use it for UI display in builder
  // Using useMemo to prevent creating a new array reference on every render
  const effectiveConversation = useMemo(() => {
    return isBuilder ? (value || []) : conversation;
  }, [isBuilder, value, conversation]);

  // Computed values
  const isFirstQuestion = activeQuestionIndex === 0;
  // Fix the off-by-one error in max questions check
  const hasReachedMaxQuestions = maxQuestions > 0 && activeQuestionIndex >= maxQuestions;
  const starterPrompt = title || '';

  // Create state to directly manage the displayed question with better control
  const [displayQuestion, setDisplayQuestion] = useState<string>("");
  
  // Store the current data state for debugging
  const dataStateRef = useRef<{index: number, conversation: QAPair[], nextQ: string}>({index: -1, conversation: [], nextQ: ""});
  
  // Force component re-render when key data changes
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Debug specifically for the nextQuestion state
  useEffect(() => {
    if (nextQuestion) {
      console.log('IMPORTANT: nextQuestion changed to:', nextQuestion.substring(0, 40) + '...');
      // Force update display question when nextQuestion changes
      setDisplayQuestion(nextQuestion);
    }
  }, [nextQuestion]);
  
  // Key debug function to determine what question should be displayed
  const determineCurrentQuestion = () => {
    const currentState = {
      isFirstQ: isFirstQuestion,
      promptText: starterPrompt,
      activeIndex: activeQuestionIndex,
      convoLength: effectiveConversation.length,
      hasQuestion: activeQuestionIndex < effectiveConversation.length, 
      nextQuestion: nextQuestion || "[none]"
    };
    
    console.log('Question determination data:', currentState);
    
    if (isFirstQuestion) {
      return { text: starterPrompt, source: 'starter' };
    } else if (activeQuestionIndex < effectiveConversation.length && effectiveConversation[activeQuestionIndex]?.question) {
      return { text: effectiveConversation[activeQuestionIndex].question, source: 'conversation' };
    } else if (nextQuestion) {
      return { text: nextQuestion, source: 'api' };
    } else {
      return { text: "Loading next question...", source: 'loading' };
    }
  }
  
  // Update displayed question when key dependencies change
  useEffect(() => {
    // Capture previous state for comparison
    const prevState = {
      index: dataStateRef.current.index,
      convoLength: dataStateRef.current.conversation.length,
      nextQ: dataStateRef.current.nextQ
    };
    
    // Update the reference with new state
    dataStateRef.current = {
      index: activeQuestionIndex,
      conversation: [...effectiveConversation],
      nextQ: nextQuestion || ""
    };
    
    // Detect what changed
    const changes = {
      indexChanged: prevState.index !== activeQuestionIndex,
      convoChanged: prevState.convoLength !== effectiveConversation.length,
      nextQChanged: prevState.nextQ !== nextQuestion
    };
    
    console.log('State changes detected:', changes);
    
    // Determine the new question to display
    const newQuestionData = determineCurrentQuestion();
    
    // Only update if the question source or text actually changed
    if (newQuestionData.text && newQuestionData.text !== displayQuestion) {
      console.log(`Updating question from ${newQuestionData.source} source:`, {
        current: displayQuestion.substring(0, 30) + (displayQuestion.length > 30 ? '...' : ''),
        new: newQuestionData.text.substring(0, 30) + (newQuestionData.text.length > 30 ? '...' : '')
      });
      
      // Don't show loading state if we're just waiting a moment for nextQuestion to load
      // and we already have an existing question displayed
      if (newQuestionData.source === 'loading' && displayQuestion && displayQuestion !== "Loading next question...") {
        console.log('Skipping transition to loading state, keeping existing question displayed');
        return;
      }
      
      setDisplayQuestion(newQuestionData.text);
    }
  }, [starterPrompt, isFirstQuestion, activeQuestionIndex, effectiveConversation, nextQuestion]);
  
  // Calculate display title and force update when needed
  const displayTitle = displayQuestion;
  
  // Force a component update when crucial values change
  const renderKey = `${activeQuestionIndex}-${nextQuestion ? 'hasNext' : 'noNext'}-${effectiveConversation.length}`;

  // Determine if current question is answered
  const isActiveQuestionAnswered = isFirstQuestion
    ? true // First question is always considered "answered" as it's just a prompt
    : activeQuestionIndex < effectiveConversation.length;
    
  // Show input in the following cases:
  // 1. When submitting to prevent UI flicker
  // 2. When viewing a previous question to allow editing
  // 3. When we're within max questions and the current question needs an answer
  const showInput = (isLocalSubmitting || 
    // Always show input when navigating back to previous questions
    activeQuestionIndex < maxQuestions) && 
    // Don't show input if we're still loading the next question
    displayQuestion !== "Loading next question...";
  

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
      // Save current input value if any
      if (userInput && !isSubmitting) {
        setQuestionInputs(prev => ({ ...prev, [activeQuestionIndex]: userInput }));
      }
      
      const prevIndex = activeQuestionIndex - 1;
      setActiveQuestionIndex(prevIndex);
      
      // Restore previous input value if any
      setUserInput(questionInputs[prevIndex] || '');
      
      if (analytics?.trackChange) {
        analytics.trackChange({ 
          action: 'navigate_question',
          direction: 'backward',
          from_index: activeQuestionIndex,
          to_index: prevIndex
        });
      }
      
      // If going to a previous question and user changes the answer,
      // subsequent questions will be reset - we could show a message here
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
    // Check if there's an answer to submit
    if (!userInput.trim() || isSubmitting || isLocalSubmitting) return;
    
    try {
      // Set local loading state to prevent UI changes
      setIsLocalSubmitting(true);
      // Determine if this is the starter question
      const isStarter = activeQuestionIndex === 0;
      
      // Determine the question text based on active index
      let questionText = isStarter ? starterPrompt : displayQuestion;
      
      // Get the answer
      const answer = userInput.trim();
      
      // Track the conversation submission for analytics
      if (analytics?.trackChange) {
        analytics.trackChange({
          input_type: 'ai_conversation',
          action: 'submit_response',
          question_index: activeQuestionIndex,
          response_length: answer.length,
          is_first_question: isStarter,
          conversation_length: effectiveConversation.length
        });
      }
      
      // Track the answer in local state
      setQuestionInputs(prev => ({ ...prev, [activeQuestionIndex]: answer }));
      
      // Reset input
      setUserInput("");
      
      // Determine if we're changing an earlier answer that should reset later questions
      const shouldResetLaterQuestions = activeQuestionIndex < effectiveConversation.length - 1;
      
      if (isBuilder) {
        // In builder mode, we'll need to manually update the state
        // since we're not making API calls
        const newPair = {
          question: questionText,
          answer,
          timestamp: new Date().toISOString(),
          is_starter: isStarter
        };
        
        // If we're editing an existing QA pair, replace it; otherwise add a new one
        let updatedValue;
        
        if (activeQuestionIndex < value.length) {
          if (shouldResetLaterQuestions) {
            // Truncate the conversation at this index and replace the current QA pair
            updatedValue = value.slice(0, activeQuestionIndex).concat([newPair]);
            console.log(`Builder mode: Truncating conversation at index ${activeQuestionIndex}`);
          } else {
            // Replace existing QA pair without truncation
            updatedValue = value.map((item, i) => i === activeQuestionIndex ? newPair : item);
          }
          
          // Stay at the current question if we reset later questions, otherwise move to next
          if (!shouldResetLaterQuestions && activeQuestionIndex + 1 < value.length) {
            setActiveQuestionIndex(activeQuestionIndex + 1);
          }
        } else {
          // Add new QA pair
          updatedValue = [...value, newPair];
          
          // Advance to next question if we haven't reached the max
          if (activeQuestionIndex < settings.maxQuestions - 1) {
            setActiveQuestionIndex(activeQuestionIndex + 1);
          }
        }
        
        // Update the form data
        if (onChange) {
          onChange(updatedValue);
        }
      } else {
        // In viewer mode, make a real API call
        // Check if we've reached max questions and should move to next block
        const isLastQuestion = activeQuestionIndex >= maxQuestions - 1;
        
        // Pass the questionIndex to indicate where to truncate the conversation if we're changing an earlier answer
        if (shouldResetLaterQuestions) {
          console.log(`Submitting answer for question ${activeQuestionIndex}, will reset later questions`);
          setIsChangingEarlierAnswer(true);
          
          try {
            // Submit answer with the questionIndex to trigger truncation
            const result = await submitAnswer(questionText, answer, activeQuestionIndex, isStarter);
            
            // After submitting an answer that resets later questions:
            // 1. The conversation is truncated at the specified index
            // 2. A new question will have been generated and returned in nextQuestion
            
            console.log('Conversation after truncation:', {
              conversationLength: result?.conversation?.length,
              hasNextQuestion: !!result?.nextQuestion
            });
            
            // Important: We're staying at the current index, not advancing
            // The next question will be displayed via the activeQuestion logic since
            // the effectiveConversation array will have been shortened
          } finally {
            // Reset the warning flag after submission
            setIsChangingEarlierAnswer(false);
          }
        } else {
          // Normal case - append to conversation
          try {
            const result = await submitAnswer(questionText, answer, undefined, isStarter);
            
            console.log('Conversation after normal submission:', {
              conversationLength: result?.conversation?.length,
              hasNextQuestion: !!result?.nextQuestion,
              currentIndex: activeQuestionIndex
            });
            
            // If this is the last question and we have onNext, use it to move to next block
            if (isLastQuestion && onNext) {
              onNext();
              setIsLocalSubmitting(false);
              return;
            }
            
            // Force a refresh of active question index to trigger re-render
            const currentLength = result?.conversation?.length || 0;
            
            // If we just answered the last question in the conversation, move to the next index
            // which will show the next question (from nextQuestion)
            if (activeQuestionIndex === currentLength - 1) {
              // Add a small delay to ensure the state has been updated properly
              // This helps with synchronization issues in the UI
              
              // Add an immediate update with important flag setting to prevent flash of loading state
              if (nextQuestion) {
                console.log('IMPORTANT: Moving to next question with:', nextQuestion.substring(0, 20) + '...');
                // Directly set the display question to the next question first
                // This prevents the flash of "Loading next question..."
                setDisplayQuestion(nextQuestion);
              }
              
              // IMPORTANT: Update the index AFTER setting the display question
              // This sequence ensures we don't get the loading state showing
              setActiveQuestionIndex(currentLength);
              
              // Force a component update to ensure the UI reflects the changes
              setForceUpdate(prev => prev + 1);
              
              // Add a more aggressive refresh mechanism to catch potential race conditions
              setTimeout(() => {
                // Force update the display question again after a delay
                if (nextQuestion) {
                  console.log('DELAYED UPDATE: Setting display question to next question');
                  setDisplayQuestion(nextQuestion);
                }
                
                // Also update the active index
                if (activeQuestionIndex !== currentLength) {
                  setActiveQuestionIndex(currentLength);
                }
                
                // Force another component update
                setForceUpdate(prev => prev + 1);
              }, 100);
            }
          } catch (error) {
            console.error('Error processing normal submission:', error);
          }
        }
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("Error submitting answer:", error);
      
      // Track error for analytics
      if (analytics?.trackChange) {
        analytics.trackChange({
          input_type: 'ai_conversation',
          action: 'error',
          error_message: error.message || 'Unknown error'
        });
      }
    } finally {
      setIsLocalSubmitting(false);
    }
  };

  // Handle Enter key to submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  useImperativeHandle(ref, () => ({
    getMessages: () => effectiveConversation
  }));

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
      key={renderKey} // Add a key to force re-render when needed
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
        
        {/* Message when changing an earlier answer */}
        {isChangingEarlierAnswer && (
          <div className="mb-4 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-2">
            Changing this answer will reset all subsequent questions.
          </div>
        )}
        
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
});

AIConversationBlockInternal.displayName = 'AIConversationBlock';

export const AIConversationBlock = AIConversationBlockInternal;
