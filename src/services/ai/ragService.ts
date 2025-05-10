import { createClient } from '@/lib/supabase/client';
import { searchSimilarConversations, ConversationResult } from './searchVectorDb';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize Google AI client
const googleApiKey = process.env.GEMINI_API_KEY;
let geminiModel: any = null;

if (googleApiKey) {
  try {
    const googleAI = new GoogleGenerativeAI(googleApiKey);
    geminiModel = googleAI.getGenerativeModel({ 
      model: "gemini-2.5-pro-exp-03-25",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        }
      ],
    });
    console.log('[Gemini] Model initialized successfully');
  } catch (error) {
    console.error('[Gemini] Error initializing client:', error);
  }
}

/**
 * RAG System Prompt template for analytics insights
 */
const RAG_SYSTEM_PROMPT = `
You are an analytics assistant for form creators using Flowform. Your task is to help form owners understand patterns in their form responses.

You have access to a tool called 'search_form_responses' that can search for relevant form response data. This tool is REQUIRED when answering questions about specific form responses or patterns in the data.

WHEN TO USE THE SEARCH TOOL:
- ALWAYS use the tool for questions about form response content, patterns, statistics, or insights
- ALWAYS use the tool when asked about user submissions, feedback, or form data
- ALWAYS use the tool for questions containing keywords about "responses", "submissions", "results", "feedback", or "data"

WHEN NOT TO USE THE SEARCH TOOL:
- General greetings ("hello", "hi")
- Questions about how to use the chat interface
- Questions about Flowform features unrelated to submitted responses
- Clarification questions about your previous answers

When using the search tool:
1. Create a specific, focused query related to the user's question
2. Request an appropriate number of results based on query complexity (3-5 for most queries)
3. Use the retrieved information to provide insights about:
   - Common themes and patterns in the responses
   - Unusual or standout responses
   - Quantitative insights when possible
   - Actionable suggestions for the form creator

If the retrieved information doesn't address the user's question, acknowledge this and explain what information is missing.
`;

/**
 * Definition for the search_form_responses function tool
 */
const searchFormResponsesFunctionDeclaration = {
  name: 'search_form_responses',
  description: 'Searches form responses to find relevant information for answering user queries about form data. Only use this when you need specific information from form submissions.',
  parameters: {
    type: 'OBJECT',
    properties: {
      query: {
        type: 'STRING',
        description: 'The search query to find relevant form responses. Make this specific and focused on information you need.'
      },
      maxResults: {
        type: 'INTEGER',
        description: 'Maximum number of relevant results to return (1-10). Default is 5 if not specified.'
      }
    },
    required: ['query']
  }
};

/**
 * Format retrieved conversations into a context string for the LLM
 */
function formatContextFromConversations(conversations: ConversationResult[]): string {
  return conversations.map((conversation, index) => {
    return `[Conversation ${index + 1} (Relevance: ${Math.round(conversation.similarity * 100)}%)]\n${conversation.conversation_text}`;
  }).join('\n\n');
}

/**
 * Implementation of the search_form_responses function
 */
