import OpenAI from 'openai';
import { createClient } from '@/supabase/server';
import { FormRecord, QuestionRecord, AnswerRecord } from '@/types/supabase-types';
import crypto from 'crypto';

export class VectorStorageService {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  /**
   * Generate embeddings for form responses and store them in Supabase
   */
  async indexFormResponses(formId: string): Promise<void> {
    try {
      const supabase = await createClient();
      
      // Get all sessions for this form
      const { data: sessions, error: sessionsError } = await supabase
        .from('form_sessions')
        .select('*')
        .eq('form_id', formId);
      
      if (sessionsError) throw new Error(`Error fetching sessions: ${sessionsError.message}`);
      if (!sessions || sessions.length === 0) return;
      
      // Get form details for context
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();
        
      if (formError) throw new Error(`Error fetching form: ${formError.message}`);
      
      // Process sessions in batches
      const batchSize = 5;
      console.log(`Indexing ${sessions.length} sessions in batches of ${batchSize}`);
      
      for (let i = 0; i < sessions.length; i += batchSize) {
        const batch = sessions.slice(i, i + batchSize);
        await Promise.all(batch.map(session => this.processSession(form, session)));
        console.log(`Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(sessions.length/batchSize)}`);
      }
      
      console.log(`Successfully indexed responses for form ${formId}`);
    } catch (error) {
      console.error('Error indexing form responses:', error);
      throw error;
    }
  }
  
  /**
   * Process a single session
   */
  private async processSession(form: FormRecord, session: Record<string, any>): Promise<void> {
    try {
      const supabase = await createClient();
      
      // Get questions for this form
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('id, content, order, form_id, is_starter, created_at')
        .eq('form_id', form.id)
        .order('order', { ascending: true });
      
      if (questionsError) throw new Error(`Error fetching questions: ${questionsError.message}`);
      
      const questions = questionsData as QuestionRecord[];
      
      // Get answers for this session
      const { data: answersData, error: answersError } = await supabase
        .from('answers')
        .select('id, content, question_id, form_id, created_at, session_id')
        .eq('session_id', session.id);
      
      if (answersError) throw new Error(`Error fetching answers: ${answersError.message}`);
      if (!answersData || answersData.length === 0) return;
      
      const answers = answersData as AnswerRecord[];
      
      // Index each Q&A pair individually
      await this.indexQAPairs(form, questions, answers, session.id);
      
      // Also create a session document that contains all Q&A pairs
      await this.indexSessionDocument(form, questions, answers, session.id);
    } catch (error) {
      console.error('Error processing session:', error);
      throw error;
    }
  }
  
  /**
   * Index individual question-answer pairs
   */
  private async indexQAPairs(
    form: FormRecord,
    questions: QuestionRecord[],
    answers: AnswerRecord[],
    sessionId: string
  ): Promise<void> {
    // Create a map of answers by question ID
    const answerMap = new Map<string, string>();
    for (const answer of answers) {
      answerMap.set(answer.question_id, answer.content);
    }
    
    // Process each question-answer pair
    for (const question of questions) {
      const answer = answerMap.get(question.id);
      if (!answer) continue; // Skip if no answer
      
      // Create a document for this Q&A pair
      const content = `Form: ${form.title}\nQuestion: ${question.content}\nAnswer: ${answer}`;
      
      // Generate embedding
      const embedding = await this.generateEmbedding(content);
      
      // Store in database
      await this.storeQAEmbedding(
        form.id,
        question.id,
        answers.find(a => a.question_id === question.id)?.id || '',
        question.content,
        answer,
        embedding,
        sessionId
      );
    }
  }
  
  /**
   * Index a complete session document with all Q&A pairs
   */
  private async indexSessionDocument(
    form: FormRecord,
    questions: QuestionRecord[],
    answers: AnswerRecord[],
    sessionId: string
  ): Promise<void> {
    // Create a map of answers by question ID
    const answerMap = new Map<string, string>();
    for (const answer of answers) {
      answerMap.set(answer.question_id, answer.content);
    }
    
    // Format the document content
    let content = `Form Response (${form.title}, Session ID: ${sessionId})\n\n`;
    
    for (const question of questions) {
      const answer = answerMap.get(question.id);
      if (!answer) continue;
      
      content += `Question: ${question.content}\n`;
      content += `Answer: ${answer}\n\n`;
    }
    
    // Generate embedding
    const embedding = await this.generateEmbedding(content);
    
    // Store in database
    await this.storeSessionEmbedding(
      form.id,
      sessionId,
      content,
      embedding
    );
  }
  
