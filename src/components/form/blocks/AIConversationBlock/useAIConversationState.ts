import { useState, useRef, useMemo, useEffect } from 'react';
import { useFormBuilderStore } from "@/stores/formBuilderStore";
import { useAIConversation } from '@/hooks/useAIConversation';
import { QAPair } from '@/types/supabase-types';
import { AIConversationState } from './types';

/**
 * Hook to manage the state of an AI conversation
 */
export function useAIConversationState(
  responseId: string,
  blockId: string,
  formId: string,
  starterPrompt: string,
  maxQuestions: number,
  onChange?: (value: QAPair[]) => void
) {
  // Local state
  const [state, setState] = useState<AIConversationState>({
    userInput: '',
    isSubmitting: false,
    isNavigating: false,
    navigationAttempted: false,
    activeQuestionIndex: 0,
    hasNavigatedForward: false,
    hasReturnedToBlock: false
  });

  // Refs for cleanup and tracking
  const historyContainerRef = useRef<HTMLDivElement>(null);
  const mountTimeRef = useRef(new Date().getTime());
  
  // Determine if we're in builder or viewer mode
  const { mode } = useFormBuilderStore();
  const isBuilder = mode === 'builder';
  
  // Use AI conversation hook
  const {
    conversation = [], 
    nextQuestion = '', 
    isComplete = false,
    submitAnswer,
    isLoading,
    error
  } = useAIConversation(
    responseId || '', 
    blockId, 
    formId || '', 
    isBuilder,
    maxQuestions
  );
  
  // Track if this is the first question - it's only true if conversation is empty
  const isFirstQuestion = useMemo(() => conversation.length === 0, [conversation]);
  
  // Check if we've reached max questions
  const hasReachedMaxQuestions = maxQuestions > 0 && conversation.length >= maxQuestions;
  
  // Calculate effective completion status
  const effectiveIsComplete = useMemo(() => {
    // Consider complete when either explicitly marked as complete OR max questions reached
    const hasReachedMax = maxQuestions > 0 && conversation.length >= maxQuestions;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Checking effective completion status:', {
        isComplete,
        hasReachedMaxQuestions,
        maxQuestions,
        conversationLength: conversation.length,
        reachedMax: hasReachedMax,
        activeQuestionIndex: state.activeQuestionIndex,
        isEditing: state.activeQuestionIndex < conversation.length
      });
    }
    
    // If we're editing a previous answer, don't consider complete regardless of max questions
    if (state.activeQuestionIndex < conversation.length) {
      return false;
    }
    
    return isComplete || hasReachedMax;
  }, [isComplete, hasReachedMaxQuestions, conversation.length, maxQuestions, state.activeQuestionIndex]);
  
  // Update userInput when active question index changes
  useEffect(() => {
    // If viewing a previous question, show its answer
    if (state.activeQuestionIndex < conversation.length) {
      setState(prev => ({ ...prev, userInput: conversation[state.activeQuestionIndex].answer || '' }));
    } else {
      // When viewing the next/current question, clear the input
      setState(prev => ({ ...prev, userInput: '' }));
    }
  }, [state.activeQuestionIndex, conversation]);
  
  // Initialize activeQuestionIndex based on conversation state
  useEffect(() => {
    // If we have data but active index is beyond valid range, adjust it
    if (conversation.length > 0) {
      const maxValidIndex = conversation.length;
      
      // If activeQuestionIndex is beyond max valid index, adjust it
      // But skip auto-adjustment for index 0 (Start) to allow editing the first question
      if (state.activeQuestionIndex > maxValidIndex && state.activeQuestionIndex !== 0) {
        console.log(`Adjusting activeQuestionIndex from ${state.activeQuestionIndex} to ${maxValidIndex}`);
        setState(prev => ({ ...prev, activeQuestionIndex: maxValidIndex }));
      }
    }
  }, [conversation.length, state.activeQuestionIndex]);
  
  // Handle form value changes
  useEffect(() => {
    if (onChange && !isBuilder) {
      onChange(conversation);
    }
  }, [conversation, onChange, isBuilder]);
  
  // Auto-scroll to the bottom of the conversation history when it updates
  useEffect(() => {
    if (historyContainerRef.current) {
      const container = historyContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [conversation]);
  
  // Helper to update state
  const updateState = (updates: Partial<AIConversationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };
  
  // Helper to get the appropriate question to submit
  const getQuestionToSubmit = (): string => {
    if (state.activeQuestionIndex < conversation.length) {
      // Editing a previous question
      return conversation[state.activeQuestionIndex].question;
    } else if (isFirstQuestion) {
      // Answering the starter question
      return starterPrompt;
    } else {
      // Answering the next/current question
      return nextQuestion;
    }
  };
  
  // Check if we're editing a previous question
  const isEditingQuestion = state.activeQuestionIndex < conversation.length;
  
  // Helper function to get mapped conversation with first question always showing the starter prompt
  const getMappedConversation = () => {
    if (conversation.length === 0) return [];
    
    return conversation.map((item, idx) => {
      // Make sure the first question always shows the starter prompt
      if (idx === 0) {
        // If this is the first item, always ensure it shows the proper starter prompt
        return {
          ...item,
          question: starterPrompt || item.question || "Initial question"
        };
      }
      return item;
    });
  };
  
  return {
    // State getters
    userInput: state.userInput,
    isSubmitting: state.isSubmitting,
    isNavigating: state.isNavigating,
    navigationAttempted: state.navigationAttempted,
    activeQuestionIndex: state.activeQuestionIndex,
    hasNavigatedForward: state.hasNavigatedForward,
    hasReturnedToBlock: state.hasReturnedToBlock,
    
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
    displayConversation: getMappedConversation(),
    
    // State setters
    setUserInput: (value: string) => updateState({ userInput: value }),
    setIsSubmitting: (value: boolean) => updateState({ isSubmitting: value }),
    setIsNavigating: (value: boolean) => updateState({ isNavigating: value }),
    setNavigationAttempted: (value: boolean) => updateState({ navigationAttempted: value }),
    setActiveQuestionIndex: (value: number) => updateState({ activeQuestionIndex: value }),
    setHasNavigatedForward: (value: boolean) => updateState({ hasNavigatedForward: value }),
    setHasReturnedToBlock: (value: boolean) => updateState({ hasReturnedToBlock: value }),
    
    // Refs
    historyContainerRef,
    mountTimeRef,
    
    // Helper methods
    getQuestionToSubmit,
    submitAnswer
  };
} 