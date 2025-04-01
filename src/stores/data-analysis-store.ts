import { create } from 'zustand';
import { createClient } from '@/supabase/client';

export interface FormAnalytics {
  id: string;
  title: string;
  description: string;
  responseCount: number;
  lastActivity: string;
  isIndexed: boolean;
}

interface DataAnalysisState {
  forms: FormAnalytics[];
  isLoading: boolean;
  error: string | null;
  
  fetchForms: () => Promise<void>;
  checkIndexStatus: (formId: string) => Promise<boolean>;
}

export const useDataAnalysisStore = create<DataAnalysisState>((set, get) => ({
  forms: [],
  isLoading: false,
  error: null,
  
  fetchForms: async () => {
    try {
      set({ isLoading: true, error: null });
      const supabase = createClient();
      
      // Fetch forms with response counts
      const { data: forms, error: formsError } = await supabase
        .from('forms')
        .select(`
          id, 
          title, 
          description,
          created_at,
          updated_at
        `)
        .order('updated_at', { ascending: false });
      
      if (formsError) throw formsError;
      
      // For each form, get the count of responses
      const formsWithStats = await Promise.all(forms.map(async (form) => {
        const supabase = createClient();
        // Get response count
        const { count: responseCount, error: countError } = await supabase
          .from('form_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('form_id', form.id);
          
        if (countError) throw countError;
        
        // Check if the form has been indexed
        const isIndexed = await get().checkIndexStatus(form.id);
        
        // Find the most recent activity
        const { data: latestSession, error: sessionError } = await supabase
          .from('form_sessions')
          .select('created_at')
          .eq('form_id', form.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        const lastActivity = latestSession && latestSession.length > 0
          ? latestSession[0].created_at
          : form.updated_at;
        
        return {
          id: form.id,
          title: form.title,
          description: form.description || 'No description',
          responseCount: responseCount || 0,
          lastActivity,
          isIndexed
        };
      }));
      
      set({ forms: formsWithStats, isLoading: false });
    } catch (error) {
      console.error('Error fetching forms for analysis:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error occurred', isLoading: false });
    }
  },
  
  checkIndexStatus: async (formId: string) => {
    try {
      const supabase = createClient();
      // Check if there are any embeddings for this form
      const { count, error } = await supabase
        .from('form_qa_embeddings')
        .select('id', { count: 'exact', head: true })
        .eq('form_id', formId);
        
      if (error) throw error;
      
      return count !== null && count > 0;
    } catch (error) {
      console.error('Error checking index status:', error);
      return false;
    }
  }
}));
