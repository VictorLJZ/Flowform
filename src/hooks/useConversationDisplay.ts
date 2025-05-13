import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiQAPair } from '@/types/response';

interface UseConversationDisplayProps {
  conversation: ApiQAPair[];
  nextQuestion: string;
  activeQuestionIndex: number;
  isFirstQuestion: boolean;
  starterPrompt: string;
}

interface UseConversationDisplayReturn {
  displayQuestion: string;
  isLoading: boolean;
  determineCurrentQuestion: () => { text: string; source: string };
}

/**
 * Hook to manage the display of questions in the AI conversation
 * Handles the logic for determining which question to display based on the current state
 */
export function useConversationDisplay({
  conversation,
  nextQuestion,
  activeQuestionIndex,
  isFirstQuestion,
  starterPrompt,
}: UseConversationDisplayProps): UseConversationDisplayReturn {
  // Create state to directly manage the displayed question with better control
  const [displayQuestion, setDisplayQuestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // ADDED: Use a stable ref for current conversation to prevent unnecessary recalculations
  const currentConversationRef = useRef<ApiQAPair[]>(conversation);
  
  // Store the last valid nextQuestion to maintain it even if API resets it
  const lastValidNextQuestionRef = useRef<string>("");
  
  // MODIFIED: Simpler update for lastValidNextQuestionRef
  useEffect(() => {
    if (nextQuestion) {
      lastValidNextQuestionRef.current = nextQuestion;
    }
    
    // Update current conversation ref
    currentConversationRef.current = conversation;
  }, [nextQuestion, conversation]);
  
  // SIMPLIFIED: Cleaner handler for nextQuestion changes
  useEffect(() => {
    // This effect is specifically for handling nextQuestion changes
    if (nextQuestion) {
      console.log('NextQuestion changed to:', nextQuestion.substring(0, 40) + '...');
      setDisplayQuestion(nextQuestion);
      setIsLoading(false);
    }
  }, [nextQuestion]);
  
  // SIMPLIFIED: Clear determination logic with better prioritization
  const determineCurrentQuestion = useCallback(() => {
    // MODIFIED: Added priorities and clearer logging
    console.log('Question determination data:', {
      activeIndex: activeQuestionIndex,
      conversationLength: conversation.length,
      nextQuestion: nextQuestion ? 'present' : 'missing',
      storedValidQuestion: lastValidNextQuestionRef.current ? 'present' : 'missing',
      isFirstQuestion
    });

    // Priority 1: If we're at a valid index in the conversation, always show that question
    if (activeQuestionIndex < conversation.length) {
      console.log('Using existing conversation item at index', activeQuestionIndex);
      const item = conversation[activeQuestionIndex];
      // Only use if it's a question type
      if (item.type === 'question') {
        return { text: item.content, source: 'conversation' };
      }
    }
    
    // Priority 2: If this is the very first question and no conversation yet, use starter prompt
    if (conversation.length === 0 && starterPrompt) {
      console.log('Using starter prompt for first question');
      return { text: starterPrompt, source: 'starter' };
    }
    
    // Priority 3: If we need the next question (at position = conversation.length), use it
    if (activeQuestionIndex === conversation.length && nextQuestion) {
      console.log('Using next question from API');
      return { text: nextQuestion, source: 'api' };
    }
    
    // Priority 4: If we have a stored valid question when current is empty
    if (!nextQuestion && lastValidNextQuestionRef.current && activeQuestionIndex === conversation.length) {
      console.log('Using stored valid question as fallback');
      return { text: lastValidNextQuestionRef.current, source: 'stored_api' };
    }
    
    // Fallback: Empty string with warning
    console.warn('No question could be determined');
    return { text: '', source: 'fallback' };
  }, [nextQuestion, conversation, activeQuestionIndex, isFirstQuestion, starterPrompt]);
  
  // SIMPLIFIED: More focused effect that only updates when necessary
  useEffect(() => {
    // Determine the question to display
    const { text, source } = determineCurrentQuestion();
    
    // Only update state if necessary
    if (text && text !== displayQuestion) {
      console.log(`Updating display question from ${source} source:`, {
        current: displayQuestion.substring(0, 30) + (displayQuestion.length > 30 ? '...' : ''),
        new: text.substring(0, 30) + (text.length > 30 ? '...' : '')
      });
      
      setDisplayQuestion(text);
      setIsLoading(source === 'loading');
    }
  }, [
    starterPrompt, 
    isFirstQuestion, 
    activeQuestionIndex, 
    // MODIFIED: Use the length of conversation as dependency instead of the whole object
    conversation.length, 
    nextQuestion, 
    displayQuestion, 
    determineCurrentQuestion
  ]);
  
  return {
    displayQuestion,
    isLoading,
    determineCurrentQuestion
  };
}