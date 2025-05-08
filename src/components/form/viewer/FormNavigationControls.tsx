import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FormNavigationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  isPreviousDisabled: boolean;
  isNextDisabled: boolean;
  isSubmitting: boolean;
}

export const FormNavigationControls: React.FC<FormNavigationControlsProps> = ({ 
  onPrevious,
  onNext,
  isPreviousDisabled,
  isNextDisabled,
  isSubmitting,
}) => {
  // Debug log to check navigation control state
  console.log('DEBUG_NAV_CONTROLS:', {
    isPreviousDisabled,
    isNextDisabled,
    isSubmitting,
    hasOnNextHandler: !!onNext,
    hasOnPreviousHandler: !!onPrevious
  });
  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 z-10">
      <button 
        onClick={onPrevious}
        disabled={isPreviousDisabled}
        className="w-10 h-10 rounded-full bg-white/80 shadow-md flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous question"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <button 
        onClick={() => {
          console.log('DEBUG_NEXT_BUTTON_CLICK: Next button clicked', {
            isDisabled: isNextDisabled,
            isSubmitting
          });
          onNext();
        }}
        disabled={isNextDisabled}
        className="w-10 h-10 rounded-full bg-white/80 shadow-md flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next question"
      >
        {isSubmitting ? (
          <div className="h-5 w-5 border-2 border-t-transparent border-primary rounded-full animate-spin" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};
