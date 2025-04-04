// Add OpenAI shim for Node.js environment
import 'openai/shims/node';

import OpenAI from 'openai';
import { 
  DynamicBlock, 
  DynamicBlockQuestion, 
  DynamicBlockAnswer 
} from '@/types/form-types';
import { buildGenerationContext } from './utils/prompt-templates';

/**
 * Service for generating dynamic questions using AI
 */
export class AIService {
  private openai: OpenAI;
  
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY environment variable is not set');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  /**
   * Generate the next question for a dynamic block
   * @param block The dynamic block configuration
   * @param formQuestions All questions in the form (to avoid duplication)
   * @param blockQuestions Previous questions in this dynamic block
   * @param blockAnswers Previous answers in this dynamic block
   * @param currentQuestionIndex Current question index in the block
   * @returns The generated question text
   */
  async generateDynamicBlockQuestion(
    block: DynamicBlock,
    formQuestions: {
      staticQuestions: string[];
      dynamicBlockSeeds: string[];
    },
    blockQuestions: string[],
    blockAnswers: string[],
    currentQuestionIndex: number
  ): Promise<string> {
    try {
      // Build the prompt with all context
      const prompt = buildGenerationContext(
        block,
        formQuestions,
        blockQuestions,
        blockAnswers,
        currentQuestionIndex
      );
      
      // Call OpenAI using the Responses API
      console.log("Using OpenAI Responses API with model: gpt-4o-mini");
      const response = await this.openai.responses.create({
        model: "gpt-4o-mini",
        input: [
          { 
            role: "developer", 
            content: "You are a form question generator that creates thoughtful follow-up questions. Respond with ONLY the question text." 
          },
          { role: "user", content: prompt }
        ],
        max_output_tokens: 250,
        temperature: block.temperature,
        store: false // Don't store this interaction on OpenAI's servers
      });
      
      // Extract and clean the generated question
      const generatedQuestion = response.output_text?.trim() || this.createFallbackQuestion(currentQuestionIndex, block.numFollowUpQuestions);
      
      return generatedQuestion;
    } catch (error) {
      console.error("Error generating dynamic block question:", error);
      return this.createFallbackQuestion(currentQuestionIndex, block.numFollowUpQuestions);
    }
  }
  
  /**
   * Create a fallback question in case AI generation fails
   */
  private createFallbackQuestion(currentIndex: number, totalQuestions: number): string {
    if (currentIndex >= totalQuestions - 1) {
      return "Would you like to add any final thoughts on this topic?";
    } else {
      return "Could you please tell me more about that?";
    }
  }
  
  /**
   * Generate all questions for a dynamic block at once (for testing/preview)
   * This would typically not be used in production as questions are generated one at a time based on answers
   */
  async previewDynamicBlockQuestions(
    block: DynamicBlock,
    formQuestions: {
      staticQuestions: string[];
      dynamicBlockSeeds: string[];
    }
  ): Promise<string[]> {
    try {
      const previewPrompt = `
You are an intelligent form question generator.

FORM CONTEXT:
${block.customPrompt || 'Generate engaging follow-up questions related to the seed question.'}

SEED QUESTION:
${block.seedQuestion}

EXISTING QUESTIONS IN THE FORM:
${formQuestions.staticQuestions.map((q, i) => `${i+1}. ${q}`).join('\n')}
${formQuestions.dynamicBlockSeeds.map((q, i) => `${i+1}. ${q}`).join('\n')}

TASK:
Generate ${block.numFollowUpQuestions} unique follow-up questions that:
1. Build upon the seed question
2. Don't duplicate any existing questions in the form
3. Create a natural conversation flow
4. Are engaging and encourage detailed responses

Format your response as a JSON array of strings containing ONLY the questions:
[
  "First follow-up question here",
  "Second follow-up question here",
  ...
]
`;

      // Call OpenAI with instructions to return JSON
      const response = await this.openai.responses.create({
        model: "gpt-4o-mini",
        input: [
          { role: "developer", content: "You are a form question generator that creates JSON-formatted responses. Respond with a valid JSON object with a 'questions' array." },
          { role: "user", content: previewPrompt }
        ],
        max_output_tokens: 1000,
        temperature: block.temperature,
        store: false
      });
      
      try {
        // Parse the JSON response
        const content = response.output_text || '{"questions":[]}';
        // Try parsing the response as an object with a 'questions' array or as a direct array
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(content);
        } catch (jsonError) {
          // If direct parsing fails, try to extract JSON from text
          const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
          if (jsonMatch) {
            parsedResponse = JSON.parse(jsonMatch[0]);
          } else {
            throw jsonError;
          }
        }
        
        const questions = Array.isArray(parsedResponse.questions) 
          ? parsedResponse.questions 
          : (Array.isArray(parsedResponse) ? parsedResponse : []);
          
        // Ensure we have the right number of questions
        while (questions.length < block.numFollowUpQuestions) {
          questions.push(`Follow-up question ${questions.length + 1}`);
        }
        
        return questions.slice(0, block.numFollowUpQuestions);
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        // Generate fallback questions
        return Array(block.numFollowUpQuestions).fill(0).map((_, i) => 
          `Follow-up question ${i + 1}`
        );
      }
    } catch (error) {
      console.error("Error generating preview questions:", error);
      return Array(block.numFollowUpQuestions).fill(0).map((_, i) => 
        `Follow-up question ${i + 1}`
      );
    }
  }
}