async function searchFormResponses(
  query: string,
  formId: string,
  maxResults: number = 5
): Promise<string> {
  console.log(`[RAG] Searching form responses: "${query}", formId: ${formId}, maxResults: ${maxResults}`);
  
  // Ensure maxResults is within reasonable bounds
  maxResults = Math.max(1, Math.min(maxResults, 10));
  
  try {
    const conversations = await searchSimilarConversations(query, formId, maxResults);
    
    if (!conversations || conversations.length === 0) {
      console.log(`[RAG] No conversations found for query: "${query}"`);
      return "No relevant form responses found. This might be because there aren't enough responses yet, or the responses don't contain information related to your query.";
    }
    
    console.log(`[RAG] Found ${conversations.length} conversations`);
    
    return formatContextFromConversations(conversations);
  } catch (error) {
    console.error(`[RAG] Error in searchFormResponses:`, error);
    return `Error searching form responses: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

/**
 * Response type for the RAG response
 */
export interface RAGResponseWithState {
  text: string;
  id?: string;
}

/**
 * Extract text from a Gemini response, handling various response formats
 */
function extractResponseText(response: any): string {
  if (!response) {
    console.error('[Gemini] Empty response received');
    return "";
  }
  
  try {
    // Case 1: Direct text property is a function (common in newer Gemini SDK)
    if (response.text && typeof response.text === 'function') {
      try {
        const text = response.text();
        if (text && typeof text === 'string') {
          return text;
        }
      } catch (textFuncError) {
        console.error('[Gemini] Error calling text() function:', textFuncError);
      }
    }
    
    // Case 2: Response has nested structure with candidates (newer Gemini API)
    if (response.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return response.response.candidates[0].content.parts[0].text;
    }
    
    // Case 3: Response has direct candidates array
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content?.parts?.[0]?.text) {
        return candidate.content.parts[0].text;
      }
    }
    
    // Case 4: Response text is a direct string property
    if (response.text && typeof response.text === 'string') {
      return response.text;
    }
    
    // Case 5: Parts array direct access
    if (response.parts && response.parts.length > 0 && response.parts[0].text) {
      return response.parts[0].text;
    }
    
    console.error('[Gemini] Failed to extract text from response');
    return "";
  } catch (error) {
    console.error('[Gemini] Error extracting text from response:', error);
    return "";
  }
}

/**
 * Generate chat response using the tool-based RAG approach with Gemini
 */
export async function generateRagResponse(
  query: string,
  formId: string,
  previousMessages: Array<{ role: string, content: string }> = [],
  previousResponseId?: string
): Promise<RAGResponseWithState> {
  console.log(`[Gemini] Generate RAG response: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`);
  
  if (!geminiModel) {
    console.error('[Gemini] Error: Gemini model not initialized');
    return { text: "Sorry, the AI assistant is currently unavailable. Please try again later." };
  }
  
  try {
    // Format the conversation history for Gemini
    const chatHistory = previousMessages.map(msg => {
      let role = msg.role;
      // Map roles from OpenAI format to Gemini format
      if (role === 'assistant') role = 'model';
      else if (role === 'system') role = 'user'; // System prompts are sent as user messages in Gemini
      
      return {
        role: role,
        parts: [{ text: msg.content }]
      };
    });
    
    // Add system prompt as the first user message if not already present
    if (chatHistory.length === 0 || 
        !chatHistory.some(msg => msg.parts[0].text.includes("You are an analytics assistant"))) {
      console.log('[Gemini] Adding system prompt to chat history');
      chatHistory.unshift({
        role: 'user',
        parts: [{ text: RAG_SYSTEM_PROMPT }]
      });
      chatHistory.push({
        role: 'model',
        parts: [{ text: "I'll help you analyze form responses by searching for relevant data when needed." }]
      });
    }
    
    // Create a chat session with the prepared history
    const chat = geminiModel.startChat({
      history: chatHistory,
      generationConfig: { 
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024
      },
      tools: [{
        functionDeclarations: [searchFormResponsesFunctionDeclaration]
      }]
    });
    
    // Send the user query
    const response = await chat.sendMessage(query);
    console.log('[Gemini] Response received');

    try {
      // Check for function calls in the response
      let functionCall = null;
      
      // Case 1: New nested structure in response.response.candidates[0].content.parts[0].functionCall
      if (response.response?.candidates?.[0]?.content?.parts?.[0]?.functionCall) {
        functionCall = response.response.candidates[0].content.parts[0].functionCall;
        console.log('[Gemini] Function call detected:', functionCall.name);
      } 
      // Case 2: Direct functionCalls array property
      else if (response.functionCalls && response.functionCalls.length > 0) {
        functionCall = response.functionCalls[0];
        console.log('[Gemini] Function call detected:', functionCall.name);
      }
      
      // Process function call if found
      if (functionCall && functionCall.name === 'search_form_responses') {
        // Extract tool call arguments
        const searchQuery = functionCall.args?.query;
        const maxResults = functionCall.args?.maxResults || 5;
        
        if (!searchQuery) {
          console.error('[Gemini] Missing query in function call args');
          return { text: "I couldn't understand what information to search for. Could you please provide more details about what you'd like to know about the form responses?" };
        }
        
        // Execute the form search function
        const searchResult = await searchFormResponses(searchQuery, formId, maxResults);
        
        // Prepare the function response
        const functionResponse = { context: searchResult };
        
        try {
          // Send the search results back to the model to generate the final response
          // Important: Send as an array to match the expected format
          const finalResponse = await chat.sendMessage([
            {
              functionResponse: {
                name: functionCall.name,
                response: functionResponse
              }
            }
          ]);
          
          console.log('[Gemini] Final response received after function call');
          
          // Extract the text from the final response
          const responseText = extractResponseText(finalResponse);
          
          if (!responseText) {
            console.error('[Gemini] Failed to extract text from final response');
            return {
              text: "I found some information in the form responses, but had trouble generating a complete answer. Here's what I found:\n\n" +
                   searchResult.substring(0, 800) + (searchResult.length > 800 ? "..." : "")
            };
          }
          
          return { text: responseText };
        } catch (functionCallError) {
          console.error('[Gemini] Error sending function response:', functionCallError);
          
          // Fallback: Send a regular message with the search results directly
          console.log('[Gemini] Attempting fallback with direct message');
          try {
            const fallbackResponse = await chat.sendMessage(
              `Here are the relevant form responses I found:\n\n${searchResult}\n\nBased on these responses, please answer the user's query.`
            );
            
            const fallbackText = extractResponseText(fallbackResponse);
            return {
              text: fallbackText || `I found some information in form responses but couldn't process it properly. Here's what I found: ${searchResult.substring(0, 800)}...`
            };
          } catch (fallbackError) {
            console.error('[Gemini] Fallback response also failed');
            return {
              text: `I found some relevant information but couldn't generate a complete answer. Here's what I found: ${searchResult.substring(0, 800)}...`
            };
          }
        }
      }
      
      // No function call detected, extract and return the direct response
      console.log('[Gemini] No function call detected, returning direct response');
      const directResponseText = extractResponseText(response);
      
      if (!directResponseText) {
        console.error('[Gemini] Failed to extract text from direct response');
        return {
          text: "I'm having trouble generating a proper response. Could you try rephrasing your question or asking something more specific about the form responses?"
        };
      }
      
      return { text: directResponseText };
    } catch (extractionError) {
      console.error('[Gemini] Error in response processing:', extractionError);
      return {
        text: "I'm having trouble processing your request due to a technical issue. Please try again with a different question."
      };
    }
  } catch (error) {
    console.error('[Gemini] Error generating RAG response:', error);
    return {
      text: "I'm sorry, there was an error generating a response. Please try again."
    };
  }
}

