import { useState, useCallback } from 'react';

/**
 * Custom hook to manage navigation state within a form.
 * @param initialIndex The starting index.
 * @param totalItems The total number of items (blocks) to navigate through.
 * @returns Object containing navigation state and handlers.
 */
export function useFormNavigation(initialIndex: number = 0, totalItems: number) {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [direction, setDirection] = useState<number>(1); // 1 for next, -1 for previous

  const goToNext = useCallback(() => {
    if (currentIndex < totalItems - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, totalItems]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const resetNavigation = useCallback(() => {
    setCurrentIndex(initialIndex);
    setDirection(1);
  }, [initialIndex]);

  return {
    currentIndex,
    direction,
    goToNext,
    goToPrevious,
    setCurrentIndex, // Expose setter for programmatic jumps if needed
    resetNavigation,
  };
}
