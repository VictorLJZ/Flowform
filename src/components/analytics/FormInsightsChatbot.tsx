"use client"

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useFormInsightsChat } from '@/hooks/analytics/useFormInsightsChat';
import { Loader2, Send, MessagesSquare, Search, Database, BrainCircuit } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UiChatMessage, RagStatus } from '@/types/conversation';
import { ChatSessions } from './ChatSessions';
import { ProcessEmbeddingsButton } from './ProcessEmbeddingsButton';
import ReactMarkdown from 'react-markdown';
import React from 'react';

// Suggested questions - more compact
const SUGGESTED_QUESTIONS = [
  "What are the common themes in responses?",
  "Summarize the overall sentiment",
  "What topics appear most frequently?"
];

interface FormInsightsChatbotProps {
  formId: string;
}

export function FormInsightsChatbot({ formId }: FormInsightsChatbotProps) {
  const [inputValue, setInputValue] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    messages,
    isLoading,
    isSending,
    error,
    ragStatus,
    sendMessage
  } = useFormInsightsChat(formId);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, ragStatus]);

  // Auto-focus input after initializing
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handler for sending messages
  const handleSendMessage = async () => {
    if (inputValue.trim() && !isSending) {
      const message = inputValue;
      setInputValue(''); // Clear input after sending
      await sendMessage(message);
      // Focus input after sending for immediate follow-up
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Handler for pressing Enter key in the input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handler for using a suggested question
  const handleSuggestedQuestion = (content: string) => {
    setInputValue(content);
    inputRef.current?.focus();
  };

  // Prepare messages and RAG status for display
  const displayItems = React.useMemo(() => {
    // Only show RAG status if it exists
    const shouldShowRagStatus = !!ragStatus;
    
    if (shouldShowRagStatus) {
      // Create a copy of messages to work with
      const messageList = [...messages];
      
      // Debug what's happening with RAG status
      console.log("RAG Status:", ragStatus);
      
      // Find the last user message to place the RAG status after it
      const lastUserMessageIndex = messageList.map(m => m.role).lastIndexOf('user');
      
      if (lastUserMessageIndex !== -1) {
        // Create an array with user messages, then RAG status, then AI messages
        const result: Array<{ type: 'message' | 'status', content: UiChatMessage | RagStatus }> = [];
        
        // Add all messages up to and including the last user message
        for (let i = 0; i <= lastUserMessageIndex; i++) {
          result.push({
            type: 'message',
            content: messageList[i]
          });
        }
        
        // Add the RAG status indicator
        result.push({
          type: 'status',
          content: ragStatus
        });
        
        // Add any remaining messages (AI responses that came after the last user message)
        // These would be the assistant's responses to the user's query
        const assistantMessagesAfterLastUser = messageList
          .slice(lastUserMessageIndex + 1)
          .filter(m => m.role === 'assistant');
        
        for (const message of assistantMessagesAfterLastUser) {
          result.push({
            type: 'message',
            content: message
          });
        }
        
        return result;
      }
    }
    
    // Otherwise, just return messages without status
    return messages.map(message => ({
      type: 'message' as const,
      content: message
    }));
  }, [messages, ragStatus]);

  return (
    <div className="flex h-full gap-4">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between py-2">
          <div>
            <CardTitle>Form Insights Assistant</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <ProcessEmbeddingsButton formId={formId} />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className={showHistory ? "bg-muted" : ""}
            >
              <MessagesSquare className="h-4 w-4 mr-2" />
              Chat History
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow overflow-auto p-4 space-y-4">
          {/* Error message - only show serious errors, not streaming-related ones */}
          {error && !error.includes('status stream') && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Messages or welcome */}
          {messages.length === 0 ? (
            <div className="text-center py-4 space-y-4">
              <h3 className="text-xl font-medium">Welcome to Form Insights</h3>
              <p className="text-muted-foreground">
                Ask questions about your form responses to gain insights.
              </p>
              
              {/* Compact suggested questions in a horizontal layout */}
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTED_QUESTIONS.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-sm"
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Display messages and RAG status in the correct sequence */}
              {displayItems.map((item, index) => (
                <React.Fragment key={index}>
                  {item.type === 'message' ? (
                    <ChatMessageBubble message={item.content as UiChatMessage} />
                  ) : (
                    <RagStatusIndicator status={item.content as RagStatus} />
                  )}
                </React.Fragment>
              ))}
              
              <div ref={messagesEndRef} />
            </div>
          )}
          
          {/* Loading indicator */}
          {isLoading && !ragStatus && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-4 border-t">
          <div className="flex w-full items-center space-x-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your form responses..."
              disabled={isSending}
              className="flex-1"
            />
            
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputValue.trim() || isSending}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Chat history sidebar */}
      {showHistory && (
        <div className="w-80">
          <ChatSessions formId={formId} />
        </div>
      )}
    </div>
  );
}

// RAG Status Indicator Component
function RagStatusIndicator({ status }: { status: { stage: string, query?: string, resultsCount?: number } }) {
  // Add debug logging
  console.log("Rendering RAG Status:", status);
  
  let message = 'Processing your request...';
  let icon = <Loader2 className="h-3 w-3 mr-2 animate-spin" />;
  
  if (status.stage === 'searching') {
    message = `Searching form responses for "${status.query?.substring(0, 30)}${status.query && status.query.length > 30 ? '...' : ''}"`;
    icon = <Search className="h-3 w-3 mr-2 animate-pulse" />;
  } else if (status.stage === 'processing') {
    message = `Found ${status.resultsCount ?? '?'} relevant ${status.resultsCount === 1 ? 'response' : 'responses'}, analyzing...`;
    icon = <Database className="h-3 w-3 mr-2 animate-pulse" />;
  } else if (status.stage === 'complete') {
    message = `Analyzed ${status.resultsCount ?? '?'} relevant ${status.resultsCount === 1 ? 'response' : 'responses'}`;
    icon = <BrainCircuit className="h-3 w-3 mr-2" />;
  }
  
  return (
    <div className="flex items-center justify-center my-2 opacity-90 transition-opacity duration-300">
      <div className="bg-muted/80 hover:bg-muted px-4 py-2 rounded-md text-xs flex items-center text-muted-foreground shadow-sm transition-all">
        {icon}
        <span>{message}</span>
      </div>
    </div>
  );
}

// Chat message bubble component with improved UI
function ChatMessageBubble({ message }: { message: UiChatMessage }) {
  const isUser = message.role === 'user';
  
  // Check if message contains RAG search indicator
  const isSearching = message.role === 'assistant' && 
    message.content.includes('Searching form responses');
    
  // Check if response includes RAG citation
  const hasRagResults = message.role === 'assistant' && 
    message.content.includes('[Conversation');
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        {isUser ? (
          <div className="prose prose-sm dark:prose-invert">
            {message.content.split('\n').map((line: string, i: number) => (
              <p key={i} className={`${i > 0 ? 'mt-2' : 'mt-0'}`}>
                {line}
              </p>
            ))}
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert">
            {isSearching && (
              <div className="flex items-center text-muted-foreground mb-2">
                <Search className="h-3 w-3 mr-2 animate-pulse" />
                <span className="text-xs">Searching form responses...</span>
              </div>
            )}
            {hasRagResults && (
              <div className="flex items-center text-muted-foreground mb-2">
                <Database className="h-3 w-3 mr-2" />
                <span className="text-xs">Found relevant form responses</span>
              </div>
            )}
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
} 