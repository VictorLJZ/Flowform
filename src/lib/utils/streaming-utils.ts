/**
 * Utilities for handling streaming responses
 */

import { ReadableStream } from 'stream/web';

/**
 * Function to create a streaming text response
 */
export function createStreamingTextResponse(
  stream: ReadableStream<any>,
  headers?: Record<string, string>
): Response {
  return new Response(stream as any, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      ...headers,
    },
  });
}

/**
 * Helper function to create a streaming JSON response
 */
export function createStreamingJSONResponse(
  stream: ReadableStream<any>,
  headers?: Record<string, string>
): Response {
  return new Response(stream as any, {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

/**
 * Creates a text encoder
 */
export function getTextEncoder(): TextEncoder {
  return new TextEncoder();
}

/**
 * Creates a text decoder
 */
export function getTextDecoder(): TextDecoder {
  return new TextDecoder();
}

/**
 * Creates a Server-Sent Events (SSE) streaming response from a readable stream
 */
export function createSSEResponseFromStream(
  stream: any, // Accept any stream type
  logPrefix = ''
): ReadableStream<Uint8Array> {
  // Convert OpenAI stream to standard ReadableStream if needed
  if (stream.on && typeof stream.on === 'function') {
    // This is an OpenAI Responses API stream
    const encoder = new TextEncoder();
    
    return new ReadableStream({
      async start(controller) {
        stream.on('response.output_text.delta', (delta: { text: string }) => {
          if (logPrefix) console.log(`${logPrefix} Delta:`, delta.text);
          const data = `data: ${JSON.stringify({ text: delta.text })}\n\n`;
          controller.enqueue(encoder.encode(data));
        });
        
        stream.on('end', () => {
          if (logPrefix) console.log(`${logPrefix} Stream ended`);
          const data = `data: [DONE]\n\n`;
          controller.enqueue(encoder.encode(data));
          controller.close();
        });
        
        stream.on('error', (err: Error) => {
          console.error(`${logPrefix} Stream error:`, err);
          controller.error(err);
        });
      }
    });
  }
  
  // If it's already a ReadableStream, return it
  return stream;
}
