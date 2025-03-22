export interface FormRecord {
  id: string;
  title: string;
  description?: string;
  instructions: string;
  max_questions: number;
  temperature: number;
  created_at: string;
  updated_at: string;
  user_id?: string;
  status: 'draft' | 'active' | 'archived';
}

export interface QuestionRecord {
  id: string;
  form_id: string;
  content: string;
  order: number;
  is_starter: boolean;
  created_at: string;
}

export interface AnswerRecord {
  id: string;
  form_id: string;
  question_id: string;
  content: string;
  created_at: string;
  session_id: string;
}

export interface FormSession {
  id: string;
  form_id: string;
  current_question_index: number;
  created_at: string;
  updated_at: string;
  completed: boolean;
  user_id?: string;
} 