/**
 * Mapping utilities for dynamic block settings
 * Maps frontend field names to database field names and vice versa
 */
import { DbDynamicBlockConfig } from '@/types/block/DbBlock';

// Frontend form builder settings interface
export interface FormBuilderDynamicSettings {
  startingPrompt?: string;
  temperature?: number;
  maxQuestions?: number;
  contextInstructions?: string | null;
}

// Using DynamicBlockConfig from supabase-types.ts

// Type for partial DbDynamicBlockConfig since we can't always provide all fields
export type DynamicBlockConfigInput = Pick<DbDynamicBlockConfig, 
  'starter_question' | 
  'temperature' | 
  'max_questions' | 
  'ai_instructions'
>;

// Map frontend form builder settings to database dynamic block config
export function mapToDynamicBlockConfig(settings: FormBuilderDynamicSettings): DynamicBlockConfigInput {
  return {
    starter_question: settings.startingPrompt || "How can I help you today?",
    temperature: settings.temperature !== undefined ? settings.temperature : 0.7,
    max_questions: settings.maxQuestions || 5,
    ai_instructions: settings.contextInstructions || null
  };
}

// Map database dynamic block config to frontend form builder settings
export function mapToFormBuilderSettings(config: DbDynamicBlockConfig): FormBuilderDynamicSettings {
  return {
    startingPrompt: config.starter_question,
    temperature: config.temperature,
    maxQuestions: config.max_questions,
    contextInstructions: config.ai_instructions || ""
  };
}
