import { create } from 'zustand';
import { SessionInfo } from '@/types/chat-types';

interface ChatSessionsState {
  // State
  sessions: SessionInfo[];
  currentSessionId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchSessions: (formId: string) => Promise<void>;
  setCurrentSession: (sessionId: string | null) => void;
  createSession: (formId: string) => Promise<string>;
  deleteSession: (sessionId: string) => Promise<void>;
  clearAllSessions: (formId: string) => Promise<void>;
  updateSessionMetadata: (sessionId: string, metadata: Partial<Pick<SessionInfo, 'title' | 'last_message'>>) => Promise<void>;
}

export const useChatSessionsStore = create<ChatSessionsState>((set, get) => ({
  // Initial state
  sessions: [],
  currentSessionId: null,
  isLoading: false,
  error: null,
  
  // Fetch all sessions for a form
  fetchSessions: async (formId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`/api/analytics/chat/sessions?formId=${formId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch chat sessions');
      }
      
      const data = await response.json();
      set({ sessions: data.sessions, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch chat sessions',
        isLoading: false 
      });
    }
  },
  
  // Set current session
  setCurrentSession: (sessionId: string | null) => {
    set({ currentSessionId: sessionId });
  },
  
  // Create a new session
  createSession: async (formId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/analytics/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create chat session');
      }
      
      const data = await response.json();
      const newSessionId = data.sessionId;
      
      // Refresh sessions list
      await get().fetchSessions(formId);
      
      // Set as current session
      set({ currentSessionId: newSessionId, isLoading: false });
      
      return newSessionId;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create chat session',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Delete a session
  deleteSession: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`/api/analytics/chat/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete chat session');
      }
      
      // Remove from local state
      set(state => ({
        sessions: state.sessions.filter(session => session.id !== sessionId),
        // Reset current session if it was deleted
        currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId,
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete chat session',
        isLoading: false 
      });
    }
  },
  
  // Clear all sessions for a form
  clearAllSessions: async (formId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`/api/analytics/chat/sessions/clear?formId=${formId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to clear chat sessions');
      }
      
      // Clear local state
      set({ 
        sessions: [],
        currentSessionId: null,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to clear chat sessions',
        isLoading: false 
      });
    }
  },
  
  // Update session metadata
  updateSessionMetadata: async (sessionId: string, metadata: Partial<Pick<SessionInfo, 'title' | 'last_message'>>) => {
    try {
      const response = await fetch(`/api/analytics/chat/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update session metadata');
      }
      
      // Update in local state
      set(state => ({
        sessions: state.sessions.map(session => 
          session.id === sessionId 
            ? { ...session, ...metadata } 
            : session
        )
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update session metadata'
      });
    }
  }
})); 