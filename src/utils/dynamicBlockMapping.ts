/**
 * Mapping utilities for dynamic block settings
 * Maps frontend field names to database field names and vice versa
 */
import { DynamicBlockConfig } from '@/types/supabase-types';

// Frontend form builder settings interface
export interface FormBuilderDynamicSettings {
  startingPrompt?: string;
  temperature?: number;
  maxQuestions?: number;
  contextInstructions?: string | null;
}

// Using DynamicBlockConfig from supabase-types.ts

// Type for partial DynamicBlockConfig since we can't always provide all fields
export type DynamicBlockConfigInput = Pick<DynamicBlockConfig, 
  'starter_question' | 
  'temperature' | 
  'max_questions' | 
  'ai_instructions'
>;

// Map frontend form builder settings to database dynamic block config
export function mapToDynamicBlockConfig(settings: FormBuilderDynamicSettings): DynamicBlockConfigInput {
  return {
    starter_type: "question", content: settings.startingPrompt || "How can I help you today?",
    temperature: settings.temperature !== undefined ? settings.temperature : 0.7,
    max_questions: settings.maxQuestions || 5,
    ai_instructions: settings.contextInstructions || null
  };
}

// Map database dynamic block config to frontend form builder settings
export function mapToFormBuilderSettings(config: DynamicBlockConfig): FormBuilderDynamicSettings {
  return {
    startingPrompt: config.starterQuestion,
    temperature: config.temperature,
    maxQuestions: config.max_questions,
    contextInstructions: config.ai_instructions || ""
  };
}
