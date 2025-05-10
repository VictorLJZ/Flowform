"use client"

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useFormInsightsChat } from '@/hooks/analytics/useFormInsightsChat';
import { Loader2, Send, MessagesSquare } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChatMessage } from '@/types/chat-types';
import { ChatSessions } from './ChatSessions';
import { ProcessEmbeddingsButton } from './ProcessEmbeddingsButton';

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
    sendMessage,
    sessionId
  } = useFormInsightsChat(formId);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handler for sending messages
  const handleSendMessage = async () => {
    if (inputValue.trim() && !isSending) {
      const message = inputValue;
      setInputValue(''); // Clear input after sending
      await sendMessage(message);
      // Focus input after sending
      inputRef.current?.focus();
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
  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  };

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
          {/* Error message */}
          {error && (
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
              {messages.map((message) => (
                <ChatMessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
          
          {/* Loading indicator */}
          {isLoading && (
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

// Chat message bubble component with improved UI
function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        <div className="prose prose-sm dark:prose-invert">
          {message.content.split('\n').map((line, i) => (
            <p key={i} className={`${i > 0 ? 'mt-2' : 'mt-0'} ${!isUser ? 'text-left' : ''}`}>
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
} 