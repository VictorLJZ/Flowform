import { 
  DynamicBlock,
  DynamicBlockConversation,
  DynamicBlockQuestion,
  DynamicBlockAnswer 
} from '@/types/form-types';
import { AIService } from '../ai-service';
import { BlockService } from './block-service';
import { BaseService } from './base-service';

/**
 * Service for managing dynamic blocks and their conversations
 */
export class DynamicBlockService extends BaseService {
  private aiService: AIService;
  private blockService: BlockService;

  constructor() {
    super();
    this.aiService = new AIService();
    this.blockService = new BlockService();
  }

  /**
   * Start a new dynamic block conversation
   * @param sessionId Session ID
   * @param blockId Dynamic block ID
   * @returns The conversation with the seed question
   */
  async startConversation(sessionId: string, blockId: string): Promise<DynamicBlockConversation> {
    await this.initClient();
    
    // Get the dynamic block
    const block = await this.blockService.getBlock(blockId);
    if (block.type !== 'dynamic') {
      throw new Error(`Block ${blockId} is not a dynamic block`);
    }

    // Create the conversation
    const { data, error } = await this.supabase
      .from('dynamic_block_conversations')
      .insert({
        session_id: sessionId,
        block_id: blockId,
        current_question_index: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      throw new Error(`Failed to create conversation: ${error.message}`);
    }

    // Add the seed question
    const questionData = await this.addSeedQuestion(data.id, block as DynamicBlock);

    return {
      id: data.id,
      sessionId: data.session_id,
      blockId: data.block_id,
      questions: [questionData],
      answers: [],
      currentQuestionIndex: 0
    };
  }

  /**
   * Add the seed question to a conversation
   * @param conversationId Conversation ID
   * @param block Dynamic block configuration
   * @returns The created question
   * @private
   */
  private async addSeedQuestion(conversationId: string, block: DynamicBlock): Promise<DynamicBlockQuestion> {
    await this.initClient();
    
    // Get all form questions for context
    const formQuestions = await this.blockService.getFormQuestions(block.formId);

    // Create the question
    const { data, error } = await this.supabase
      .from('dynamic_block_questions')
      .insert({
        conversation_id: conversationId,
        question_text: block.seedQuestion,
        order_index: 0,
        generation_context: {
          formQuestions,
          currentBlockContext: {
            questions: [],
            answers: []
          }
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding seed question:', error);
      throw new Error(`Failed to add seed question: ${error.message}`);
    }

    return {
      id: data.id,
      conversationId: data.conversation_id,
      questionText: data.question_text,
      orderIndex: data.order_index,
      createdAt: new Date(data.created_at),
      generationContext: data.generation_context
    };
  }

  /**
   * Generate and store the next question in a conversation
   * @param conversationId Conversation ID
   * @param previousAnswer The answer to the previous question
   * @returns The generated question
   */
  async generateNextQuestion(conversationId: string, previousAnswer: string): Promise<DynamicBlockQuestion> {
    await this.initClient();
    
    // Get the current conversation
    const conversation = await this.getConversation(conversationId);
    
    // Get the block details
    const block = await this.blockService.getBlock(conversation.blockId);
    if (block.type !== 'dynamic') {
      throw new Error(`Block ${conversation.blockId} is not a dynamic block`);
    }

    // Check if we've reached the maximum questions
    if (conversation.currentQuestionIndex >= (block as DynamicBlock).numFollowUpQuestions) {
      throw new Error('Maximum number of questions reached');
    }

    // Get all form questions for context
    const formQuestions = await this.blockService.getFormQuestions(block.formId);
    
    // Build the current block context
    const blockQuestions = conversation.questions.map(q => q.questionText);
    const blockAnswers = [...conversation.answers.map(a => a.answerText), previousAnswer];
    
    // Generate the next question
    const questionText = await this.aiService.generateDynamicBlockQuestion(
      block as DynamicBlock,
      formQuestions,
      blockQuestions,
      blockAnswers,
      conversation.currentQuestionIndex + 1
    );
    
    // Save the question
    const { data, error } = await this.supabase
      .from('dynamic_block_questions')
      .insert({
        conversation_id: conversationId,
        question_text: questionText,
        order_index: conversation.currentQuestionIndex + 1,
        generation_context: {
          formQuestions,
          currentBlockContext: {
            questions: blockQuestions,
            answers: blockAnswers
          }
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving generated question:', error);
      throw new Error(`Failed to save generated question: ${error.message}`);
    }

    // Update the conversation's current question index
    await this.supabase
      .from('dynamic_block_conversations')
      .update({ current_question_index: conversation.currentQuestionIndex + 1 })
      .eq('id', conversationId);

    return {
      id: data.id,
      conversationId: data.conversation_id,
      questionText: data.question_text,
      orderIndex: data.order_index,
      createdAt: new Date(data.created_at),
      generationContext: data.generation_context
    };
  }

  /**
   * Record an answer to a question
   * @param conversationId Conversation ID
   * @param questionId Question ID
   * @param answerText The answer text
   * @returns The created answer
   */
  async saveAnswer(conversationId: string, questionId: string, answerText: string): Promise<DynamicBlockAnswer> {
    await this.initClient();
    
    const { data, error } = await this.supabase
      .from('dynamic_block_answers')
      .insert({
        conversation_id: conversationId,
        question_id: questionId,
        answer_text: answerText
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving answer:', error);
      throw new Error(`Failed to save answer: ${error.message}`);
    }

    return {
      id: data.id,
      conversationId: data.conversation_id,
      questionId: data.question_id,
      answerText: data.answer_text,
      answeredAt: new Date(data.answered_at)
    };
  }

  /**
   * Get a conversation with all its questions and answers
   * @param conversationId Conversation ID
   * @returns The complete conversation
   */
  async getConversation(conversationId: string): Promise<DynamicBlockConversation> {
    await this.initClient();
    
    // Get conversation data
    const { data: conversation, error: conversationError } = await this.supabase
      .from('dynamic_block_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (conversationError) {
      console.error('Error fetching conversation:', conversationError);
      throw new Error(`Conversation not found: ${conversationError.message}`);
    }

    // Get questions
    const { data: questions, error: questionsError } = await this.supabase
      .from('dynamic_block_questions')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('order_index', { ascending: true });

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      throw new Error(`Failed to fetch questions: ${questionsError.message}`);
    }

    // Get answers
    const { data: answers, error: answersError } = await this.supabase
      .from('dynamic_block_answers')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('answered_at', { ascending: true });

    if (answersError) {
      console.error('Error fetching answers:', answersError);
      throw new Error(`Failed to fetch answers: ${answersError.message}`);
    }

    return {
      id: conversation.id,
      sessionId: conversation.session_id,
      blockId: conversation.block_id,
      questions: questions.map(q => ({
        id: q.id,
        conversationId: q.conversation_id,
        questionText: q.question_text,
        orderIndex: q.order_index,
        createdAt: new Date(q.created_at),
        generationContext: q.generation_context
      })),
      answers: answers.map(a => ({
        id: a.id,
        conversationId: a.conversation_id,
        questionId: a.question_id,
        answerText: a.answer_text,
        answeredAt: new Date(a.answered_at)
      })),
      currentQuestionIndex: conversation.current_question_index
    };
  }

  /**
   * Reset a conversation (delete all questions except seed and all answers)
   * @param conversationId Conversation ID
   */
  async resetConversation(conversationId: string): Promise<void> {
    await this.initClient();
    
    // Get the conversation
    const conversation = await this.getConversation(conversationId);
    
    // Keep only the seed question
    const seedQuestion = conversation.questions.find(q => q.orderIndex === 0);
    if (!seedQuestion) {
      throw new Error('Seed question not found');
    }

    // Delete all answers
    await this.supabase
      .from('dynamic_block_answers')
      .delete()
      .eq('conversation_id', conversationId);

    // Delete all questions except seed
    await this.supabase
      .from('dynamic_block_questions')
      .delete()
      .eq('conversation_id', conversationId)
      .gt('order_index', 0);

    // Reset conversation index
    await this.supabase
      .from('dynamic_block_conversations')
      .update({ current_question_index: 0 })
      .eq('id', conversationId);
  }
}
