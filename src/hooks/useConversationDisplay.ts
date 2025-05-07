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
  
  // Store the last valid nextQuestion to maintain it even if API resets it
  const lastValidNextQuestionRef = useRef<string>("");
  
  // Update lastValidNextQuestionRef when we get a valid nextQuestion
  useEffect(() => {
    if (nextQuestion) {
      lastValidNextQuestionRef.current = nextQuestion;
    }
  }, [nextQuestion]);
  
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
      nextQuestion: nextQuestion || "[none]",
      storedValidQuestion: lastValidNextQuestionRef.current || "[none]"
    };
    
    console.log('Question determination data:', currentState);

    // Check for stored valid question when current nextQuestion is empty
    if (!nextQuestion && lastValidNextQuestionRef.current) {
      console.log('Using stored valid question instead of empty nextQuestion');
      return { text: lastValidNextQuestionRef.current, source: 'stored_api' };
    }
    // Always prioritize nextQuestion from the API over anything else if available
    else if (nextQuestion) {
      console.log('Using AI-generated next question');
      return { text: nextQuestion, source: 'api' };
    } 
    // If there's a question at the current index in the conversation, use that
    else if (activeQuestionIndex < conversation.length) {
      console.log('Using existing conversation question');
      return { text: conversation[activeQuestionIndex].question, source: 'conversation' };
    } 
    // Otherwise fall back to the starter prompt
    else if (isFirstQuestion) {
      console.log('Using starter prompt');
      return { text: starterPrompt, source: 'starter' };
    }
    
    // Empty string if we can't find a suitable question (shouldn't happen)
    console.warn('No question could be determined');
    return { text: '', source: 'fallback' };
  }, [nextQuestion, conversation, activeQuestionIndex, isFirstQuestion, starterPrompt, lastValidNextQuestionRef]);
  
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