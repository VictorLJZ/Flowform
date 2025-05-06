import { useState, useCallback, useEffect } from 'react';
import { QAPair } from '@/types/supabase-types';

export interface FormAnswersState {
  currentAnswer: string | number | string[] | QAPair[];
  setCurrentAnswer: (value: string | number | string[] | QAPair[]) => void;
  saveCurrentAnswer: (blockId: string, answer: string | number | string[] | QAPair[]) => void;
  initializeAnswers: () => void;
  answersInitialized: boolean;
  loadAnswerForBlock: (blockId: string) => void;
}

interface UseFormAnswersProps {
  formId: string;
  responseId: string | null;
  blockId: string | null; // Changed from currentIndex to blockId
  storageKey: string;
}

/**
 * Manages the state of answers for form questions
 */
export function useFormAnswers({
  formId,
  responseId,
  blockId,
  storageKey
}: UseFormAnswersProps): FormAnswersState {
  // State for the current answer
  const [currentAnswer, setCurrentAnswer] = useState<string | number | string[] | QAPair[]>('');
  
  // Track all answers by block ID
  const [answers, setAnswers] = useState<Record<string, string | number | string[] | QAPair[]>>({});
  
  // Track initialization status
  const [answersInitialized, setAnswersInitialized] = useState(false);

  // Initialize or load saved answers from storage
  const initializeAnswers = useCallback(() => {
    try {
      // Try to load existing answers from localStorage
      let parsedData = {};
      try {
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
          parsedData = JSON.parse(savedData);
          setAnswers(parsedData);
          
          // If we have an active block, set its answer as current
          if (blockId && parsedData[blockId] !== undefined) {
            setCurrentAnswer(parsedData[blockId]);
          }
        }
      } catch (parseError) {
        console.error('Error parsing saved answers from localStorage:', parseError);
        // Continue with empty answers
      }
      
      setAnswersInitialized(true);
    } catch (error) {
      console.error('Error initializing answers:', error);
      setAnswersInitialized(true); // Still mark as initialized to avoid loops
    }
  }, [storageKey, blockId]);

  // Save the current answer for a specific block
  const saveCurrentAnswer = useCallback((blockId: string, answer: string | number | string[] | QAPair[]) => {
    // Update the answers object with the new value
    setAnswers(prev => {
      const newAnswers = { ...prev, [blockId]: answer };
      
      // Save to localStorage
      try {
        const serializedAnswers = JSON.stringify(newAnswers);
        localStorage.setItem(storageKey, serializedAnswers);
      } catch (error) {
        console.error('Error saving answers to localStorage:', error);
        // If it's a QuotaExceededError, try to clear some space
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          try {
            // Try to remove old items from localStorage to make space
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('flowform-') && key !== storageKey) {
                localStorage.removeItem(key);
              }
            }
            // Try saving again
            localStorage.setItem(storageKey, JSON.stringify(newAnswers));
          } catch (retryError) {
            console.error('Failed to make space and retry saving:', retryError);
          }
        }
      }
      
      return newAnswers;
    });
  }, [storageKey]);

  // Load answer for a specific block
  const loadAnswerForBlock = useCallback((blockId: string) => {
    // Set the current answer if we have one saved for this block
    if (answers[blockId] !== undefined) {
      setCurrentAnswer(answers[blockId]);
    } else {
      // Clear the current answer if no saved value exists
      setCurrentAnswer('');
    }
  }, [answers]);

  // Load the answer when the block changes
  useEffect(() => {
    if (answersInitialized && blockId) {
      console.log(`Loading answer for block: ${blockId}`);
      loadAnswerForBlock(blockId);
    }
  }, [blockId, answersInitialized, loadAnswerForBlock]);

  return {
    currentAnswer,
    setCurrentAnswer,
    saveCurrentAnswer,
    initializeAnswers,
    answersInitialized,
    loadAnswerForBlock
  };
}
