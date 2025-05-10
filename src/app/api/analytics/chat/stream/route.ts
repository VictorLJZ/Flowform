import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RagStatus } from '@/types/chat-types';
import { searchSimilarConversations } from '@/services/ai/searchVectorDb';

/**
 * Performs a simple check to see if a query is likely to need RAG
 * This is just a backup check - the actual decision is made by the LLM
 * @param query The user query
 * @returns True if the query might need RAG
 */
function mightNeedRag(query: string): boolean {
  // Convert to lowercase for case-insensitive checks
  const lowerQuery = query.toLowerCase();
  
  // Simple check for common patterns that might need RAG
  const ragKeywords = [
    'response', 'responses', 'submit', 'submitted', 'data',
    'form', 'answers', 'answered', 'results', 'feedback',
    'analysis', 'analyze', 'what did', 'how many', 'patterns',
    'themes', 'common', 'frequent', 'insights', 'statistics',
    'summary', 'summarize', 'tell me about', 'most popular'
  ];
  
  // Detect if the query seems like a normal chat greeting
  const greetingPatterns = [
    'hello', 'hi', 'hey', 'greetings', 'good morning', 
    'good afternoon', 'good evening', 'how are you'
  ];
  
  // Check if query contains any RAG keywords
  const hasRagKeyword = ragKeywords.some(keyword => lowerQuery.includes(keyword));
  
  // Check if query is just a simple greeting (unlikely to need RAG)
  const isJustGreeting = greetingPatterns.some(pattern => 
    lowerQuery.trim() === pattern || 
    lowerQuery.startsWith(pattern + ' ') || 
    lowerQuery.startsWith(pattern + '!')
  );
  
  // If it's just a greeting, don't use RAG
  if (isJustGreeting && !hasRagKeyword) {
    return false;
  }
  
  // Default to true for queries that might need RAG
  return hasRagKeyword || lowerQuery.length > 20;
}

