import React from 'react';
import { AIConversationNavigationProps } from './types';

/**
 * Navigation component for AI Conversation Block
 * Displays buttons to navigate between questions
 */
export function AIConversationNavigation({
  conversation,
  activeQuestionIndex,
  setActiveQuestionIndex,
  hasReturnedToBlock,
  setHasReturnedToBlock,
  effectiveIsComplete,
  nextQuestion,
  settingsMaxQuestions
}: AIConversationNavigationProps) {
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

  // If there's no conversation, don't show the navigation
  if (conversation.length === 0) {
    return null;
  }

  // Helper function to get mapped conversation with first question always showing the starter prompt
  const getMappedConversation = () => {
    return conversation.map((item, idx) => item); // Just return the items for mapping
  };

  const displayConversation = getMappedConversation();

  return (
    <div className="mb-4 border p-3 rounded-md bg-gray-50">
      <h4 className="text-sm font-medium mb-2">Navigate Questions</h4>
      <div className="flex flex-wrap gap-2">
        {displayConversation.map((item, idx) => (
          <button
            key={idx}
            type="button"
            className={`px-3 py-1.5 text-sm rounded-md nav-question-btn ${
              activeQuestionIndex === idx 
                ? 'bg-primary text-primary-foreground font-medium' 
                : 'bg-white border border-gray-200 hover:bg-gray-100 text-gray-800'
            }`}
            onClick={() => handleQuestionNavigation(idx)}
          >
            {idx === 0 ? 'Start' : `Q${idx + 1}`}
          </button>
        ))}
        {/* Always show Current button when not complete, even when already on it */}
        {!effectiveIsComplete && nextQuestion && (
          <button
            type="button"
            className={`px-3 py-1.5 text-sm rounded-md nav-question-btn ${
              activeQuestionIndex === conversation.length 
                ? 'bg-primary text-primary-foreground font-medium' 
                : 'bg-white border border-gray-200 hover:bg-gray-100 text-gray-800'
            }`}
            onClick={() => handleQuestionNavigation(conversation.length)}
          >
            Current
          </button>
        )}
      </div>
      {hasReturnedToBlock && (
        <p className="text-xs text-gray-500 mt-2">
          You can edit your previous answers and generate new follow-up questions.
        </p>
      )}
    </div>
  );
} 