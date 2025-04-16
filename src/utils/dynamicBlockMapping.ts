/**
 * Mapping utilities for dynamic block settings
 * Maps frontend field names to database field names and vice versa
 */

// Frontend form builder settings interface
export interface FormBuilderDynamicSettings {
  startingPrompt?: string;
  temperature?: number;
  maxQuestions?: number;
  contextInstructions?: string | null;
}

// Database representation interface
export interface DynamicBlockConfig {
  starter_question: string;
  temperature: number;
  max_questions: number;
  ai_instructions: string | null;
}

// Map frontend form builder settings to database dynamic block config
export function mapToDynamicBlockConfig(settings: FormBuilderDynamicSettings): DynamicBlockConfig {
  return {
    starter_question: settings.startingPrompt || "How can I help you today?",
    temperature: settings.temperature !== undefined ? settings.temperature : 0.7,
    max_questions: settings.maxQuestions || 5,
    ai_instructions: settings.contextInstructions || null
  };
}

// Map database dynamic block config to frontend form builder settings
export function mapToFormBuilderSettings(config: DynamicBlockConfig): FormBuilderDynamicSettings {
  return {
    startingPrompt: config.starter_question,
    temperature: config.temperature,
    maxQuestions: config.max_questions,
    contextInstructions: config.ai_instructions || ""
  };
}
