import React from 'react';
import { Button } from "@/components/ui/button";
import { AIConversationButtonsProps } from './types';

/**
 * Buttons component for AI Conversation Block
 * Displays action buttons (Back, Continue, Submit) based on the current state
 */
export function AIConversationButtons({
  effectiveIsComplete,
  isEditingQuestion,
  // isInitialState, // Not currently used
  handleNext,
  handleSubmit,
  isNextDisabled,
  isNavigating,
  isSubmitting,
  isLoading,
  userInput,
  onPrevious,
  activeQuestionIndex,
  setActiveQuestionIndex,
  // conversation // Not currently used
}: AIConversationButtonsProps) {
  // Enhanced handler for navigating to previous question or previous form block
  const handlePrevious = () => {
    // If we're not at the first question, go to the previous question
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(activeQuestionIndex - 1);
      return;
    }
    
    // Otherwise, use the onPrevious handler to go to the previous form block
    if (onPrevious) {
      onPrevious();
    } else {
      console.log('No previous action defined');
    }
  };

  // Determine if we can go to a previous question
  const hasPreviousQuestion = activeQuestionIndex > 0;
  // Determine if we should show the back button - using isStartQuestion instead
  // const shouldShowBackButton = hasPreviousQuestion || onPrevious;
  // Whether this is the start question
  const isStartQuestion = activeQuestionIndex === 0;

  return (
    <div className="flex justify-between">
      <div>
        {/* Only show Back button when not on the first question */}
        {!isStartQuestion && (
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isNavigating}
          >
            {hasPreviousQuestion ? 'Previous Question' : (onPrevious ? 'Back' : 'Go Back')}
          </Button>
        )}
      </div>
      
      {effectiveIsComplete && !isEditingQuestion ? (
        // Show Continue button when all questions are answered and not editing
        <Button 
          onClick={handleNext}
          disabled={isNextDisabled || isNavigating}
        >
          {isNavigating ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full inline-block mr-2" />
              Continuing...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      ) : (
        // Regular Submit Answer button
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || isLoading || !userInput}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full inline-block mr-2" />
              Submitting...
            </>
          ) : (
            'Submit Answer'
          )}
        </Button>
      )}
    </div>
  );
} 