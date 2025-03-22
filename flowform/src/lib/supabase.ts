import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Type for the forms table
export type Form = {
  id: string;
  user_id: string;
  title: string;
  starter_question: string;
  instructions: string | null;
  temperature: number;
  max_questions: number;
  created_at: string;
  updated_at: string;
};

// Type for the respondents table
export type Respondent = {
  id: string;
  form_id: string;
  session_id: string;
  created_at: string;
  completed_at: string | null;
};

// Type for the interactions table
export type Interaction = {
  id: string;
  respondent_id: string;
  question: string;
  answer: string | null;
  question_index: number;
  vector_embedding: number[] | null;
  created_at: string;
};

// Helper function to get forms for a user
export async function getForms(userId: string) {
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching forms: ${error.message}`);
  }

  return data as Form[];
}

// Helper function to get a single form
export async function getForm(formId: string) {
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .single();

  if (error) {
    throw new Error(`Error fetching form: ${error.message}`);
  }

  return data as Form;
}

// Helper function to create a form
export async function createForm(form: Omit<Form, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('forms')
    .insert([form])
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating form: ${error.message}`);
  }

  return data as Form;
}

// Helper function to update a form
export async function updateForm(formId: string, updates: Partial<Omit<Form, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) {
  const { data, error } = await supabase
    .from('forms')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', formId)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating form: ${error.message}`);
  }

  return data as Form;
}

// Helper function to delete a form
export async function deleteForm(formId: string) {
  const { error } = await supabase
    .from('forms')
    .delete()
    .eq('id', formId);

  if (error) {
    throw new Error(`Error deleting form: ${error.message}`);
  }

  return true;
}

// Helper function to create a respondent session
export async function createRespondent(formId: string) {
  const sessionId = crypto.randomUUID();
  
  const { data, error } = await supabase
    .from('respondents')
    .insert([
      { form_id: formId, session_id: sessionId }
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating respondent: ${error.message}`);
  }

  return data as Respondent;
}

// Helper function to record an interaction
export async function recordInteraction(
  respondentId: string,
  question: string,
  answer: string | null,
  questionIndex: number,
  embedding?: number[]
) {
  const { data, error } = await supabase
    .from('interactions')
    .insert([
      {
        respondent_id: respondentId,
        question,
        answer,
        question_index: questionIndex,
        vector_embedding: embedding || null
      }
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Error recording interaction: ${error.message}`);
  }

  return data as Interaction;
}

// Helper function to complete a respondent session
export async function completeRespondent(respondentId: string) {
  const { data, error } = await supabase
    .from('respondents')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', respondentId)
    .select()
    .single();

  if (error) {
    throw new Error(`Error completing respondent: ${error.message}`);
  }

  return data as Respondent;
}

// Helper function to get all interactions for a form
export async function getFormInteractions(formId: string) {
  const { data, error } = await supabase
    .from('interactions')
    .select(`
      *,
      respondents (id, session_id, created_at, completed_at)
    `)
    .eq('respondents.form_id', formId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Error fetching interactions: ${error.message}`);
  }

  return data;
}

// Helper function for vector search (for RAG)
export async function vectorSearch(
  query: number[],
  formId: string,
  limit: number = 5
) {
  // Using Supabase's pgvector extension
  const { data, error } = await supabase.rpc(
    'vector_search',
    {
      query_embedding: query,
      form_id: formId,
      match_threshold: 0.5,
      match_count: limit
    }
  );

  if (error) {
    throw new Error(`Error performing vector search: ${error.message}`);
  }

  return data as (Interaction & { similarity: number })[];
}
