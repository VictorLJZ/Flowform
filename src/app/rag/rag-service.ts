import OpenAI from 'openai';
import { VectorStorageService } from './vector-storage-service';
import { supabase } from '@/supabase/supabase_client';

export class RAGService {
  private openai: OpenAI;
  private vectorStorage: VectorStorageService;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.vectorStorage = new VectorStorageService();
  }
  
  /**
   * Process a user query using RAG
   */
  async processQuery(formId: string, query: string, chatHistory: Array<{role: string, content: string}> = []): Promise<string> {
    try {
      console.log(`Processing query for form ${formId}: "${query}"`);
      
      // Get form details for context
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();
        
      if (formError) throw new Error(`Form not found: ${formError.message}`);
      
      // Check if there are any embeddings
      const hasEmbeddings = await this.checkEmbeddings(formId);
      if (!hasEmbeddings) {
        console.log('No embeddings found for this form');
        return "No form responses have been indexed yet. Please index the responses first.";
      }
      
      // Retrieve relevant Q&A pairs
      console.log('Searching for similar QA pairs...');
      const relevantQAPairs = await this.vectorStorage.searchSimilarQAPairs(formId, query);
      console.log(`Found ${relevantQAPairs.length} relevant QA pairs`);
      
      // Retrieve relevant session documents
      console.log('Searching for similar sessions...');
      const relevantSessions = await this.vectorStorage.searchSimilarSessions(formId, query);
      console.log(`Found ${relevantSessions.length} relevant sessions`);
      
      if (relevantQAPairs.length === 0 && relevantSessions.length === 0) {
        return "There are no relevant question-answer pairs found in the form responses, so the most common answer cannot be determined.";
      }
      
      // Format the context from retrieved data
      const context = this.formatContext(relevantQAPairs, relevantSessions, form.title);
      
      // Prepare the input messages
      const messages = [
        { 
          role: "developer", 
          content: `You are an AI assistant that helps analyze form responses. You'll be given form responses and a user query. Answer the query based only on the provided form responses. If the answer cannot be determined from the responses, say so clearly. Be concise but thorough.`
        },
        { 
          role: "user", 
          content: `Form: ${form.title}\n\nContext from form responses:\n${context}\n\nUser query: ${query}`
        }
      ];
      
      // Add chat history if available
      if (chatHistory.length > 0) {
        messages.splice(1, 0, ...chatHistory);
      }
      
      // Generate answer using OpenAI
      const response = await this.openai.responses.create({
        model: "gpt-4o-mini",
        input: messages,
        temperature: 0.7,
        store: false
      });
      
      return response.output_text || "I couldn't generate an answer based on the available responses.";
    } catch (error) {
      console.error('Error processing RAG query:', error);
      throw error;
    }
  }
  
  /**
   * Format the context from retrieved data
   */
  private formatContext(qaPairs: any[], sessions: any[], formTitle: string): string {
    let context = '';
    
    // Add QA pairs to context
    if (qaPairs && qaPairs.length > 0) {
      context += "Relevant question-answer pairs:\n\n";
      qaPairs.forEach((pair, index) => {
        context += `${index + 1}. Question: ${pair.question}\n`;
        context += `   Answer: ${pair.answer}\n`;
        
        // Check if similarity exists before trying to use it
        if (pair.similarity !== undefined) {
          context += `   (Similarity: ${pair.similarity.toFixed(2)})\n\n`;
        } else {
          context += '\n';
        }
      });
    } else {
      context += "No relevant question-answer pairs found.\n\n";
    }
    
    // Add session documents to context
    if (sessions && sessions.length > 0) {
      context += "Relevant session documents:\n\n";
      sessions.forEach((session, index) => {
        context += `${index + 1}. ${session.content}\n`;
        
        // Check if similarity exists before trying to use it
        if (session.similarity !== undefined) {
          context += `   (Similarity: ${session.similarity.toFixed(2)})\n\n`;
        } else {
          context += '\n';
        }
      });
    } else {
      context += "No relevant session documents found.\n\n";
    }
    
    return context;
  }
  
  /**
   * Generate insights about form responses
   */
  async generateInsights(formId: string): Promise<string> {
    try {
      // Get form details
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();
        
      if (formError) throw new Error(`Form not found: ${formError.message}`);
      
      // Get all sessions for this form
      const { data: sessions, error: sessionsError } = await supabase
        .from('form_sessions')
        .select('*')
        .eq('form_id', formId);
      
      if (sessionsError) throw new Error(`Error fetching sessions: ${sessionsError.message}`);
      if (!sessions || sessions.length === 0) return "No responses available for analysis.";
      
      // Get a sample of session documents (limit to 10 for performance)
      const { data: sessionDocs, error: docsError } = await supabase
        .from('form_session_embeddings')
        .select('content')
        .eq('form_id', formId)
        .limit(10);
        
      if (docsError) throw new Error(`Error fetching session documents: ${docsError.message}`);
      
      // Combine all session documents
      const allResponses = sessionDocs.map(doc => doc.content).join('\n\n---\n\n');
      
      // Generate insights using OpenAI
      const response = await this.openai.responses.create({
        model: "gpt-4o-mini",
        input: [
          { 
            role: "developer", 
            content: `You are an AI assistant that analyzes form responses. Generate key insights, patterns, and trends from the provided form responses. Be concise but thorough.`
          },
          { 
            role: "user", 
            content: `Form: ${form.title}\n\nResponses:\n${allResponses}\n\nPlease analyze these responses and provide key insights, common themes, and notable patterns. Format your response with clear headings and bullet points.`
          }
        ],
        temperature: 0.7,
        store: false
      });
      
      return response.output_text || "I couldn't generate insights based on the available responses.";
    } catch (error) {
      console.error('Error generating insights:', error);
      throw error;
    }
  }
  
  /**
   * Index all responses for a form
   */
  async indexFormResponses(formId: string): Promise<void> {
    return this.vectorStorage.indexFormResponses(formId);
  }
  
  async checkEmbeddings(formId: string): Promise<boolean> {
    try {
      // Check if there are any QA embeddings for this form
      const { count: qaCount, error: qaError } = await supabase
        .from('form_qa_embeddings')
        .select('id', { count: 'exact', head: true })
        .eq('form_id', formId);
        
      if (qaError) throw new Error(`Error checking QA embeddings: ${qaError.message}`);
      
      // Check if there are any session embeddings for this form
      const { count: sessionCount, error: sessionError } = await supabase
        .from('form_session_embeddings')
        .select('id', { count: 'exact', head: true })
        .eq('form_id', formId);
        
      if (sessionError) throw new Error(`Error checking session embeddings: ${sessionError.message}`);
      
      console.log(`Found ${qaCount} QA embeddings and ${sessionCount} session embeddings for form ${formId}`);
      
      return (qaCount > 0 || sessionCount > 0);
    } catch (error) {
      console.error('Error checking embeddings:', error);
      return false;
    }
  }
} 