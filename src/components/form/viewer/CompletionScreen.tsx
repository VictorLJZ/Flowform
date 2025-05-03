import React from 'react';

interface CompletionScreenProps {
  onReturnHome: () => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({ onReturnHome }) => {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
      <div className="max-w-lg">
        <h1 className="text-3xl font-bold mb-4">Thank you!</h1>
        <p className="text-lg text-gray-600 mb-8">Your form has been submitted successfully.</p>
        <button 
          onClick={onReturnHome}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
        >
          Return Home
        </button>
      </div>
    </div>
  );
};
