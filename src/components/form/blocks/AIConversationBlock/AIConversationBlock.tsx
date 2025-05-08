"use client"

import React, { useRef, useMemo } from "react"
import { useFormBuilderStore } from "@/stores/formBuilderStore"
import { SlideWrapper } from "@/components/form/SlideWrapper"
import { AIConversationBlockProps } from './types'
import { useAIConversationState } from './useAIConversationState'
import { useAIConversationNavigation } from './useAIConversationNavigation'
import { AIConversationNavigation } from './AIConversationNavigation'
import { AIConversationHistory } from './AIConversationHistory'
import { AIConversationInput } from './AIConversationInput'
import { AIConversationButtons } from './AIConversationButtons'
import { AIConversationHandle } from '@/types/form-types'

/**
 * AI Conversation Block
 * 
 * This component provides an interactive AI-powered conversation experience in forms.
 */
export function AIConversationBlock({
  id,
  title = '',
  description,
  required,
  index,
  totalBlocks,
  maxQuestions = 0,
  settings = {},
  value = [],
  onChange,
  onUpdate,
  onNext,
  isNextDisabled,
  responseId,
  formId,
  blockRef,
  onPrevious
}: AIConversationBlockProps) {
  // Create a local ref if no blockRef is provided
  const localRef = useRef<HTMLDivElement>(null);
  
  // Use the provided blockRef or fall back to local ref
  const effectiveRef = blockRef || localRef;

  // Determine if we're in builder or viewer mode
  const { mode } = useFormBuilderStore();
  const isBuilder = mode === 'builder';
  
  // Get starter prompt from settings, supporting both naming conventions
  const starterPrompt = settings.startingPrompt || settings.starterPrompt || '';
  
  // Log starter prompt for debugging
  React.useEffect(() => {
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
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('AIConversationBlock maxQuestions:', {
        propValue: maxQuestions,
        settingsValue: settings.maxQuestions,
        effectiveValue: settingsMaxQuestions
      });
    }
  }, [maxQuestions, settings.maxQuestions, settingsMaxQuestions]);
  
  // Use our custom hooks for state management and navigation
  const {
    // State values
    userInput,
    isSubmitting,
    isNavigating,
    navigationAttempted,
    activeQuestionIndex,
    hasNavigatedForward,
    hasReturnedToBlock,
    
    // Conversation data
    conversation,
    nextQuestion,
    isComplete,
    isLoading,
    error,
    
    // Derived values
    isFirstQuestion,
    hasReachedMaxQuestions,
    effectiveIsComplete,
    isEditingQuestion,
    displayConversation,
    
    // State setters
    setUserInput,
    setIsSubmitting,
    setIsNavigating,
    setNavigationAttempted,
    setActiveQuestionIndex,
    setHasNavigatedForward,
    setHasReturnedToBlock,
    
    // Refs
    historyContainerRef,
    mountTimeRef,
    
    // Helper methods
    getQuestionToSubmit,
    submitAnswer
  } = useAIConversationState(
    responseId,
    id,
    formId,
    starterPrompt,
    settingsMaxQuestions,
    onChange
  );
  
  // Use the navigation hook
  const { handleQuestionNavigation } = useAIConversationNavigation(
    conversation,
    activeQuestionIndex,
    setActiveQuestionIndex,
    hasReturnedToBlock,
    setHasReturnedToBlock,
    hasNavigatedForward,
    setHasNavigatedForward,
    effectiveIsComplete,
    isNavigating,
    navigationAttempted,
    settingsMaxQuestions,
    mountTimeRef,
    onNext
  );

  // Calculate progress information
  const questionCount = conversation.length;
  const showMaxQuestions = settingsMaxQuestions > 0;
  const progressText = showMaxQuestions 
    ? `Question ${Math.min(questionCount + (isFirstQuestion ? 0 : 1), settingsMaxQuestions)} of ${settingsMaxQuestions}` 
    : `Question ${questionCount + (isFirstQuestion ? 0 : 1)}`;
  
  // Handle submit
  const handleSubmit = async () => {
    if (!userInput.trim() || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Get the appropriate question for submission
      const questionToSubmit = getQuestionToSubmit();
      
      // Log what we're about to submit
      console.log('Submitting answer with:', {
        isFirstQuestion,
        isEditingPreviousQuestion: activeQuestionIndex < conversation.length,
        activeQuestionIndex,
        questionToSubmit,
        questionLength: questionToSubmit?.length || 0,
        userInput: userInput.length > 20 ? userInput.substring(0, 20) + '...' : userInput,
        conversationLength: conversation.length
      });
      
      // Add fallback for empty question
      const finalQuestion = questionToSubmit || 
        (isFirstQuestion ? title || 'Initial question' : 'Follow-up question');
      
      // Pass the appropriate question index based on what we're editing
      await submitAnswer(
        finalQuestion,
        userInput,
        activeQuestionIndex < conversation.length ? activeQuestionIndex : (isFirstQuestion ? 0 : conversation.length),
        isFirstQuestion && activeQuestionIndex >= conversation.length
      );
      
      // After submitting, if editing a previous question, advance to the next question
      if (activeQuestionIndex < conversation.length) {
        // Move to the next question after the one we just edited
        setActiveQuestionIndex(activeQuestionIndex + 1);
        // Explicitly set hasReturnedToBlock to prevent auto-navigation
        setHasReturnedToBlock(true);
        // Reset the navigated forward flag when editing to prevent auto-navigation
        setHasNavigatedForward(false);
      } else {
        // For new questions, clear input and advance to the next question
        setUserInput('');
        // Set active index to the end of the conversation (the new current question)
        setActiveQuestionIndex(conversation.length + 1);
      }
      
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle navigation to next section with error resilience
  const handleNext = () => {
    if (!onNext || isNavigating) return;
    
    // Track that navigation was attempted (for error resilience)
    setNavigationAttempted(true);
    setIsNavigating(true);
    
    try {
      // Set a max timeout to ensure navigation happens even if there's an error
      const timeoutId = setTimeout(() => {
        if (isNavigating && navigationAttempted) {
          console.log('Navigation timeout reached - forcing navigation');
          onNext();
          setIsNavigating(false);
        }
      }, 1500);
      
      // Add a small delay to prevent double clicks
      setTimeout(() => {
        try {
          onNext();
        } catch (error) {
          console.error('Error during navigation:', error);
          // Continue anyway after a short delay
          setTimeout(() => onNext(), 100);
        } finally {
          clearTimeout(timeoutId);
          setIsNavigating(false);
        }
      }, 100);
    } catch (error) {
      console.error('Error setting up navigation:', error);
      // Last resort - direct call
      onNext();
      setIsNavigating(false);
    }
  };
  
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
  React.useEffect(() => {
    conversationHandleRef.current.isComplete = () => effectiveIsComplete;
    conversationHandleRef.current.getConversation = () => conversation;
    conversationHandleRef.current.getMessages = () => conversation;
  }, [conversation, effectiveIsComplete]);
  
  // Log component state updates
  React.useEffect(() => {
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
  
  // Add effect to log when activeQuestionIndex changes
  React.useEffect(() => {
    console.log('activeQuestionIndex changed:', {
      activeQuestionIndex,
      conversationLength: conversation.length,
      displayConversationLength: displayConversation.length
    });
  }, [activeQuestionIndex, conversation.length, displayConversation.length]);
  
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
  
  // Determine if this is the initial unanswered state
  const isInitialState = isFirstQuestion && !isComplete;
  
  // Determine if block can be skipped based on required flag
  const canSkip = !required;
  
  // Create a standard layout for SlideWrapper
  const standardLayout = {
    type: 'standard',
    alignment: 'left',
    spacing: 'normal'
  } as const;
  
  // Prepare presentation settings
  const presentation = settings.presentation || {
    layout: 'left',
    spacing: 'normal',
    titleSize: 'medium'
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
              
              {/* Question navigation */}
              <AIConversationNavigation 
                conversation={conversation}
                activeQuestionIndex={activeQuestionIndex}
                setActiveQuestionIndex={setActiveQuestionIndex}
                hasReturnedToBlock={hasReturnedToBlock}
                setHasReturnedToBlock={setHasReturnedToBlock}
                effectiveIsComplete={effectiveIsComplete}
                nextQuestion={nextQuestion}
                settingsMaxQuestions={settingsMaxQuestions}
              />
              
              {/* Previous conversation history */}
              <AIConversationHistory 
                displayConversation={displayConversation}
                historyContainerRef={historyContainerRef}
              />
              
              {/* Input area */}
              <AIConversationInput 
                userInput={userInput}
                setUserInput={setUserInput}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                isLoading={isLoading}
                effectiveIsComplete={effectiveIsComplete}
                activeQuestionIndex={activeQuestionIndex}
                conversation={conversation}
              />
              
              {/* Action buttons */}
              <AIConversationButtons 
                effectiveIsComplete={effectiveIsComplete}
                isEditingQuestion={isEditingQuestion}
                isInitialState={isInitialState}
                canSkip={canSkip}
                handleNext={handleNext}
                handleSubmit={handleSubmit}
                isNextDisabled={isNextDisabled}
                isNavigating={isNavigating}
                isSubmitting={isSubmitting}
                isLoading={isLoading}
                userInput={userInput}
                onPrevious={onPrevious}
                activeQuestionIndex={activeQuestionIndex}
                setActiveQuestionIndex={setActiveQuestionIndex}
                conversation={conversation}
              />
            </>
          )}
        </div>
      )}
    </SlideWrapper>
  );
} 