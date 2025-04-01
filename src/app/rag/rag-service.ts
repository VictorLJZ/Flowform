import { OpenAI } from 'openai';
import { createClient } from '@/supabase/server';
import { ChatCompletionSystemMessageParam, ChatCompletionAssistantMessageParam, ChatCompletionUserMessageParam } from 'openai/resources/chat';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Add export of RAGService class for backward compatibility
export class RAGService {
  static async generateAnalysisResponse(formId: string, userQuery: string) {
    return generateAnalysisResponse(formId, userQuery);
  }
  
  static async indexFormResponses(formId: string) {
    return indexFormResponses(formId);
  }
  
  static async generateInsights(formId: string) {
    return generateAnalysisResponse(
      formId, 
      "Generate key insights and patterns from all the responses to this form. What are the main trends, common themes, and notable outliers?"
    );
  }
  
  static async processQuery(formId: string, query: string, chatHistory = []) {
    return generateAnalysisResponse(formId, query);
  }
}

export async function generateAnalysisResponse(formId: string, userQuery: string) {
  try {
    const supabase = await createClient();
    
    // Get form details for context
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('title, description, instructions')
      .eq('id', formId)
      .single();
      
    if (formError) throw formError;
    
    // Perform similarity search on the RAG index using the user's query
    const { data: relevantEmbeddings, error: embeddingsError } = await supabase
      .rpc('match_form_qa', {
        query_embedding: await generateEmbedding(userQuery),
        form_id_filter: formId,
        match_threshold: 0.5,
        match_count: 10
      });
      
    if (embeddingsError) throw embeddingsError;
    
    // Extract the relevant QA pairs
    const relevantContext = relevantEmbeddings?.map((item: any) => {
      const qa = item.qa_pair;
      return `Question: ${qa.question}\nAnswer: ${qa.answer}`;
    }).join('\n\n');
    
    // Prepare system prompt with form info and RAG context
    const systemPrompt = `You are an AI assistant helping to analyze responses for a form titled "${form.title}". 
Your task is to provide insightful analysis based on the form responses.

Form description: ${form.description || 'No description provided'}
Form instructions: ${form.instructions || 'No specific instructions provided'}

Here are some relevant question-answer pairs from the form responses:
${relevantContext || 'No relevant responses found'}

Provide a clear, concise, and insightful response to the user's query about this form data.
If the context doesn't contain enough information to answer, acknowledge the limitations of the available data.
Avoid making up information that is not supported by the context.`;

    // Generate the response
    const messages: (ChatCompletionSystemMessageParam | ChatCompletionUserMessageParam | ChatCompletionAssistantMessageParam)[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuery }
    ];
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.7,
      max_tokens: 1000
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating analysis response:', error);
    throw error;
  }
}

async function generateEmbedding(text: string) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

interface QuestionData {
  content: string;
}

interface AnswerData {
  id: string;
  content: string;
  question_id: string;
  questions: {
    content: string;
  };
}

interface SessionData {
  id: string;
  form_id: string;
  answers: AnswerData[];
}

export async function indexFormResponses(formId: string) {
  try {
    const supabase = await createClient();
    
    // Get all QA pairs for this form
    const { data: formSessions, error: sessionsError } = await supabase
      .from('form_sessions')
      .select(`
        id, 
        form_id,
        answers (
          id,
          content,
          question_id,
          questions (
            content
          )
        )
      `)
      .eq('form_id', formId);
    
    if (sessionsError) throw sessionsError;
    
    // Process and store all QA pairs
    let indexedCount = 0;
    
    if (formSessions && Array.isArray(formSessions)) {
      for (const session of formSessions as unknown as SessionData[]) {
        if (session.answers && Array.isArray(session.answers)) {
          for (const answer of session.answers) {
            // Skip if missing data
            if (!answer.content || !answer.questions?.content) continue;
            
            const question = answer.questions.content;
            const answerText = answer.content;
            
            // Generate combined embedding
            const qaText = `Question: ${question} Answer: ${answerText}`;
            const embedding = await generateEmbedding(qaText);
            
            // Store in database
            const { error: insertError } = await supabase
              .from('form_qa_embeddings')
              .insert({
                form_id: formId,
                qa_pair: { question, answer: answerText },
                embedding
              });
              
            if (insertError) {
              console.error('Error storing embedding:', insertError);
              continue;
            }
            
            indexedCount++;
          }
        }
      }
    }
    
    return { indexedCount };
  } catch (error) {
    console.error('Error indexing form responses:', error);
    throw error;
  }
} 