import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { AIConversationInputProps } from './types';

/**
 * Input component for AI Conversation Block
 * Displays the textarea for user input
 */
export function AIConversationInput({
  userInput,
  setUserInput,
  handleSubmit,
  isSubmitting,
  isLoading,
  effectiveIsComplete,
  activeQuestionIndex,
  conversation
}: AIConversationInputProps) {
  // Don't show input field if complete and not editing
  const isEditingQuestion = activeQuestionIndex < conversation.length;
  if (effectiveIsComplete && !isEditingQuestion) {
    return null;
  }

  return (
    <div>
      <Textarea
        placeholder="Type your answer here..."
        value={userInput}
        onChange={e => setUserInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.shiftKey && !isSubmitting && userInput.trim()) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        rows={4}
        className="w-full"
        disabled={isSubmitting || isLoading}
      />
      <p className="text-xs text-gray-500 mt-1">
        Press Shift+Enter to submit your answer
      </p>
    </div>
  );
} 