import React from 'react';
import { AIConversationHistoryProps } from './types';

/**
 * History component for AI Conversation Block
 * Displays the conversation history in a scrollable container
 */
export function AIConversationHistory({
  displayConversation,
  historyContainerRef
}: AIConversationHistoryProps) {
  if (displayConversation.length === 0) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-medium">Conversation History</h3>
        <span className="text-xs text-gray-500">
          {displayConversation.length} {displayConversation.length === 1 ? 'response' : 'responses'}
        </span>
      </div>
      <div 
        ref={historyContainerRef}
        className="p-4 space-y-4 max-h-64 overflow-y-auto"
      >
        {displayConversation.map((item, idx) => (
          <div key={idx} className="space-y-2">
            {/* Always show the question in history */}
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-blue-800">Question {idx + 1}:</p>
                {idx === 0 && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Starter</span>
                )}
              </div>
              <p className="text-sm">{item.content}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md ml-4">
              <p className="text-sm font-medium text-gray-800">Your type: &quot;answer&quot;, content:</p>
              <p className="text-sm">{item.type === 'answer' ? item.content : ''}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 