import { useState, useEffect, useRef, useCallback } from 'react';
import { QAPair } from '@/types/supabase-types';

interface UseConversationDisplayProps {
  conversation: QAPair[];
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
  
  // Store the current data state for debugging
  const dataStateRef = useRef<{index: number, conversation: QAPair[], nextQ: string}>({
    index: -1, 
    conversation: [], 
    nextQ: ""
  });
  
  // Force component re-render when key data changes
  // Not using forceUpdate currently, but commented for reference
  // const [forceUpdate, setForceUpdate] = useState(0);
  
  // Enhanced handler for nextQuestion state changes
  useEffect(() => {
    // This effect is specifically focused on handling nextQuestion changes
    // It ensures the displayQuestion state is updated consistently
    console.log('NextQuestion effect triggered, question:', 
      nextQuestion ? nextQuestion.substring(0, 40) + '...' : 'undefined/empty');
    
    if (nextQuestion) {
      // Immediately update the question display
      console.log('IMPORTANT: nextQuestion changed to:', nextQuestion.substring(0, 40) + '...');
      setDisplayQuestion(nextQuestion);
      setIsLoading(false);
      
      // Setup a force update mechanism with staggered timeouts to ensure the update persists
      // This helps overcome any potential race conditions in React's state updates
      const timers = [
        setTimeout(() => {
          // First immediate update
          if (nextQuestion) {
            console.log('First delayed update executed');
            setDisplayQuestion(nextQuestion);
            // No longer forcing component to re-render
            // setForceUpdate(prev => prev + 1);
          }
        }, 50),
        
        setTimeout(() => {
          // Second update to ensure consistency
          if (nextQuestion) {
            console.log('Second delayed update executed');
            setDisplayQuestion(nextQuestion);
            // No longer forcing component to re-render
            // setForceUpdate(prev => prev + 1);
          }
        }, 200)
      ];
      
      // Cleanup timers on effect cleanup
      return () => {
        timers.forEach(clearTimeout);
      };
    }
  }, [nextQuestion]);
  
  // Key debug function to determine what question should be displayed
  // Wrapped in useCallback to avoid unnecessary re-renders and dependency issues
  const determineCurrentQuestion = useCallback(() => {
    const currentState = {
      isFirstQ: isFirstQuestion,
      promptText: starterPrompt,
      activeIndex: activeQuestionIndex,
      convoLength: conversation.length,
      hasQuestion: activeQuestionIndex < conversation.length, 
      nextQuestion: nextQuestion || "[none]"
    };
    
    console.log('Question determination data:', currentState);
    
    if (isFirstQuestion) {
      return { text: starterPrompt, source: 'starter' };
    } else if (activeQuestionIndex < conversation.length && conversation[activeQuestionIndex]?.question) {
      return { text: conversation[activeQuestionIndex].question, source: 'conversation' };
    } else if (nextQuestion) {
      return { text: nextQuestion, source: 'api' };
    } else {
      return { text: "Loading next question...", source: 'loading' };
    }
  }, [isFirstQuestion, starterPrompt, activeQuestionIndex, conversation, nextQuestion]);
  
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
      conversation: [...conversation],
      nextQ: nextQuestion || ""
    };
    
    // Detect what changed
    const changes = {
      indexChanged: prevState.index !== activeQuestionIndex,
      convoChanged: prevState.convoLength !== conversation.length,
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
      
      // Track when we're in a loading state
      setIsLoading(newQuestionData.source === 'loading');
    }
  }, [starterPrompt, isFirstQuestion, activeQuestionIndex, conversation, nextQuestion, displayQuestion, determineCurrentQuestion]);
  
  return {
    displayQuestion,
    isLoading,
    determineCurrentQuestion
  };
}