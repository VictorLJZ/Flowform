import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/supabase/server';
import { 
  FormRecord, 
  QuestionRecord, 
  AnswerRecord, 
  FormSession 
} from '../../types/supabase-types';
import { FormGenerationConfig } from '../../types/form-generation';

export class FormStorageService {
  /**
   * Create a new form in the database
   */
  async createForm(config: FormGenerationConfig, title: string, description?: string): Promise<string> {
    const supabase = await createClient();
    const formId = uuidv4();
    const now = new Date().toISOString();
    
    const formData: FormRecord = {
      id: formId,
      title,
      description,
      instructions: config.instructions,
      max_questions: config.maxQuestions,
      temperature: config.temperature,
      created_at: now,
      updated_at: now,
      status: 'active'
    };
    
    const { error } = await supabase
      .from('forms')
      .insert(formData);
      
    if (error) throw new Error(`Error creating form: ${error.message}`);
    
    // Add the starter question
    await this.saveQuestion(formId, config.starterQuestion, 0, true);
    
    return formId;
  }
  
  /**
   * Create a new session for a form
   */
  async createFormSession(formId: string): Promise<string> {
    const supabase = await createClient();
    const sessionId = uuidv4();
    const now = new Date().toISOString();
    
    const sessionData: FormSession = {
      id: sessionId,
      form_id: formId,
      current_question_index: 0,
      created_at: now,
      updated_at: now,
      completed: false
    };
    
    const { error } = await supabase
      .from('form_sessions')
      .insert(sessionData);
      
    if (error) throw new Error(`Error creating session: ${error.message}`);
    
    return sessionId;
  }
  
  /**
   * Add a question to a form
   */
  async saveQuestion(
    formId: string, 
    content: string, 
    order: number, 
    isStarter: boolean = false
  ): Promise<string> {
    const supabase = await createClient();
    const questionId = uuidv4();
    const now = new Date().toISOString();
    
    const questionData: QuestionRecord = {
      id: questionId,
      form_id: formId,
      content,
      order,
      is_starter: isStarter,
      created_at: now
    };
    
    const { error } = await supabase
      .from('questions')
      .insert(questionData);
      
    if (error) throw new Error(`Error adding question: ${error.message}`);
    
    return questionId;
  }
  
  /**
   * Save an answer to a question
   */
  async saveAnswer(
    formId: string,
    questionId: string,
    content: string,
    sessionId: string
  ): Promise<string> {
    const supabase = await createClient();
    const answerId = uuidv4();
    const now = new Date().toISOString();
    
    const answerData: AnswerRecord = {
      id: answerId,
      form_id: formId,
      question_id: questionId,
      content,
      created_at: now,
      session_id: sessionId
    };
    
    const { error } = await supabase
      .from('answers')
      .insert(answerData);
      
    if (error) throw new Error(`Error adding answer: ${error.message}`);
    
    return answerId;
  }
  
  /**
   * Update the session's current question index
   */
  async updateSessionQuestion(sessionId: string, index: number): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('form_sessions')
      .update({ 
        current_question_index: index,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);
      
    if (error) throw new Error(`Error updating session: ${error.message}`);
  }
  
  /**
   * Mark a session as completed
   */
  async completeSession(sessionId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('form_sessions')
      .update({ 
        completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);
      
    if (error) throw new Error(`Error completing session: ${error.message}`);
  }
  
  /**
   * Get all questions for a form
   */
  async getFormQuestions(formId: string): Promise<QuestionRecord[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('form_id', formId)
      .order('order', { ascending: true });
      
    if (error) throw new Error(`Error fetching questions: ${error.message}`);
    
    return data || [];
  }
  
  /**
   * Get all answers for a session
   */
  async getSessionAnswers(sessionId: string): Promise<AnswerRecord[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('answers')
      .select('*')
      .eq('session_id', sessionId);
      
    if (error) throw new Error(`Error fetching answers: ${error.message}`);
    
    return data || [];
  }
  
  /**
   * Get a form by ID
   */
  async getFormById(formId: string): Promise<FormRecord | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found' error
      throw new Error(`Error fetching form: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Get a session by ID
   */
  async getSessionById(sessionId: string): Promise<FormSession | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('form_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found' error
      throw new Error(`Error fetching session: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Get all forms
   */
  async getAllForms(): Promise<FormRecord[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw new Error(`Error fetching forms: ${error.message}`);
    
    return data || [];
  }
  
  /**
   * Get the full conversation history for a session
   */
  async getConversationHistory(sessionId: string): Promise<{
    questions: QuestionRecord[];
    answers: AnswerRecord[];
  }> {
    // First get the session to get the form ID
    const session = await this.getSessionById(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);
    
    // Get all questions for the form
    const questions = await this.getFormQuestions(session.form_id);
    
    // Get all answers for the session
    const answers = await this.getSessionAnswers(sessionId);
    
    return { questions, answers };
  }

  /**
   * Get all sessions for a form
   */
  async getFormSessions(formId: string): Promise<FormSession[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('form_sessions')
      .select('*')
      .eq('form_id', formId)
      .order('created_at', { ascending: false });
      
    if (error) throw new Error(`Error fetching form sessions: ${error.message}`);
    
    return data || [];
  }

  /**
   * Get the starter question for a form
   */
  async getFormStarterQuestion(formId: string): Promise<string | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('questions')
      .select('content')
      .eq('form_id', formId)
      .eq('is_starter', true)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found' error
      throw new Error(`Error fetching starter question: ${error.message}`);
    }
    
    return data?.content || null;
  }

  /**
   * Get the current question for a session
   */
  async getCurrentSessionQuestion(sessionId: string): Promise<QuestionRecord | null> {
    // First get the session to get current question index
    const session = await this.getSessionById(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);
    
    // Get all questions for the form
    const questions = await this.getFormQuestions(session.form_id);
    if (!questions || questions.length === 0) return null;
    
    // Find the current question based on the session's current_question_index
    const currentQuestionIndex = session.current_question_index || 0;
    const currentQuestion = questions.find(q => q.order === currentQuestionIndex);
    
    return currentQuestion || null;
  }

  /**
   * Get all questions for a specific session
   */
  async getSessionQuestions(sessionId: string): Promise<QuestionRecord[]> {
    // First get the session to get the form ID
    const session = await this.getSessionById(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);
    
    // Get all questions for the form
    return this.getFormQuestions(session.form_id);
  }
} 