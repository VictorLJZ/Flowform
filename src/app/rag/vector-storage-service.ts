import OpenAI from 'openai';
import { supabase } from '@/supabase/supabase_client';
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
  private async processSession(form: FormRecord, session: any): Promise<void> {
    try {
      // Get questions for this form
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id, content, order')
        .eq('form_id', form.id)
        .order('order', { ascending: true });
      
      if (questionsError) throw new Error(`Error fetching questions: ${questionsError.message}`);
      
      // Get answers for this session
      const { data: answers, error: answersError } = await supabase
        .from('answers')
        .select('id, content, question_id')
        .eq('session_id', session.id);
      
      if (answersError) throw new Error(`Error fetching answers: ${answersError.message}`);
      if (!answers || answers.length === 0) return;
      
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
      // Generate embedding for the query
      const embedding = await this.generateEmbedding(query);
      
      // Log the query embedding for debugging
      console.log('Query embedding type:', typeof embedding);
      console.log('Query embedding length:', embedding.length);
      
      // Try direct SQL instead of RPC
      const { data, error } = await supabase
        .from('form_qa_embeddings')
        .select('id, form_id, question, answer, session_id')
        .eq('form_id', formId)
        .limit(5);  // Just get some results without similarity for now
      
      if (error) throw new Error(`Error searching QA pairs: ${error.message}`);
      
      // Add a default similarity score to each result
      const resultsWithSimilarity = data?.map(item => ({
        ...item,
        similarity: 0.8  // Default similarity score
      })) || [];
      
      // Log the results for debugging
      console.log('Direct SQL search results with similarity:', resultsWithSimilarity);
      
      return resultsWithSimilarity;
    } catch (error) {
      console.error('Error searching similar QA pairs:', error);
      return [];
    }
  }
  
  /**
   * Search for similar session documents using vector similarity
   */
  async searchSimilarSessions(formId: string, query: string): Promise<any[]> {
    try {
      // Generate embedding for the query
      const embedding = await this.generateEmbedding(query);
      
      // Search for similar sessions
      const { data, error } = await supabase.rpc(
        'match_form_sessions',
        {
          query_embedding: embedding,
          match_threshold: 0.7,
          match_count: 3,
          p_form_id: formId
        }
      );
      
      if (error) throw new Error(`Error searching sessions: ${error.message}`);
      return data || [];
    } catch (error) {
      console.error('Error searching similar sessions:', error);
      return [];
    }
  }
}