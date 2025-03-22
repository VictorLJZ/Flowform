import { create } from 'zustand';
import { ChatMessage, ChatSession, RAGResult } from '@/types/analytics';
import { v4 as uuidv4 } from 'uuid';

interface AnalyticsState {
  currentSession: ChatSession | null;
  isLoading: boolean;
  error: string | null;
  relevantResponses: RAGResult[];
  
  // Actions
  startChatSession: (formId: string) => void;
  sendMessage: (content: string, formId: string) => Promise<void>;
  resetSession: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  currentSession: null,
  isLoading: false,
  error: null,
  relevantResponses: [],
  
  startChatSession: (formId: string) => {
    const newSession: ChatSession = {
      id: uuidv4(),
      formId,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    set({ currentSession: newSession, relevantResponses: [] });
  },
  
  sendMessage: async (content: string, formId: string) => {
    const { currentSession } = get();
    
    if (!currentSession && !formId) {
      set({ error: 'No active session and no form ID provided' });
      return;
    }
    
    // If no session exists, create one
    if (!currentSession) {
      get().startChatSession(formId);
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // Add user message to the session
      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: new Date().toISOString()
      };
      
      set(state => ({
        currentSession: state.currentSession ? {
          ...state.currentSession,
          messages: [...state.currentSession.messages, userMessage],
          updatedAt: new Date().toISOString()
        } : null
      }));
      
      // Call the API to analyze the form responses using RAG
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId: currentSession?.formId || formId,
          query: content,
          previousResponseId: currentSession?.previousResponseId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze form responses');
      }
      
      const data = await response.json();
      
      // Add assistant message to the session
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toISOString()
      };
      
      set(state => ({
        currentSession: state.currentSession ? {
          ...state.currentSession,
          messages: [...state.currentSession.messages, assistantMessage],
          updatedAt: new Date().toISOString(),
          previousResponseId: data.previousResponseId // Store for OpenAI Responses API state management
        } : null,
        relevantResponses: data.relevantResponses,
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        isLoading: false 
      });
    }
  },
  
  resetSession: () => {
    set({
      currentSession: null,
      isLoading: false,
      error: null,
      relevantResponses: []
    });
  }
}));
