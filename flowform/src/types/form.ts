/**
 * Form-related type definitions
 */

export interface FormConfig {
  id?: string;
  userId: string;
  title: string;
  starterQuestion: string;
  instructions: string;
  temperature: number;
  maxQuestions: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormStats {
  totalResponses: number;
  averageQuestions: number;
  completionRate: number;
}

export interface FormResponse {
  id: string;
  formId: string;
  sessionId: string;
  createdAt: string;
  completedAt: string | null;
  interactions: Interaction[];
}

export interface Interaction {
  id?: string;
  respondentId: string;
  question: string;
  answer: string | null;
  questionIndex: number;
  vectorEmbedding?: number[] | null;
  createdAt?: string;
}

export interface FormSession {
  respondentId: string;
  sessionId: string;
  formId: string;
  currentQuestion: string;
  previousQuestions: string[];
  previousAnswers: string[];
  questionIndex: number;
  isComplete: boolean;
}

export interface FormSubmission {
  formId: string;
  sessionId: string;
  answer: string;
}
