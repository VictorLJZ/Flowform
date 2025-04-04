import { 
  FormSession, 
  DynamicBlockConversation,
  DynamicBlockQuestion,
  DynamicBlockAnswer,
  SessionProgress,
  BlockType
} from '@/types/form-types';
import { AIService } from '../ai-service';
import { BlockService } from './block-service';
import { BaseService } from './base-service';

/**
 * Service for managing form sessions and progress tracking
 */
export class SessionService extends BaseService {
  private aiService: AIService;
  private blockService: BlockService;

  constructor() {
    super();
    this.aiService = new AIService();
    this.blockService = new BlockService();
  }

  /**
   * Create a new form session
   * @param formId Form ID
   * @param userIdentifier User identifier (email, ID, or anonymous identifier)
   * @returns Session data with ID
   */
  async createSession(formId: string, userIdentifier: string): Promise<FormSession> {
    await this.initClient();
    
    // Get form version
    const { data: formData, error: formError } = await this.supabase
      .from('forms')
      .select('version')
      .eq('id', formId)
      .single();

    if (formError) {
      console.error('Error fetching form version:', formError);
      throw new Error(`Failed to fetch form: ${formError.message}`);
    }

    const sessionData = {
      form_id: formId,
      user_identifier: userIdentifier,
      status: 'in_progress',
      current_block_index: 0,
      form_version: formData.version,
      metadata: {}
    };

    // Create the session
    const { data: session, error: sessionError } = await this.supabase
      .from('form_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      throw new Error(`Failed to create session: ${sessionError.message}`);
    }

    // Initialize progress for the first block
    await this.initializeFirstBlockProgress(session.id, formId);

    return {
      id: session.id,
      formId: session.form_id,
      userIdentifier: session.user_identifier,
      status: session.status,
      currentBlockIndex: session.current_block_index,
      currentDynamicConversationId: session.current_dynamic_conversation_id,
      startedAt: new Date(session.started_at),
      lastActivityAt: new Date(session.last_activity_at),
      completedAt: session.completed_at ? new Date(session.completed_at) : undefined,
      formVersion: session.form_version,
      metadata: session.metadata || {}
    };
  }

  /**
   * Initialize progress for the first block in a form
   * @param sessionId Session ID
   * @param formId Form ID
   * @private
   */
  private async initializeFirstBlockProgress(sessionId: string, formId: string): Promise<void> {
    await this.initClient();
    
    // Get the first block from the form
    const { data: firstBlock, error: blockError } = await this.supabase
      .from('blocks')
      .select('id, type')
      .eq('form_id', formId)
      .is('deleted_at', null)
      .order('order_index', { ascending: true })
      .limit(1)
      .single();

    if (blockError) {
      console.error('Error fetching first block:', blockError);
      return; // Don't fail the whole session creation if this fails
    }

    // Create progress entry for this block
    await this.supabase
      .from('session_progress')
      .insert({
        session_id: sessionId,
        block_id: firstBlock.id,
        status: 'not_started',
        dynamic_progress: firstBlock.type === 'dynamic' ? {
          totalQuestions: 0, // Will be set when dynamic block is started
          answeredQuestions: 0,
          currentQuestionIndex: 0
        } : null
      });
  }

  /**
   * Get a session by ID
   * @param sessionId Session ID
   * @returns Session data
   */
  async getSession(sessionId: string): Promise<FormSession> {
    await this.initClient();
    
    const { data, error } = await this.supabase
      .from('form_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Error fetching session:', error);
      throw new Error(`Session not found: ${error.message}`);
    }

    return {
      id: data.id,
      formId: data.form_id,
      userIdentifier: data.user_identifier,
      status: data.status,
      currentBlockIndex: data.current_block_index,
      currentDynamicConversationId: data.current_dynamic_conversation_id,
      startedAt: new Date(data.started_at),
      lastActivityAt: new Date(data.last_activity_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      formVersion: data.form_version,
      metadata: data.metadata || {}
    };
  }

  /**
   * Get all sessions for a form
   * @param formId Form ID
   * @returns Array of sessions
   */
  async getFormSessions(formId: string): Promise<FormSession[]> {
    await this.initClient();
    
    const { data, error } = await this.supabase
      .from('form_sessions')
      .select('*')
      .eq('form_id', formId)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error fetching form sessions:', error);
      throw new Error(`Failed to fetch form sessions: ${error.message}`);
    }

