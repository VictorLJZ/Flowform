import { useState, useCallback, useEffect } from 'react';
import { ApiQAPair } from '@/types/response';

interface UseConversationNavigationProps {
  conversation: ApiQAPair[];
  nextQuestion: string;
  isComplete: boolean;
  maxQuestions?: number;
  activeQuestionIndex: number;
  setActiveQuestionIndex: (index: number) => void;
  questionInputs: Record<number, string>;
  displayQuestion: string;
  onNext?: () => void;
}

interface UseConversationNavigationReturn {
  isFirstQuestion: boolean;
  isFinalQuestion: boolean;
  isLastAnswered: boolean;
  hasReachedMaxQuestions: boolean;
  canMoveToNextQuestion: boolean;
  handlePreviousQuestion: () => void;
  handleNextQuestion: () => void;
  moveToSpecificQuestion: (index: number) => void;
  handleCompletingConversation: () => void;
}

/**
 * Hook to manage navigation between questions in the AI conversation
 * Handles next/previous navigation and completion logic
 */
export function useConversationNavigation({
  conversation,
  nextQuestion,
  isComplete,
  maxQuestions,
  activeQuestionIndex,
  setActiveQuestionIndex,
  questionInputs,
  // displayQuestion parameter is received but not used in this hook
  // Keeping it commented for potential future implementation
  // displayQuestion,
  onNext,
}: UseConversationNavigationProps): UseConversationNavigationReturn {
  // Calculate derived state for navigation logic
  const isFirstQuestion = activeQuestionIndex === 0 && conversation.length === 0;
  const effectiveMaxQuestions = maxQuestions || 5; // Default to 5 questions if not specified
  const isFinalQuestion = isComplete || activeQuestionIndex >= effectiveMaxQuestions - 1;
  const hasReachedMaxQuestions = activeQuestionIndex >= effectiveMaxQuestions;
  
  // Track whether the active question has been answered
  const [isLastAnswered, setIsLastAnswered] = useState(false);
  
  // Keep track of whether we can move to the next question
  const [canMoveToNextQuestion, setCanMoveToNextQuestion] = useState(false);
  
  // Move to the previous question
  const handlePreviousQuestion = useCallback(() => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(activeQuestionIndex - 1);
    }
  }, [activeQuestionIndex, setActiveQuestionIndex]);
  
  // Move to the next question if available
  const handleNextQuestion = useCallback(() => {
    const currentLength = conversation.length;
    
    // Only allow moving forward if there's another question or we're at the last question and have a next question
    if (activeQuestionIndex < currentLength - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
    } else if (activeQuestionIndex === currentLength - 1 && nextQuestion) {
      // Move to the next question and set up state
      try {
        console.log('IMPORTANT: Moving to next question with:', nextQuestion.substring(0, 20) + '...');
        setActiveQuestionIndex(currentLength);
        
        // Force immediate UI update when moving to a new question
        // This is critical to maintain the expected UI flow
        if (typeof window !== 'undefined') {
          // Force any potential microtasks to complete
          setTimeout(() => {
            document.dispatchEvent(new CustomEvent('aiconversation:question-change', {
              detail: { question: nextQuestion, index: currentLength }
            }));
          }, 0);
        }
      } catch (error) {
        console.error('Error moving to next question:', error);
      }
    }
  }, [activeQuestionIndex, conversation.length, nextQuestion, setActiveQuestionIndex]);
  
  // Move to a specific question by index
  const moveToSpecificQuestion = useCallback((index: number) => {
    if (index >= 0 && index <= conversation.length) {
      setActiveQuestionIndex(index);
    }
  }, [conversation.length, setActiveQuestionIndex]);
  
  // Handle completing the conversation
  const handleCompletingConversation = useCallback(() => {
    if (onNext) {
      onNext();
    }
  }, [onNext]);
  
  // Determine if we can move to the next question based on current state
  useEffect(() => {
    // Check if the current question has an answer
    // We need to look for an answer pair after this question
    const questionItem = activeQuestionIndex < conversation.length ? 
      conversation[activeQuestionIndex] : null;
    
    // Check if this is a question, and if the next item is an answer
    const isCurrentAnswered = questionItem && 
      questionItem.type === 'question' && 
      activeQuestionIndex + 1 < conversation.length && 
      conversation[activeQuestionIndex + 1].type === 'answer' && 
      !!conversation[activeQuestionIndex + 1].content;
    
    // Check if we have a pending input for this question
    // Not currently used but kept for potential future implementation
    // const hasPendingInput = !!questionInputs[activeQuestionIndex];
    
    // Check if we have a next question available
    const hasNextAvailable = activeQuestionIndex < conversation.length - 1 || 
      (activeQuestionIndex === conversation.length - 1 && !!nextQuestion);
    
    // Update state based on these conditions
    setIsLastAnswered(isCurrentAnswered || false); // Ensure boolean value
    setCanMoveToNextQuestion((isCurrentAnswered && hasNextAvailable) || false); // Ensure boolean value
  }, [activeQuestionIndex, conversation, questionInputs, nextQuestion]);
  
  return {
    isFirstQuestion,
    isFinalQuestion,
    isLastAnswered,
    hasReachedMaxQuestions,
    canMoveToNextQuestion,
    handlePreviousQuestion,
    handleNextQuestion,
    moveToSpecificQuestion,
    handleCompletingConversation,
  };
}