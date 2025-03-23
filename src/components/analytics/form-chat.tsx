"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, RefreshCw } from 'lucide-react';
import { create } from 'zustand';

interface FormChatProps {
  formId: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface FormChatState {
  formId: string | null;
  messages: Message[];
  isProcessing: boolean;
  error: string | null;
  
  setFormId: (formId: string) => void;
  addMessage: (message: Message) => void;
  sendMessage: (content: string) => Promise<void>;
  indexResponses: () => Promise<void>;
  clearMessages: () => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFormChatStore = create<FormChatState>((set, get) => ({
  formId: null,
  messages: [],
  isProcessing: false,
  error: null,
  
  setFormId: (formId) => set({ formId }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  clearMessages: () => set({ messages: [] }),
  
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  
  setError: (error) => set({ error }),
  
  sendMessage: async (content) => {
    const { formId, messages, addMessage, setIsProcessing, setError } = get();
    
    if (!formId) {
      setError('No form selected');
      return;
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // Add user message
      addMessage({
        role: 'user',
        content
      });
      
      // Get chat history for context
      const chatHistory = messages.map(({ role, content }) => ({
        role,
        content
      }));
      
      // Call the API
      const response = await fetch(`/api/forms/${formId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: content,
          chatHistory
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process query');
      }
      
      const data = await response.json();
      
      // Add assistant response
      addMessage({
        role: 'assistant',
        content: data.answer
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      
      // Add error message to chat
      addMessage({
        role: 'assistant',
        content: 'I encountered an error processing your request. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  },
  
  indexResponses: async () => {
    const { formId, addMessage, setIsProcessing, setError } = get();
    
    if (!formId) {
      setError('No form selected');
      return;
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // Call the API to index responses
      const response = await fetch(`/api/forms/${formId}/index`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to index responses');
      }
      
      // Add system message about indexing
      addMessage({
        role: 'assistant',
        content: "I've indexed all the form responses. You can now ask me questions about them!"
      });
    } catch (error) {
      console.error('Error indexing responses:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      
      // Add error message to chat
      addMessage({
        role: 'assistant',
        content: 'I encountered an error indexing the form responses. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  }
}));

export function FormChat({ formId }: FormChatProps) {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/forms/${formId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content,
          chatHistory: messages
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleIndexResponses() {
    setIsIndexing(true);
    
    try {
      const response = await fetch(`/api/forms/${formId}/index`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to index responses');
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Form responses have been indexed successfully! You can now ask questions about them.' 
      }]);
    } catch (error) {
      console.error('Error indexing responses:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error indexing the form responses.' 
      }]);
    } finally {
      setIsIndexing(false);
    }
  }
  
  return (
    <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-medium">Form Chat</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleIndexResponses}
          disabled={isIndexing}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {isIndexing ? 'Indexing...' : 'Index Responses'}
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet. Start by indexing your form responses.</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your form responses..."
          className="resize-none"
          rows={1}
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
