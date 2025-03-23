import { create } from 'zustand';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface FormChatState {
  formId: string | null;
  messages: ChatMessage[];
  isProcessing: boolean;
  error: string | null;
  
  setFormId: (formId: string) => void;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  
  // For API interactions
  sendMessage: (content: string) => Promise<void>;
  indexResponses: () => Promise<void>;
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
    
    // Add user message to chat
    addMessage({ role: 'user', content });
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // Format chat history for the API
      const chatHistory = messages
        .slice(-6) // Only include the last 6 messages for context
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
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
      
      // Add assistant response to chat
      addMessage({ role: 'assistant', content: data.answer });
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