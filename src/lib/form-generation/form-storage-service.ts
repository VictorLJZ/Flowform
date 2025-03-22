import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../supabase/supabase_client';
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
    await this.addQuestion(formId, config.starterQuestion, 0, true);
    
    return formId;
  }
  
  /**
   * Create a new session for a form
   */
  async createSession(formId: string): Promise<string> {
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
  async addQuestion(
    formId: string, 
    content: string, 
    order: number, 
    isStarter: boolean = false
  ): Promise<string> {
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
   * Add an answer to a question
   */
  async addAnswer(
    formId: string,
    questionId: string,
    content: string,
    sessionId: string
  ): Promise<string> {
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
  async updateSessionIndex(sessionId: string, index: number, completed: boolean = false): Promise<void> {
    const { error } = await supabase
      .from('form_sessions')
      .update({ 
        current_question_index: index,
        updated_at: new Date().toISOString(),
        completed
      })
      .eq('id', sessionId);
      
    if (error) throw new Error(`Error updating session: ${error.message}`);
  }
  
  /**
   * Get all questions for a form
   */
  async getFormQuestions(formId: string): Promise<QuestionRecord[]> {
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
  async getForm(formId: string): Promise<FormRecord | null> {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .single();
      
    if (error) throw new Error(`Error fetching form: ${error.message}`);
    
    return data;
  }
  
  /**
   * Get a session by ID
   */
  async getSession(sessionId: string): Promise<FormSession | null> {
    const { data, error } = await supabase
      .from('form_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
      
    if (error) throw new Error(`Error fetching session: ${error.message}`);
    
    return data;
  }
  
  /**
   * Get the full conversation history for a session
   */
  async getConversationHistory(sessionId: string): Promise<{
    questions: QuestionRecord[];
    answers: AnswerRecord[];
  }> {
    // First get the session to get the form ID
    const session = await this.getSession(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);
    
    // Get all questions for the form
    const questions = await this.getFormQuestions(session.form_id);
    
    // Get all answers for the session
    const answers = await this.getSessionAnswers(sessionId);
    
    return { questions, answers };
  }
} 