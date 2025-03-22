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
  stream: ReadableStream<any>,
  headers?: Record<string, string>
): Response {
  return new Response(stream as any, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      ...headers,
    },
  });
}
