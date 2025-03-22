import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";
import { createSSEResponseFromStream } from "@/lib/utils/streaming-utils";

// Initialize OpenAI client on the server side only
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types that match what the client will send
interface OpenAIRequestBody {
  input: Array<{
    role: 'user' | 'assistant' | 'developer';
    content: string;
    name?: string;
  }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  tools?: Array<any>;
  responseFormat?: any;
  sessionId?: string;
  store?: boolean;
  previous_response_id?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Get the request body
    const body: OpenAIRequestBody = await req.json();
    
    console.log('[SERVER] OpenAI API request received:', { 
      model: body.model,
      inputLength: body.input?.length,
      toolsLength: body.tools?.length
    });
    
    // Extract session information for logging/monitoring
    const { sessionId } = body;
    
    // Validate the session for security (optional, can be expanded)
    // This would check if the session exists and that the user has permissions
    
    // Set up OpenAI request options for the Responses API
    const requestOptions: any = {
      input: body.input, // Client now sends in the correct format
      model: body.model || "gpt-4o-mini", // Default as specified in project memory
      temperature: body.temperature || 0.7,
      store: body.store || false,
      previous_response_id: body.previous_response_id
    };
    
    // Add tools if provided
    if (body.tools && body.tools.length > 0) {
      requestOptions.tools = body.tools;
    }
    
    // Create a streaming response using OpenAI's Responses API
    console.log('[SERVER] Calling OpenAI Responses API with:', {
      model: requestOptions.model,
      inputSample: requestOptions.input?.slice(0, 1), // Log just the first message to avoid cluttering logs
      hasTools: !!requestOptions.tools?.length
    });
    
    const response = await openai.responses.create({
      model: requestOptions.model,
      input: requestOptions.input,
      temperature: requestOptions.temperature,
      tools: requestOptions.tools,
      store: requestOptions.store,
      previous_response_id: requestOptions.previous_response_id,
      stream: true
    });
    
    console.log('[SERVER] OpenAI Responses API stream initiated');
    
    // Create a stream and return it using our centralized utility
    const stream = createSSEResponseFromStream(response, '[SERVER]');
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    console.log('[SERVER] Error details:', {
      message: error.message,
      status: error.status,
      stack: error.stack?.slice(0, 200) // Just the start of the stack
    });
    
    // Return an appropriate error response
    return NextResponse.json(
      { error: error.message || "Error processing your request" },
      { status: error.status || 500 }
    );
  }
}
