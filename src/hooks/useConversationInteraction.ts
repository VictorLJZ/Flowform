import { useState, useRef, useCallback, useEffect } from 'react';
import { QAPair } from '@/types/supabase-types';
import type { ChangeEvent, KeyboardEvent, RefObject, MutableRefObject } from 'react';

interface UseConversationInteractionProps {
  conversation: QAPair[];
  activeQuestionIndex: number;
  questionInputs: Record<number, string>;
  isFirstQuestion: boolean;
  starterPrompt: string;
  submitAnswer: (question: string, answer: string, questionIndex?: number, isStarterQuestion?: boolean) => Promise<any>;
  onNext?: () => void;
  onChange?: (value: QAPair[]) => void;
  onUpdate?: () => void;
}

interface UseConversationInteractionReturn {
  userInput: string;
  setUserInput: (input: string) => void;
  questionInputs: Record<number, string>;
  setQuestionInputs: (inputs: Record<number, string>) => void;
  isLocalSubmitting: boolean;
  isChangingEarlierAnswer: boolean;
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>;
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: () => Promise<void>;
  handleKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
}

/**
 * Hook to manage user interactions with the AI conversation
 * Handles input changes, form submissions, and keyboard interactions
 */
export function useConversationInteraction({
  conversation,
  activeQuestionIndex,
  questionInputs: initialQuestionInputs,
  isFirstQuestion,
  starterPrompt,
  submitAnswer,
  onNext,
  onChange,
  onUpdate,
}: UseConversationInteractionProps): UseConversationInteractionReturn {
  // Local component state
  const [userInput, setUserInput] = useState("");
  const [questionInputs, setQuestionInputs] = useState<Record<number, string>>(initialQuestionInputs || {});
  
  // Initialize userInput from stored inputs if available
  useEffect(() => {
    if (initialQuestionInputs && initialQuestionInputs[activeQuestionIndex]) {
      setUserInput(initialQuestionInputs[activeQuestionIndex]);
    } else {
      setUserInput("");
    }
  }, [activeQuestionIndex, initialQuestionInputs]);
  // Add a local loading state to prevent UI changes during submission
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
  // Track whether we're changing an earlier answer that will reset later questions
  const [isChangingEarlierAnswer, setIsChangingEarlierAnswer] = useState(false);
  
  // Ref for textarea
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  
  // Handle input change and update stored inputs for this question
  const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setUserInput(value);
    
    // Check if changing an earlier answer that will reset later questions
    const isChangingEarlier = 
      conversation.length > 0 && 
      activeQuestionIndex < conversation.length - 1 &&
      !isFirstQuestion;
    
    setIsChangingEarlierAnswer(isChangingEarlier);
    
    // Store input for this question index
    setQuestionInputs(prev => ({
      ...prev,
      [activeQuestionIndex]: value
    }));
  }, [conversation.length, activeQuestionIndex, isFirstQuestion]);
  
  // Handle form submission
  const handleSubmit = useCallback(async () => {
    // Don't submit if input is empty or already submitting
    if (!userInput.trim() || isLocalSubmitting) return;
    
    try {
      // Set local loading state
      setIsLocalSubmitting(true);
      
      // Determine the current question text based on state
      const currentQuestion = isFirstQuestion 
        ? starterPrompt 
        : activeQuestionIndex < conversation.length 
          ? conversation[activeQuestionIndex].question 
          : '';
      
      // Submit the answer
      if (isChangingEarlierAnswer) {
        console.log('Submitting answer for question', activeQuestionIndex, 'will reset later questions');
      }
      
      const result = await submitAnswer(
        currentQuestion,
        userInput,
        activeQuestionIndex,
        isFirstQuestion
      );
      
      // Log the result for debugging if needed
      if (result) {
        console.log('Answer submitted successfully:', {
          hasNextQuestion: !!result.nextQuestion,
          conversationLength: result.conversation?.length
        });
      }
      
      // Clear input after submission
      setUserInput("");
      
      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate();
      }
      
      // Call onChange with updated conversation if provided
      if (onChange) {
        // Create a copy with the new answer
        const updatedConversation = isFirstQuestion
          ? [{ question: starterPrompt, answer: userInput, timestamp: new Date().toISOString(), is_starter: true }] 
          : [...conversation];
        
        // If answering an existing question, update that entry
        if (!isFirstQuestion && activeQuestionIndex < conversation.length) {
          updatedConversation[activeQuestionIndex] = {
            ...updatedConversation[activeQuestionIndex],
            answer: userInput
          };
        }
        
        onChange(updatedConversation);
      }
      
      // Auto focus for better UX
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsLocalSubmitting(false);
      setIsChangingEarlierAnswer(false);
    }
  }, [
    userInput, 
    isLocalSubmitting, 
    isFirstQuestion, 
    starterPrompt, 
    activeQuestionIndex, 
    conversation, 
    isChangingEarlierAnswer, 
    submitAnswer, 
    onUpdate, 
    onChange
  ]);
  
  // Handle keyboard interactions (Shift+Enter to submit)
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);
  
  return {
    userInput,
    setUserInput,
    questionInputs,
    setQuestionInputs,
    isLocalSubmitting,
    isChangingEarlierAnswer,
    textareaRef,
    handleInputChange,
    handleSubmit,
    handleKeyDown,
  };
}