  /**
   * Generate embedding for a text using OpenAI
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float"
      });
      
      const embedding = response.data[0].embedding;
      
      // Log embedding details for debugging
      console.log('Generated embedding type:', typeof embedding);
      console.log('Generated embedding length:', embedding.length);
      
      return embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }
  
  /**
   * Store a QA pair embedding in the database
   */
  async storeQAEmbedding(
    formId: string,
    questionId: string,
    answerId: string,
    questionContent: string,
    answerContent: string,
    embedding: number[],
    sessionId: string
  ): Promise<void> {
    const id = crypto.randomUUID();
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('form_qa_embeddings')
      .upsert({
        id,
        form_id: formId,
        question_id: questionId,
        question: questionContent,
        answer: answerContent,
        embedding,
        session_id: sessionId,
        created_at: new Date().toISOString()
      });
      
    if (error) throw new Error(`Error storing QA embedding: ${error.message}`);
  }
  
  /**
   * Store a session document embedding in the database
   */
  async storeSessionEmbedding(
    formId: string,
    sessionId: string,
    content: string,
    embedding: number[]
  ): Promise<void> {
    const id = crypto.randomUUID();
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('form_session_embeddings')
      .upsert({
        id,
        form_id: formId,
        content,
        embedding,
        session_id: sessionId,
        created_at: new Date().toISOString()
      });
      
    if (error) throw new Error(`Error storing session embedding: ${error.message}`);
  }
  
  /**
   * Search for similar Q&A pairs using vector similarity
   */
  async searchSimilarQAPairs(formId: string, query: string): Promise<any[]> {
    try {
      const supabase = await createClient();
      
      // Generate embedding for the query
      const embedding = await this.generateEmbedding(query);
      
      // Search for similar Q&A pairs
      const { data, error } = await supabase.rpc('match_form_qa', {
        query_embedding: embedding,
        form_id_filter: formId,
        match_threshold: 0.5,
        match_count: 10
      });
      
      if (error) throw new Error(`Error searching similar QA pairs: ${error.message}`);
      
      return data || [];
    } catch (error) {
      console.error('Error searching similar QA pairs:', error);
      throw error;
    }
  }
  
  /**
   * Search for similar sessions using vector similarity
   */
  async searchSimilarSessions(formId: string, query: string): Promise<any[]> {
    try {
      const supabase = await createClient();
      
      // Generate embedding for the query
      const embedding = await this.generateEmbedding(query);
      
      // Search for similar sessions
      const { data, error } = await supabase.rpc('match_form_sessions', {
        query_embedding: embedding,
        form_id_filter: formId,
        match_threshold: 0.5,
        match_count: 5
      });
      
      if (error) throw new Error(`Error searching similar sessions: ${error.message}`);
      
      return data || [];
    } catch (error) {
      console.error('Error searching similar sessions:', error);
      throw error;
    }
  }

  /**
   * Store a QA pair with its vector embedding
   */
  static async storeQAPair(formId: string, question: string, answer: string, embedding: number[]) {
    const supabase = await createClient();

    const { error } = await supabase.from('form_qa_embeddings').insert({
      form_id: formId,
      qa_pair: { question, answer },
      embedding
    });

    if (error) {
      console.error('Error storing vector embedding:', error);
      throw error;
    }
  }

  /**
   * Search for similar QA pairs
   */
  static async searchSimilarQA(formId: string, queryEmbedding: number[], limit = 5) {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('match_form_qa', {
      query_embedding: queryEmbedding,
      form_id_filter: formId,
      match_threshold: 0.5,
      match_count: limit
    });

    if (error) {
      console.error('Error searching vector embeddings:', error);
      throw error;
    }

    return data;
  }

  /**
   * Check if a form has QA embeddings
   */
  static async hasEmbeddings(formId: string): Promise<boolean> {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from('form_qa_embeddings')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', formId);

    if (error) {
      console.error('Error checking embeddings:', error);
      throw error;
    }

    return count !== null && count > 0;
  }
}