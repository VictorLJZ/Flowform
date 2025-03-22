import openai from './openai-client';
import { FormGenerationConfig, QuestionGenerationResult } from '../../types/form-generation';
import { ContextManager } from './context-manager';
import { questionGenerationPrompt, formatConversationHistory } from './prompt-templates';

export class QuestionGenerator {
  private config: FormGenerationConfig;
  private contextManager: ContextManager;
  private previousResponseId?: string; // For OpenAI state management
  
  constructor(config: FormGenerationConfig) {
    this.config = config;
    this.contextManager = new ContextManager(config.starterQuestion);
  }
  
  getStarterQuestion(): string {
    return this.config.starterQuestion;
  }
  
  async generateNextQuestion(answer: string): Promise<QuestionGenerationResult> {
    // Add the user's answer to the context
    this.contextManager.addAnswer(answer);
    
    // Check if we've reached the maximum number of questions
    if (this.contextManager.isComplete(this.config.maxQuestions)) {
      return {
        question: "Thank you for your responses! Is there anything else you'd like to add before we conclude?",
        isLastQuestion: true
      };
    }
    
    // Prepare the prompt
    const { questions, answers } = this.contextManager.getConversationHistory();
    const conversationHistory = formatConversationHistory(questions, answers);
    const currentIndex = this.contextManager.getCurrentIndex() + 1; // +1 for the next question
    
    const prompt = questionGenerationPrompt
      .replace('{{instructions}}', this.config.instructions)
      .replace('{{conversationHistory}}', conversationHistory)
      .replace('{{currentIndex}}', currentIndex.toString())
      .replace('{{maxQuestions}}', this.config.maxQuestions.toString());
    
    // Create the input for the OpenAI Responses API
    const input = [
      { role: "developer", content: "You are a form question generator that creates thoughtful follow-up questions based on previous responses." },
      { role: "user", content: prompt }
    ];
    
    // If we have a previous response ID, use it for state management
    const requestOptions: any = {
      model: "gpt-4o-mini",
      input,
      temperature: this.config.temperature,
    };
    
    if (this.previousResponseId) {
      requestOptions.previous_response_id = this.previousResponseId;
    } else {
      requestOptions.store = true; // Enable state management for the first request
    }
    
    // Generate the next question using OpenAI
    const response = await openai.responses.create(requestOptions);
    
    // Store the response ID for future requests
    this.previousResponseId = response.id;
    
    // Extract the generated question
    const generatedQuestion = response.output_text;
    
    // Add the new question to the context
    this.contextManager.addQuestion(generatedQuestion);
    
    // Check if this is the last question
    const isLastQuestion = this.contextManager.getCurrentIndex() >= this.config.maxQuestions - 1;
    
    return {
      question: generatedQuestion,
      isLastQuestion
    };
  }
  
  // Get the current conversation state
  getConversationState() {
    return {
      questions: this.contextManager.getConversationHistory().questions,
      answers: this.contextManager.getConversationHistory().answers,
      currentIndex: this.contextManager.getCurrentIndex()
    };
  }
} 