/**
 * Stream handler for analytics chat
 * This endpoint uses Server-Sent Events to stream RAG status updates to the client
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const formId = searchParams.get('formId');
  const query = searchParams.get('query');
  const sessionId = searchParams.get('sessionId');
  const forceRag = searchParams.get('forceRag') === 'true';

  if (!formId || !query) {
    return new Response(
      JSON.stringify({ error: 'Form ID and query are required' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }

  // Do a quick check to see if this query likely needs RAG
  // This is just a backup check since the client should only call this endpoint
  // for queries that actually need RAG
  if (!forceRag && !mightNeedRag(query)) {
    return new Response(
      `data: ${JSON.stringify({ 
        type: 'rag_status', 
        status: { 
          stage: 'complete', 
          query,
          resultsCount: 0,
          timestamp: Date.now()
        } 
      })}\n\n`,
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }

  // Verify authentication
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData?.user) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }

  // Use ReadableStream to create a stream for Server-Sent Events
  const stream = new ReadableStream({
    async start(controller) {
      // Keep track of controller state
      let isClosed = false;
      
      // Helper function to safely send SSE events
      function sendEvent(data: Record<string, unknown>) {
        if (isClosed) {
          console.log("Skipping sendEvent - controller already closed");
          return; // Don't try to send if already closed
        }
        
        try {
          const event = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(new TextEncoder().encode(event));
        } catch (err) {
          console.error('Error sending event:', err);
          isClosed = true; // Mark as closed if sending fails
        }
      }
      
      // Helper function to safely close the controller
      function safeClose() {
        if (!isClosed) {
          try {
            // Mark as closed BEFORE attempting to close to prevent multiple close attempts
            isClosed = true;
            controller.close();
            console.log("Controller closed successfully");
          } catch (err) {
            console.error('Error closing controller:', err);
            // Even if close fails, ensure isClosed remains true
            isClosed = true;
          }
        } else {
          console.log("Skipping safeClose - controller already closed");
        }
      }
      
      // Safely wait without throwing if the controller is closed
      async function safeWait(ms: number) {
        if (isClosed) return; // Don't wait if closed
        try {
          await new Promise(resolve => setTimeout(resolve, ms));
        } catch (err) {
          console.error('Error during wait:', err);
        }
      }

      try {
        // If a session ID is provided, verify it belongs to this user
        if (sessionId) {
          const { data: session, error: sessionError } = await supabase
            .from('chat_sessions')
            .select('id')
            .eq('id', sessionId)
            .eq('user_id', userData.user.id)
            .single();
          
          if (sessionError || !session) {
            sendEvent({ error: 'Session not found or unauthorized' });
            safeClose();
            return;
          }
        }

        // Send initial RAG status - searching phase
        if (isClosed) return; // Early exit if closed
        
        const initialStatus: RagStatus = {
          stage: 'searching',
          query,
          timestamp: Date.now()
        };
        sendEvent({ type: 'rag_status', status: initialStatus });

        // Add a short delay to ensure the initialStatus is received
        await safeWait(100);
        if (isClosed) return; // Early exit if closed

        // Add a timeout to automatically close the stream after a maximum duration
        // This prevents hanging connections
        const maxStreamTimeout = setTimeout(() => {
          if (!isClosed) {
            console.log("Closing stream due to timeout");
            sendEvent({ 
              type: 'rag_status', 
              status: {
                stage: 'complete',
                query: query,
                timestamp: Date.now()
              } 
            });
            safeClose();
          }
        }, 30000); // 30 seconds maximum connection time

        try {
          // Actually perform the search - this connects to the real RAG system
          // Start the search process
          const maxResults = 5; // Default number of results
          const startTime = Date.now();
          
          // This could take time, send an interim update as well
          if (!isClosed) { // Check before sending
            sendEvent({ type: 'rag_status', status: {
              stage: 'searching',
              query,
              timestamp: Date.now() + 100
            }});
          }
          
          const conversations = await searchSimilarConversations(query, formId, maxResults);
          
          if (isClosed) return; // Exit if already closed
          
          const resultsCount = conversations?.length || 0;
          
          // Send processing status with the real result count
          if (!isClosed) { // Check before sending
            const processingStatus: RagStatus = {
              stage: 'processing',
              query,
              resultsCount,
              timestamp: Date.now()
            };
            sendEvent({ type: 'rag_status', status: processingStatus });
            
            // Add another processing event with slight delay to ensure it's received
            await safeWait(200);
            
            if (!isClosed) { // Check before sending
              sendEvent({ type: 'rag_status', status: {
                ...processingStatus,
                timestamp: Date.now()
              }});
            }
          }
          
          // Short delay to show processing status before completion
          await safeWait(600);
          
          if (isClosed) return; // Exit if already closed
          
          // Clear the timeout since we're closing properly
          clearTimeout(maxStreamTimeout);
          
          if (isClosed) {
            console.log("Stream already closed, skipping final events");
            return;
          }
          
          // Send completion status
          const completeStatus: RagStatus = {
            stage: 'complete',
            query,
            resultsCount,
            timestamp: Date.now()
          };
          sendEvent({ type: 'rag_status', status: completeStatus });
          
          // Send an event with the total time taken
          if (!isClosed) {
            sendEvent({ 
              type: 'rag_metrics', 
              metrics: {
                totalTime: Date.now() - startTime,
                resultsCount
              }
            });
          }
          
          // Add a small delay before closing to ensure client receives the events
          await safeWait(100);
          
          // Close the stream after sending all events
          safeClose();
          
        } catch (searchError) {
          clearTimeout(maxStreamTimeout);
          
          if (!isClosed) {
            console.error('Error in RAG search:', searchError);
            sendEvent({ 
              type: 'rag_error', 
              error: 'Error searching form responses' 
            });
            await safeWait(100);
            safeClose();
          }
        }

      } catch (error) {
        if (!isClosed) {
          console.error('Error in stream handler:', error);
          sendEvent({ error: 'Internal server error' });
          await safeWait(100);
          safeClose();
        }
      }
    }
  });

  // Return the stream with appropriate headers for SSE
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
} 