    return data.map((session: any) => ({
      id: session.id,
      formId: session.form_id,
      userIdentifier: session.user_identifier,
      status: session.status,
      currentBlockIndex: session.current_block_index,
      currentDynamicConversationId: session.current_dynamic_conversation_id,
      startedAt: new Date(session.started_at),
      lastActivityAt: new Date(session.last_activity_at),
      completedAt: session.completed_at ? new Date(session.completed_at) : undefined,
      formVersion: session.form_version,
      metadata: session.metadata || {}
    }));
  }

  /**
   * Update session progress
   * @param sessionId Session ID
   * @param blockIndex New block index
   */
  async updateSessionProgress(sessionId: string, blockIndex: number): Promise<void> {
    await this.initClient();
    
    const { error } = await this.supabase
      .from('form_sessions')
      .update({
        current_block_index: blockIndex,
        last_activity_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating session progress:', error);
      throw new Error(`Failed to update session progress: ${error.message}`);
    }
  }

  /**
   * Mark a session as completed
   * @param sessionId Session ID
   */
  async completeSession(sessionId: string): Promise<void> {
    await this.initClient();
    
    const { error } = await this.supabase
      .from('form_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error completing session:', error);
      throw new Error(`Failed to complete session: ${error.message}`);
    }
  }

  /**
   * Abandon a session
   * @param sessionId Session ID
   */
  async abandonSession(sessionId: string): Promise<void> {
    await this.initClient();
    
    const { error } = await this.supabase
      .from('form_sessions')
      .update({
        status: 'abandoned',
        last_activity_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error abandoning session:', error);
      throw new Error(`Failed to abandon session: ${error.message}`);
    }
  }

  /**
   * Get all block progress for a session
   * @param sessionId Session ID
   * @returns Block progress data
   */
  async getSessionBlockProgress(sessionId: string): Promise<SessionProgress[]> {
    await this.initClient();
    
    const { data, error } = await this.supabase
      .from('session_progress')
      .select(`
        *,
        block:blocks(
          id, 
          type, 
          order_index
        )
      `)
      .eq('session_id', sessionId)
      .order('block:blocks(order_index)', { ascending: true });

    if (error) {
      console.error('Error fetching session progress:', error);
      throw new Error(`Failed to fetch session progress: ${error.message}`);
    }

    return data.map((progress: any) => ({
      sessionId: progress.session_id,
      blockId: progress.block_id,
      blockType: progress.block.type,
      orderIndex: progress.block.order_index,
      status: progress.status,
      dynamicProgress: progress.dynamic_progress,
      answer: progress.answer,
      updatedAt: new Date(progress.updated_at)
    }));
  }

  /**
   * Update block progress status
   * @param sessionId Session ID
   * @param blockId Block ID
   * @param status New status
   */
  async updateBlockProgress(
    sessionId: string, 
    blockId: string, 
    status: 'not_started' | 'in_progress' | 'completed' | 'skipped'
  ): Promise<void> {
    await this.initClient();
    
    const updates: any = {
      status,
      metadata: {}
    };

    if (status === 'in_progress' && !updates.started_at) {
      updates.started_at = new Date().toISOString();
    }

    if (status === 'completed' || status === 'skipped') {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await this.supabase
      .from('session_progress')
      .update(updates)
      .eq('session_id', sessionId)
      .eq('block_id', blockId);

    if (error) {
      console.error('Error updating block progress:', error);
      throw new Error(`Failed to update block progress: ${error.message}`);
    }
  }

  /**
   * Create a new dynamic block conversation
   * @param sessionId Session ID
   * @param blockId Block ID
   * @returns Conversation data with ID
   */
  async createDynamicBlockConversation(
    sessionId: string,
    blockId: string
  ): Promise<DynamicBlockConversation> {
    await this.initClient();
    
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
      console.error('Error creating dynamic conversation:', error);
      throw new Error(`Failed to create dynamic conversation: ${error.message}`);
    }

    // Update the session to reference this conversation
    await this.supabase
      .from('form_sessions')
      .update({
        current_dynamic_conversation_id: data.id,
        last_activity_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    // Get the dynamic block details
    const block = await this.blockService.getBlock(blockId);
    if (block.type !== BlockType.DYNAMIC) {
      throw new Error(`Block ${blockId} is not a dynamic block`);
    }

    // Add the seed question as the first question in the conversation
    const { data: questionData, error: questionError } = await this.supabase
      .from('dynamic_block_questions')
      .insert({
        conversation_id: data.id,
        question_text: block.seedQuestion,
        order_index: 0,
        generation_context: {
          formQuestions: {
            staticQuestions: [],
            dynamicBlockSeeds: []
          },
          currentBlockContext: {
            questions: [],
            answers: []
          }
        }
      })
      .select()
      .single();

    if (questionError) {
      console.error('Error adding seed question:', questionError);
      throw new Error(`Failed to add seed question: ${questionError.message}`);
    }

    // Update dynamic progress
    const { error: progressError } = await this.supabase
      .from('session_progress')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
        dynamic_progress: {
          totalQuestions: block.numFollowUpQuestions + 1, // +1 for seed question
          answeredQuestions: 0,
          currentQuestionIndex: 0
        }
      })
      .eq('session_id', sessionId)
      .eq('block_id', blockId);

    if (progressError) {
      console.error('Error updating dynamic progress:', progressError);
    }

    return {
      id: data.id,
      sessionId: data.session_id,
      blockId: data.block_id,
      questions: [{
        id: questionData.id,
        conversationId: questionData.conversation_id,
        questionText: questionData.question_text,
        orderIndex: questionData.order_index,
        createdAt: new Date(questionData.created_at),
        generationContext: questionData.generation_context
      }],
      answers: [],
      currentQuestionIndex: data.current_question_index
    };
  }

  /**
   * Get a dynamic block conversation
   * @param conversationId Conversation ID
   * @returns Complete conversation with questions and answers
   */
  async getDynamicBlockConversation(conversationId: string): Promise<DynamicBlockConversation> {
    await this.initClient();
    
    // Get conversation data
    const { data: conversationData, error: conversationError } = await this.supabase
      .from('dynamic_block_conversations')
      .select(`
        *,
        questions:dynamic_block_questions(
          *
        ),
        answers:dynamic_block_answers(
          *
        )
      `)
      .eq('id', conversationId)
      .single();

    if (conversationError) {
      console.error('Error fetching conversation:', conversationError);
      throw new Error(`Conversation not found: ${conversationError.message}`);
    }

    // Sort questions by index
    const sortedQuestions = conversationData.questions
      .sort((a: any, b: any) => a.question_index - b.question_index)
      .map((q: any) => ({
        id: q.id,
        conversationId: q.conversation_id,
        questionIndex: q.question_index,
        questionText: q.question_text,
        createdAt: new Date(q.created_at)
      }));

    // Sort answers by question index
    const sortedAnswers = conversationData.answers
      .sort((a: any, b: any) => a.question_index - b.question_index)
      .map((a: any) => ({
        id: a.id,
        conversationId: a.conversation_id,
        questionId: a.question_id,
        questionIndex: a.question_index,
        answerText: a.answer_text,
        createdAt: new Date(a.created_at)
      }));

    return {
      id: conversationData.id,
      sessionId: conversationData.session_id,
      blockId: conversationData.block_id,
      totalQuestions: conversationData.total_questions,
      currentQuestionIndex: conversationData.current_question_index,
      status: conversationData.status,
      createdAt: new Date(conversationData.created_at),
      completedAt: conversationData.completed_at ? new Date(conversationData.completed_at) : undefined,
      questions: sortedQuestions,
      answers: sortedAnswers
    };
  }

  /**
   * Answer a question in a dynamic block conversation
   * @param conversationId Conversation ID
   * @param questionId Question ID
   * @param answerText Answer text
   * @returns The answer object and possibly the next generated question
   */
  async answerDynamicBlockQuestion(
    conversationId: string,
    questionId: string,
    answerText: string
  ): Promise<{
    answer: DynamicBlockAnswer;
    nextQuestion?: DynamicBlockQuestion;
  }> {
    await this.initClient();
    
    // Get the current conversation state
    const conversation = await this.getDynamicBlockConversation(conversationId);

    // Check if this is the last question (seed + all follow-up questions)
    const block = await this.blockService.getBlock(conversation.blockId);
    if (block.type !== BlockType.DYNAMIC) {
      throw new Error(`Block ${conversation.blockId} is not a dynamic block`);
    }

    const isLastQuestion = conversation.currentQuestionIndex >= block.numFollowUpQuestions;

    // Save the answer
    const { data: answerData, error: answerError } = await this.supabase
      .from('dynamic_block_answers')
      .insert({
        conversation_id: conversationId,
        question_id: questionId,
        answer_text: answerText
      })
      .select()
      .single();

    if (answerError) {
      console.error('Error saving answer:', answerError);
      throw new Error(`Failed to save answer: ${answerError.message}`);
    }

    // Update the progress
    await this.updateDynamicBlockProgress(conversation.sessionId, conversation.blockId, {
      totalQuestions: block.numFollowUpQuestions + 1, // +1 for seed question
      answeredQuestions: conversation.answers.length + 1,
      currentQuestionIndex: conversation.currentQuestionIndex
    });

    // If this is the last question, complete the conversation
    if (isLastQuestion) {
      await this.completeDynamicBlockConversation(conversationId);
      
      // Also complete the block progress
      await this.updateBlockProgress(conversation.sessionId, conversation.blockId, 'completed');
      
      return {
        answer: {
          id: answerData.id,
          conversationId: answerData.conversation_id,
          questionId: answerData.question_id,
          answerText: answerData.answer_text,
          answeredAt: new Date(answerData.answered_at)
        }
      };
    }

    // Otherwise, generate the next question
    const nextQuestion = await this.generateNextDynamicQuestion(conversation, block, answerText);
    
    // Increment the current question index
    await this.updateDynamicConversationIndex(conversationId, conversation.currentQuestionIndex + 1);
    
    // Update the progress again with the new index
    await this.updateDynamicBlockProgress(conversation.sessionId, conversation.blockId, {
      totalQuestions: block.numFollowUpQuestions + 1,
      answeredQuestions: conversation.answers.length + 1,
      currentQuestionIndex: conversation.currentQuestionIndex + 1
    });

    return {
      answer: {
        id: answerData.id,
        conversationId: answerData.conversation_id,
        questionId: answerData.question_id,
        answerText: answerData.answer_text,
        answeredAt: new Date(answerData.answered_at)
      },
      nextQuestion
    };
  }

  /**
   * Update the current question index for a dynamic conversation
   * @param conversationId Conversation ID
   * @param index New index
   * @private
   */
  private async updateDynamicConversationIndex(conversationId: string, index: number): Promise<void> {
    await this.initClient();
    
    const { error } = await this.supabase
      .from('dynamic_block_conversations')
      .update({
        current_question_index: index
      })
      .eq('id', conversationId);

    if (error) {
      console.error('Error updating conversation index:', error);
      throw new Error(`Failed to update conversation index: ${error.message}`);
    }
  }

  /**
   * Update dynamic block progress
   * @param sessionId Session ID
   * @param blockId Block ID
   * @param progress Progress data
   * @private
   */
  private async updateDynamicBlockProgress(
    sessionId: string,
    blockId: string,
    progress: {
      totalQuestions: number;
      answeredQuestions: number;
      currentQuestionIndex: number;
    }
  ): Promise<void> {
    await this.initClient();
    
    const { error } = await this.supabase
      .from('session_progress')
      .update({
        dynamic_progress: progress
      })
      .eq('session_id', sessionId)
      .eq('block_id', blockId);

    if (error) {
      console.error('Error updating dynamic progress:', error);
      // Don't throw, just log the error
    }
  }

  /**
   * Mark a dynamic block conversation as completed
   * @param conversationId Conversation ID
   * @private
   */
  private async completeDynamicBlockConversation(conversationId: string): Promise<void> {
    await this.initClient();
    
    const { error } = await this.supabase
      .from('dynamic_block_conversations')
      .update({
        completed_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    if (error) {
      console.error('Error completing conversation:', error);
      // Don't throw, just log the error
    }
  }

  /**
   * Generate the next question in a dynamic block conversation
   * @param conversation Current conversation
   * @param block Dynamic block configuration
   * @param latestAnswer Latest answer
   * @returns Generated question
   * @private
   */
  private async generateNextDynamicQuestion(
    conversation: DynamicBlockConversation,
    block: any, // Using any to avoid circular dependency with DynamicBlock
    latestAnswer: string
  ): Promise<DynamicBlockQuestion> {
    await this.initClient();
    
    // Get all form questions for context
    const formQuestions = await this.blockService.getFormQuestions(block.formId);
    
    // Build the current block context
    const blockQuestions = conversation.questions.map(q => q.questionText);
    const blockAnswers = [...conversation.answers.map(a => a.answerText), latestAnswer];
    
    // Use the AI service to generate the next question
    const questionText = await this.aiService.generateDynamicBlockQuestion(
      block,
      formQuestions,
      blockQuestions,
      blockAnswers,
      conversation.currentQuestionIndex
    );
    
    // Save the question to the database
    const { data, error } = await this.supabase
      .from('dynamic_block_questions')
      .insert({
        conversation_id: conversation.id,
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

    return {
      id: data.id,
      conversationId: data.conversation_id,
      questionText: data.question_text,
      orderIndex: data.order_index,
      createdAt: new Date(data.created_at),
      generationContext: data.generation_context
    };
  }
}
