import OpenAI from 'openai';
import { FormRecord, QuestionRecord, AnswerRecord } from '@/types/supabase-types';

export class AIFormService {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  /**
   * Generate the next question based on the form configuration and previous conversation
   */
  async generateNextQuestion(
    form: FormRecord,
    previousQuestions: QuestionRecord[],
    previousAnswers: AnswerRecord[]
  ): Promise<string> {
    try {
      // Create a conversation history that the AI can use to generate the next question
      const conversationHistory = this.buildConversationHistory(previousQuestions, previousAnswers);
      
      // Create a prompt for the AI to generate the next question using the Responses API format
      const systemPrompt = `You are conducting a conversational form based on the following instructions:\n\n${form.instructions}\n\nYou've had the following conversation so far:\n\n${conversationHistory}\n\nGenerate the next relevant question to ask the user based on the previous conversation and form instructions. IMPORTANT: Provide ONLY the question text without any additional content or explanations. The question should be conversational, engaging, and feel like a natural follow-up to the previous exchange.`;
      
      // Using the new OpenAI Responses API format
      console.log("Using OpenAI Responses API with model: gpt-4o-mini");
      const response = await this.openai.responses.create({
        model: "gpt-4o-mini",
        input: [
          { role: "developer", content: systemPrompt },
          { role: "user", content: "Generate the next question based on the conversation history." }
        ],
        max_output_tokens: 200,
        temperature: 0.7,
        store: false // Don't store this interaction on OpenAI's servers
      });
      
      // Extract the generated question using the helper property
      return response.output_text || "Thanks for your answers! Is there anything else you'd like to add before we wrap up?";
    } catch (error) {
      console.error("Error generating next question:", error);
      // Return a fallback question if the AI call fails
      return "Could you tell me more about that?";
    }
  }
  
  /**
   * Build a formatted conversation history from previous questions and answers
   */
  private buildConversationHistory(questions: QuestionRecord[], answers: AnswerRecord[]): string {
    const history: string[] = [];
    
    // Sort questions by order
    const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
    
    // Create a map of answers by question ID for easy lookup
    const answerMap = new Map<string, string>();
    for (const answer of answers) {
      answerMap.set(answer.question_id, answer.content);
    }
    
    // Build the conversation history
    for (const question of sortedQuestions) {
      history.push(`Question: ${question.content}`);
      
      const answer = answerMap.get(question.id);
      if (answer) {
        history.push(`Answer: ${answer}`);
      }
    }
    
    return history.join('\n\n');
  }
}
