import { useState, useRef, useCallback } from 'react';

/**
 * Hook for measuring time intervals such as time spent on a block
 * 
 * @returns Object with timing utility functions
 */
export function useTimingMeasurement() {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  /**
   * Start the timer
   * 
   * @param initialTime - Optional initial time in milliseconds
   */
  const startTimer = useCallback((initialTime: number = 0) => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Set initial elapsed time if provided
    if (initialTime > 0) {
      setElapsedTime(initialTime);
    } else {
      setElapsedTime(0);
    }
    
    // Record start time
    startTimeRef.current = Date.now();
    
    // Start interval to update elapsed time
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const currentElapsed = Date.now() - startTimeRef.current + initialTime;
        setElapsedTime(currentElapsed);
      }
    }, 1000); // Update every second
  }, []);
  
  /**
   * Pause the timer without resetting
   * 
   * @returns The current elapsed time in milliseconds
   */
  const pauseTimer = useCallback(() => {
    // Clear interval if it exists
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Calculate final elapsed time
    if (startTimeRef.current) {
      const finalElapsed = Date.now() - startTimeRef.current + elapsedTime;
      setElapsedTime(finalElapsed);
      startTimeRef.current = null;
      return finalElapsed;
    }
    
    return elapsedTime;
  }, [elapsedTime]);
  
  /**
   * Stop the timer and reset to zero
   * 
   * @returns The final elapsed time in milliseconds
   */
  const stopTimer = useCallback(() => {
    // Get final elapsed time
    const finalElapsed = pauseTimer();
    
    // Reset elapsed time
    setElapsedTime(0);
    
    return finalElapsed;
  }, [pauseTimer]);
  
  /**
   * Get the current elapsed time without stopping the timer
   * 
   * @returns The current elapsed time in milliseconds
   */
  const getElapsedTime = useCallback(() => {
    if (startTimeRef.current) {
      return Date.now() - startTimeRef.current + elapsedTime;
    }
    return elapsedTime;
  }, [elapsedTime]);
  
  /**
   * Convert milliseconds to a readable format (MM:SS)
   * 
   * @param ms - Time in milliseconds
   * @returns Formatted time string
   */
  const formatTime = useCallback((ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);
  
  // Clean up interval on unmount
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  return {
    elapsedTime,
    formattedTime: formatTime(elapsedTime),
    startTimer,
    pauseTimer,
    stopTimer,
    getElapsedTime,
    formatTime,
    cleanup
  };
}
