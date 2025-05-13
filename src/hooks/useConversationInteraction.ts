import { useState, useRef, useCallback, useEffect } from 'react';
import { ApiQAPair } from '@/types/response';
import type { ChangeEvent, KeyboardEvent, MutableRefObject } from 'react';

// Define the expected result structure for submitAnswer
interface SubmitAnswerResult {
  success: boolean;
  error?: string;
  conversation?: ApiQAPair[];
  nextQuestion?: string;
  isComplete?: boolean;
}

interface UseConversationInteractionProps {
  conversation: ApiQAPair[];
  activeQuestionIndex: number;
  questionInputs: Record<number, string>;
  isFirstQuestion: boolean;
  starterPrompt: string;
  submitAnswer: (question: string, answer: string, questionIndex?: number, isStarterQuestion?: boolean) => Promise<SubmitAnswerResult>;
  onNext?: () => void;
  onChange?: (value: ApiQAPair[]) => void;
  onUpdate?: () => void;
  maxQuestions?: number;
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
 * Hook to manage user interaction with the conversation
 * Handles input, submission, and keyboard events
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
  maxQuestions = 5,
}: UseConversationInteractionProps): UseConversationInteractionReturn {
  // Local component state
  const [userInput, setUserInput] = useState<string>('');
  const [questionInputs, setQuestionInputs] = useState<Record<number, string>>(initialQuestionInputs || {});
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
  const [isChangingEarlierAnswer, setIsChangingEarlierAnswer] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  
  // Reset input when active question changes
  useEffect(() => {
    // If there's stored input for this question, use it
    if (questionInputs[activeQuestionIndex]) {
      setUserInput(questionInputs[activeQuestionIndex]);
    } else {
      // Otherwise clear the input
      setUserInput('');
      
      // Check if we're going back to an earlier question
      if (activeQuestionIndex < conversation.length && activeQuestionIndex !== conversation.length - 1) {
        setIsChangingEarlierAnswer(true);
      } else {
        setIsChangingEarlierAnswer(false);
      }
    }
  }, [activeQuestionIndex, questionInputs, conversation.length]);
  
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
  
  // Handle the form submission with error handling and loading states
  const handleSubmit = useCallback(async () => {
    // Don't submit if there's no input or we're already submitting
    if (!userInput.trim() || isLocalSubmitting) return;
    
    try {
      // Set the loading state 
      setIsLocalSubmitting(true);
      
      // Get the current question
      let currentQuestion = "";
      
      if (isFirstQuestion) {
        currentQuestion = starterPrompt;
      } else if (activeQuestionIndex < conversation.length) {
        // Find the current question in the conversation
        const item = conversation[activeQuestionIndex];
        if (item.type === 'question') {
          currentQuestion = item.content;
        } else {
          console.error('Active index does not point to a question');
          return;
        }
      } else {
        console.error('No active question found for submission');
        return;
      }
      
      // Reset 'changing earlier answer' flag if active
      if (isChangingEarlierAnswer) {
        setIsChangingEarlierAnswer(false);
      }
      
      // Log the submission details for debugging
      console.log('Submitting answer:', {
        question: currentQuestion,
        answer: userInput,
        isFirstQuestion,
        activeIndex: activeQuestionIndex,
        conversationLength: conversation.length
      });
      
      // Update the UI appropriately
      const updatedQuestionInputs = {
        ...questionInputs,
        [activeQuestionIndex]: userInput,
      };
      
      // Save the answer in internal state
      setQuestionInputs(updatedQuestionInputs);
      
      // Clear the input field
      setUserInput('');
      
      // If we're using the onChange callback (for builder mode)
      if (onChange) {
        // Create updated conversation for onChange handler
        const updatedConversation = [...conversation];
        
        if (activeQuestionIndex < updatedConversation.length) {
          // Find the next answer after this question
          const answerIndex = activeQuestionIndex + 1;
          if (answerIndex < updatedConversation.length && updatedConversation[answerIndex].type === 'answer') {
            // Update existing answer
            updatedConversation[answerIndex] = {
              ...updatedConversation[answerIndex],
              content: userInput
            };
          } else {
            // Add a new answer after the question
            updatedConversation.push({
              type: 'answer',
              content: userInput,
              timestamp: new Date().toISOString(),
              isStarter: isFirstQuestion
            });
          }
        } else {
          // Add a new question-answer pair
          updatedConversation.push({
            type: 'question',
            content: currentQuestion,
            timestamp: new Date().toISOString(),
            isStarter: isFirstQuestion
          });
          
          // Add the corresponding answer
          updatedConversation.push({
            type: 'answer',
            content: userInput,
            timestamp: new Date().toISOString(),
            isStarter: isFirstQuestion
          });
        }
        
        // Call the onChange handler with updated conversation
        onChange(updatedConversation);
      }
      
      // Invoke API submission
      const result = await submitAnswer(
        currentQuestion,
        userInput,
        activeQuestionIndex,
        isFirstQuestion
      );
      
      // Call onUpdate if present to trigger any parent component updates
      if (onUpdate) {
        onUpdate();
      }
      
      // Handle the submission result
      console.log('Answer submitted successfully:', {
        hasNextQuestion: result?.nextQuestion !== undefined && result?.nextQuestion !== '',
        conversationLength: result?.conversation?.length || '(unknown)'
      });
      
      // Check if we've reached max questions after this submission
      // If so, automatically navigate to the next section
      if (conversation.length + 1 >= maxQuestions && onNext) {
        console.log(`Reached maximum questions (${maxQuestions}). Automatically navigating to next section.`);
        // Use a slight delay to allow the UI to update first
        setTimeout(() => {
          onNext();
        }, 500);
      }
      
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsLocalSubmitting(false);
    }
  }, [
    userInput,
    isLocalSubmitting,
    isFirstQuestion,
    starterPrompt,
    activeQuestionIndex,
    conversation,
    isChangingEarlierAnswer,
    questionInputs,
    onChange,
    submitAnswer,
    onUpdate,
    maxQuestions,
    onNext
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