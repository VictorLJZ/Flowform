import { useEffect } from "react";
import { ApiQAPair } from "@/types/response";

/**
 * Hook to manage AI conversation navigation
 */
export function useAIConversationNavigation(
  conversation: ApiQAPair[],
  activeQuestionIndex: number,
  setActiveQuestionIndex: (index: number) => void,
  hasReturnedToBlock: boolean,
  setHasReturnedToBlock: (value: boolean) => void,
  hasNavigatedForward: boolean,
  setHasNavigatedForward: (value: boolean) => void,
  effectiveIsComplete: boolean,
  isNavigating: boolean,
  navigationAttempted: boolean,
  settingsMaxQuestions: number,
  mountTimeRef: React.RefObject<number>,
  onNext?: () => void
) {
  // Update effect for detecting return to previous block
  useEffect(() => {
    // Only run if we have conversation data
    if (conversation.length === 0) return;

    const isReturnVisit = conversation.length > 0;
    const currentTime = new Date().getTime();
    const timeElapsedSinceMount = currentTime - (mountTimeRef.current || 0);
    
    // If significant time has passed (>2s) and we have conversation data, 
    // this is almost certainly a return visit rather than initial load
    const isLikelyReturnFromOtherBlock = timeElapsedSinceMount > 2000 && isReturnVisit;
    
    if (isReturnVisit) {
      console.log('User appears to have returned to a previously answered AIConversationBlock', {
        conversationLength: conversation.length,
        hasReturnedToBlock,
        timeElapsedSinceMount,
        isLikelyReturnFromOtherBlock,
        settingsMaxQuestions,
        effectiveIsComplete,
        activeQuestionIndex
      });
      
      // Mark as a return visit
      if (!hasReturnedToBlock) {
        setHasReturnedToBlock(true);
        
        // Reset navigation flag if this is a genuine return from another block
        if (isLikelyReturnFromOtherBlock) {
          setHasNavigatedForward(false);
        }
      }
      
      // If we're just returning and no specific question index is selected,
      // focus on the latest question - but only if not already at a specific index like 0
      if (activeQuestionIndex === 0 && conversation.length > 0 && !isLikelyReturnFromOtherBlock && 
          !document.activeElement?.classList.contains('nav-question-btn')) {
        // On initial render, set to the latest answer or conversation length (for current)
        const newIndex = Math.min(conversation.length, settingsMaxQuestions);
        console.log(`Setting active question index to ${newIndex} based on return visit detection`);
        setActiveQuestionIndex(newIndex); 
      }
    }
  }, [
    conversation, 
    hasReturnedToBlock, 
    setHasReturnedToBlock, 
    activeQuestionIndex, 
    setActiveQuestionIndex, 
    settingsMaxQuestions, 
    effectiveIsComplete, 
    setHasNavigatedForward,
    mountTimeRef
  ]);

  // Auto-navigate when max questions is reached
  useEffect(() => {
    if (!onNext) return;
    
    let timeoutId: NodeJS.Timeout | undefined;
    
    // Debug logging to help track the issue
    if (process.env.NODE_ENV === 'development') {
      console.log('Checking max questions condition:', {
        conversationLength: conversation.length,
        settingsMaxQuestions,
        hasReachedMaxQuestions: settingsMaxQuestions > 0 && conversation.length >= settingsMaxQuestions,
        effectiveIsComplete,
        hasNavigatedForward,
        hasReturnedToBlock,
        shouldAutoNavigate: 
          (settingsMaxQuestions > 0 && 
          conversation.length >= settingsMaxQuestions && 
          !hasNavigatedForward && 
          !hasReturnedToBlock && 
          activeQuestionIndex >= conversation.length)
      });
    }
    
    // Only auto-navigate if all conditions are met
    const shouldAutoNavigate = 
      settingsMaxQuestions > 0 && 
      conversation.length >= settingsMaxQuestions && 
      !hasNavigatedForward && 
      !hasReturnedToBlock && 
      activeQuestionIndex >= conversation.length;
    
    if (shouldAutoNavigate) {
      console.log('Max questions reached, triggering completion');
      setHasNavigatedForward(true);
      
      // Add a short delay to allow rendering to complete
      timeoutId = setTimeout(() => {
        try {
          onNext();
        } catch (error) {
          console.error('Error in auto-navigation:', error);
        }
      }, 300);
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [
    conversation.length, 
    settingsMaxQuestions, 
    effectiveIsComplete, 
    hasNavigatedForward, 
    setHasNavigatedForward, 
    hasReturnedToBlock, 
    activeQuestionIndex, 
    onNext
  ]);

  // Force navigation if stuck for too long with navigation attempted
  useEffect(() => {
    if (!navigationAttempted || !isNavigating || !onNext) return;
    
    const timeoutId = setTimeout(() => {
      if (isNavigating && navigationAttempted) {
        console.log('Navigation appears stuck - forcing navigation');
        try {
          onNext();
        } catch (error) {
          console.error('Forced navigation error:', error);
        }
      }
    }, 2500);
    
    return () => clearTimeout(timeoutId);
  }, [navigationAttempted, isNavigating, onNext]);

  // Create a custom function to handle question navigation
  const handleQuestionNavigation = (index: number) => {
    console.log(`Navigation requested to question ${index}`, {
      currentIndex: activeQuestionIndex,
      conversationLength: conversation.length
    });
    
    // Special case for navigating to question 0 (Start)
    if (index === 0) {
      console.log("Explicitly navigating to Start question (index 0)");
    }
    
    // Prevent the automatic adjustment from the return detection logic
    setActiveQuestionIndex(index);
    
    // Explicitly set hasReturnedToBlock to prevent auto-navigation
    if (!hasReturnedToBlock) {
      setHasReturnedToBlock(true);
    }
  };

  return {
    handleQuestionNavigation
  };
} 