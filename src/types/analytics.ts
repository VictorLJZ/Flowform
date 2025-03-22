/**
 * Analytics and RAG-related type definitions
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  formId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  previousResponseId?: string; // For OpenAI Responses API state management
}

export interface RAGResult {
  question: string;
  answer: string;
  respondentId: string;
  sessionId: string;
  similarity: number;
  createdAt: string;
}

export interface FormInsight {
  id: string;
  formId: string;
  title: string;
  description: string;
  createdAt: string;
  source: 'auto' | 'user';
}

export interface ResponseMetric {
  metricType: 'completion_rate' | 'average_time' | 'response_count' | 'question_count';
  value: number;
  formattedValue: string;
  change?: number; // Percentage change compared to previous period
}

export interface AnalyticsTimeframe {
  start: string;
  end: string;
  label: 'today' | 'this_week' | 'this_month' | 'all_time' | 'custom';
}
