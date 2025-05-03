import React from 'react';

interface ErrorMessagesProps {
  submitError: string | null;
}

export const ErrorMessages: React.FC<ErrorMessagesProps> = ({ submitError }) => {
  if (!submitError) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 left-4 bg-red-50 border border-red-200 rounded-md p-3 shadow-md z-20">
      <p className="text-red-600 text-sm">{submitError}</p>
    </div>
  );
};