/**
 * Create a new chat session for a form
 * 
 * @param formId Form ID
 * @param userId User ID
 * @returns The created session ID
 */
export async function createChatSession(
  formId: string,
  userId: string
): Promise<string> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        form_id: formId,
        user_id: userId
      })
      .select('id')
      .single();
      
    if (error) {
      console.error('[Supabase] Error creating chat session:', error);
      throw error;
    }
    
    return data.id;
  } catch (error) {
    console.error('[Supabase] Failed to create chat session:', error);
    throw new Error('Failed to create chat session');
  }
}

/**
 * Save a chat message to the database
 * 
 * @param sessionId Chat session ID
 * @param role Message role (user/assistant)
 * @param content Message content
 * @returns The created message ID
 */
export async function saveChatMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<string> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role,
        content
      })
      .select('id')
      .single();
      
    if (error) {
      console.error('[Supabase] Error saving chat message:', error);
      throw error;
    }
    
    return data.id;
  } catch (error) {
    console.error('[Supabase] Failed to save chat message:', error);
    throw new Error('Failed to save chat message');
  }
}

/**
 * Get messages for a chat session
 * 
 * @param sessionId Chat session ID
 * @returns Array of chat messages
 */
export async function getChatMessages(sessionId: string): Promise<Array<{
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}>> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('[Supabase] Error fetching chat messages:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('[Supabase] Failed to fetch chat messages:', error);
    throw new Error('Failed to fetch chat messages');
  }
} 