import { create } from 'zustand';
import { FormSession } from '@/types/form';
import { createRespondent, recordInteraction, completeRespondent } from '@/lib/supabase';

interface FormResponseState {
  session: FormSession | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  startSession: (formId: string, starterQuestion: string) => Promise<void>;
  submitResponse: (answer: string) => Promise<void>;
  generateNextQuestion: (formId: string, instructions: string, temperature: number) => Promise<string>;
  completeSession: () => Promise<void>;
  resetSession: () => void;
}

export const useFormResponseStore = create<FormResponseState>((set, get) => ({
  session: null,
  isLoading: false,
  error: null,
  
  startSession: async (formId: string, starterQuestion: string) => {
    set({ isLoading: true, error: null });
    try {
      // Create a new respondent in the database
      const respondent = await createRespondent(formId);
      
      // Create a new session with the starter question
      const newSession: FormSession = {
        respondentId: respondent.id,
        sessionId: respondent.session_id,
        formId: respondent.form_id,
        currentQuestion: starterQuestion,
        previousQuestions: [starterQuestion],
        previousAnswers: [],
        questionIndex: 0,
        isComplete: false
      };
      
      // Record the starter question in the interactions table
      await recordInteraction(
        respondent.id,
        starterQuestion,
        null, // No answer yet
        0 // First question
      );
      
      set({ session: newSession, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  submitResponse: async (answer: string) => {
    const { session } = get();
    if (!session) {
      set({ error: 'No active session' });
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      // Record the answer to the current question
      await recordInteraction(
        session.respondentId,
        session.currentQuestion,
        answer,
        session.questionIndex
      );
      
      // Update the session state
      set(state => {
        if (!state.session) return state;
        
        return {
          ...state,
          session: {
            ...state.session,
            previousAnswers: [...state.session.previousAnswers, answer],
            isLoading: false
          }
        };
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  generateNextQuestion: async (formId: string, instructions: string, temperature: number) => {
    const { session } = get();
    if (!session) {
      throw new Error('No active session');
    }
    
    set({ isLoading: true, error: null });
    try {
      // This would call our API endpoint that uses OpenAI to generate the next question
      const response = await fetch('/api/ai/generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId,
          previousQuestions: session.previousQuestions,
          previousAnswers: session.previousAnswers,
          instructions,
          temperature
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate next question');
      }
      
      const data = await response.json();
      const nextQuestion = data.question;
      
      // Record the new question in the interactions table
      await recordInteraction(
        session.respondentId,
        nextQuestion,
        null, // No answer yet
        session.questionIndex + 1
      );
      
      // Update the session state with the new question
      set(state => {
        if (!state.session) return state;
        
        return {
          ...state,
          session: {
            ...state.session,
            currentQuestion: nextQuestion,
            previousQuestions: [...state.session.previousQuestions, nextQuestion],
            questionIndex: state.session.questionIndex + 1,
            isLoading: false
          }
        };
      });
      
      return nextQuestion;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  completeSession: async () => {
    const { session } = get();
    if (!session) {
      set({ error: 'No active session' });
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      // Mark the respondent as completed in the database
      await completeRespondent(session.respondentId);
      
      // Update the session state
      set(state => {
        if (!state.session) return state;
        
        return {
          ...state,
          session: {
            ...state.session,
            isComplete: true,
            isLoading: false
          }
        };
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  resetSession: () => {
    set({
      session: null,
      isLoading: false,
      error: null
    });
  }
}));
