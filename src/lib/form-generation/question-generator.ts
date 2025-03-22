import openai from '../../app/api/openai/openai-client';
import { FormGenerationConfig, QuestionGenerationResult } from '../../types/form-generation';
import { ContextManager } from './context-manager';
import { questionGenerationPrompt, formatConversationHistory } from './prompt-templates';
import { FormStorageService } from './form-storage-service';
import { QuestionRecord, AnswerRecord } from '../../types/supabase-types';

export class QuestionGenerator {
  private config: FormGenerationConfig;
  private contextManager: ContextManager;
  private previousResponseId?: string; // For OpenAI state management
  private storageService: FormStorageService;
  private formId?: string;
  private sessionId?: string;
  private questionIds: string[] = [];
  
  constructor(config: FormGenerationConfig) {
    this.config = config;
    this.contextManager = new ContextManager(config.starterQuestion);
    this.storageService = new FormStorageService();
  }
  
  /**
   * Initialize the form in Supabase
   */
  async initializeForm(title: string, description?: string): Promise<string> {
    this.formId = await this.storageService.createForm(this.config, title, description);
    return this.formId;
  }
  
  /**
   * Start a new session for this form
   */
  async startSession(): Promise<string> {
    if (!this.formId) {
      throw new Error('Form must be initialized before starting a session');
    }
    
    this.sessionId = await this.storageService.createSession(this.formId);
    
    // Get the starter question ID
    const questions = await this.storageService.getFormQuestions(this.formId);
    const starterQuestion = questions.find(q => q.is_starter);
    
    if (starterQuestion) {
      this.questionIds = [starterQuestion.id];
    }
    
    return this.sessionId;
  }
  
  getStarterQuestion(): string {
    return this.config.starterQuestion;
  }
  
  async generateNextQuestion(answer: string): Promise<QuestionGenerationResult> {
    // Add the user's answer to the context
    this.contextManager.addAnswer(answer);
    
    // Save the answer to Supabase if we have a session
    if (this.formId && this.sessionId && this.questionIds.length > 0) {
      const currentQuestionId = this.questionIds[this.contextManager.getCurrentIndex()];
      await this.storageService.addAnswer(
        this.formId,
        currentQuestionId,
        answer,
        this.sessionId
      );
    }
    
    // Check if we've reached the maximum number of questions
    if (this.contextManager.isComplete(this.config.maxQuestions)) {
      // Mark the session as complete if we have one
      if (this.sessionId) {
        await this.storageService.updateSessionIndex(
          this.sessionId,
          this.contextManager.getCurrentIndex(),
          true
        );
      }
      
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
    
    // Save the question to Supabase if we have a form
    if (this.formId) {
      const questionId = await this.storageService.addQuestion(
        this.formId,
        generatedQuestion,
        currentIndex
      );
      this.questionIds.push(questionId);
      
      // Update the session's current question index if we have a session
      if (this.sessionId) {
        await this.storageService.updateSessionIndex(
          this.sessionId,
          currentIndex
        );
      }
    }
    
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
      currentIndex: this.contextManager.getCurrentIndex(),
      formId: this.formId,
      sessionId: this.sessionId
    };
  }
  
  /**
   * Load an existing form from Supabase
   */
  async loadForm(formId: string): Promise<void> {
    this.formId = formId;
    
    // Get the form data
    const form = await this.storageService.getForm(formId);
    if (!form) throw new Error(`Form not found: ${formId}`);
    
    // Update the config
    this.config = {
      starterQuestion: '', // Will be set from the questions
      instructions: form.instructions,
      temperature: form.temperature,
      maxQuestions: form.max_questions
    };
    
    // Get the questions
    const questions = await this.storageService.getFormQuestions(formId);
    
    // Sort by order
    questions.sort((a, b) => a.order - b.order);
    
    // Store question IDs
    this.questionIds = questions.map(q => q.id);
    
    // Find the starter question
    const starterQuestion = questions.find(q => q.is_starter);
    if (starterQuestion) {
      this.config.starterQuestion = starterQuestion.content;
    }
    
    // Reset the context manager with the starter question
    this.contextManager = new ContextManager(this.config.starterQuestion);
  }
  
  /**
   * Load an existing session from Supabase
   */
  async loadSession(sessionId: string): Promise<void> {
    this.sessionId = sessionId;
    
    // Get the session data
    const session = await this.storageService.getSession(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);
    
    // Load the form if not already loaded
    if (!this.formId || this.formId !== session.form_id) {
      await this.loadForm(session.form_id);
    }
    
    // Get the conversation history
    const { questions, answers } = await this.storageService.getConversationHistory(sessionId);
    
    // Sort questions by order
    questions.sort((a, b) => a.order - b.order);
    
    // Reset the context manager
    this.contextManager = new ContextManager(questions[0].content);
    
    // Add all questions and answers to the context manager
    for (let i = 1; i < questions.length; i++) {
      this.contextManager.addQuestion(questions[i].content);
    }
    
    // Sort answers by question order
    const sortedAnswers: AnswerRecord[] = [];
    for (const question of questions) {
      const answer = answers.find(a => a.question_id === question.id);
      if (answer) sortedAnswers.push(answer);
    }
    
    // Add answers to context manager
    for (const answer of sortedAnswers) {
      this.contextManager.addAnswer(answer.content);
    }
    
    // Set the current index from the session
    while (this.contextManager.getCurrentIndex() < session.current_question_index) {
      this.contextManager.incrementIndex();
    }
  }
} 