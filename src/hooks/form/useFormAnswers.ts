import { useState, useEffect, useCallback, useMemo } from 'react';
import type { QAPair } from '@/types/supabase-types';

interface UseFormAnswersProps {
  storageKey: string;
  sessionId: string | null;
  currentIndex: number;
}

export interface FormAnswersState {
  savedAnswers: Record<string, string | number | string[] | QAPair[]>;
  currentAnswer: string | number | string[] | QAPair[];
  answersInitialized: boolean;
  setCurrentAnswer: React.Dispatch<React.SetStateAction<string | number | string[] | QAPair[]>>;
  saveCurrentAnswer: (blockId: string, answer: string | number | string[] | QAPair[]) => void;
  initializeAnswers: () => void;
  loadAnswerForBlock: (blockId: string) => void;
}

export const useFormAnswers = ({ storageKey, sessionId, currentIndex }: UseFormAnswersProps): FormAnswersState => {
  const [savedAnswers, setSavedAnswers] = useState<Record<string, string | number | string[] | QAPair[]>>({});
  const [currentAnswer, setCurrentAnswer] = useState<string | number | string[] | QAPair[]>("");
  const [answersInitialized, setAnswersInitialized] = useState<boolean>(false);

  // Initialize answers from local storage
  const initializeAnswers = useCallback(() => {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const { sessionId: storedSessionId, answers } = JSON.parse(savedData);
        if (storedSessionId && storedSessionId === sessionId && answers) {
          setSavedAnswers(answers);
          // TODO: Restore currentAnswer if needed based on storedIndex?
          // Or should currentAnswer always reset?
        }
      } catch (error) {
        console.error("Error parsing saved form data from localStorage", error);
        localStorage.removeItem(storageKey); // Clear corrupted data
      }
    }
    setAnswersInitialized(true);
  }, [storageKey, sessionId]);

  // Function to save the current answer and persist
  const saveCurrentAnswer = useCallback((blockId: string, answer: string | number | string[] | QAPair[]) => {
    // Use functional update to avoid depending on savedAnswers state directly
    setSavedAnswers(prevAnswers => {
      const updatedAnswers = { ...prevAnswers, [blockId]: answer };

      // Persist to local storage
      if (sessionId) {
        localStorage.setItem(storageKey, JSON.stringify({ 
          sessionId: sessionId, 
          currentIndex: currentIndex, // Persist current index too
          answers: updatedAnswers 
        }));
      }
      return updatedAnswers;
    });
  }, [storageKey, sessionId, currentIndex]); // Remove savedAnswers dependency

  // Effect to initialize answers on mount or when sessionId changes
  useEffect(() => {
    if (sessionId) {
      initializeAnswers();
    }
  }, [sessionId, initializeAnswers]);
  
  // This function should be called when a new block is rendered
  // It will reset or load the appropriate answer
  const loadAnswerForBlock = useCallback((blockId: string) => {
    // If there's a saved answer for this block, use it
    if (savedAnswers[blockId]) {
      setCurrentAnswer(savedAnswers[blockId]);
    } else {
      // Otherwise reset to empty string (or appropriate default based on block type)
      setCurrentAnswer("");
    }
  }, [savedAnswers]);
  
  // Add this loadAnswerForBlock to the return value so it can be called
  // when a new block is rendered

  // Memoize the return object
  return useMemo(() => ({
    savedAnswers,
    currentAnswer,
    answersInitialized,
    setCurrentAnswer,
    saveCurrentAnswer,
    initializeAnswers, // Expose if needed externally, though usually handled internally
    loadAnswerForBlock, // Expose so it can be called when a block changes
  }), [
    savedAnswers,
    currentAnswer,
    answersInitialized,
    setCurrentAnswer, // This is stable from useState
    saveCurrentAnswer,
    initializeAnswers,
    loadAnswerForBlock
  ]);
};
