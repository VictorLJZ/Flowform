// Form configuration types
export interface FormGenerationConfig {
  starterQuestion: string;
  instructions: string;
  temperature: number;
  maxQuestions: number;
}

// Conversation context types
export interface ConversationContext {
  questions: string[];
  answers: string[];
  currentQuestionIndex: number;
}

// Question generation result
export interface QuestionGenerationResult {
  question: string;
  isLastQuestion: boolean;
  reasoning?: string;  // Optional explanation of why this question was generated
} 