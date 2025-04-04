import { 
  FormSubmission,
  FormSubmissionBlock,
  BlockType,
  FormSession,
  DynamicBlockConversation
} from '@/types/form-types';
import { SessionService } from './session-service';
import { BlockService } from './block-service';
import { BaseService } from './base-service';

/**
 * Service for handling form submissions
 */
export class SubmissionService extends BaseService {
  private sessionService: SessionService;
  private blockService: BlockService;

  constructor() {
    super();
    this.sessionService = new SessionService();
    this.blockService = new BlockService();
  }

  /**
   * Submit a completed form
   * @param sessionId Session ID
   * @returns The created submission
   */
  async submitForm(sessionId: string): Promise<FormSubmission> {
    // First check if the session exists
    const session = await this.sessionService.getSession(sessionId);
    if (session.status === 'completed') {
      throw new Error('This form has already been submitted');
    }

    // Start a transaction for the submission process
    const { data: submissionData, error: submissionError } = await this.supabase
      .from('form_submissions')
      .insert({
        form_id: session.formId,
        session_id: sessionId
      })
      .select()
      .single();

    if (submissionError) {
      console.error('Error creating submission:', submissionError);
      throw new Error(`Failed to create submission: ${submissionError.message}`);
    }

    // Get all blocks from the form
    const { data: blocks, error: blocksError } = await this.supabase
      .from('blocks')
      .select('*')
      .eq('form_id', session.formId)
      .is('deleted_at', null)
      .order('order_index', { ascending: true });

    if (blocksError) {
      console.error('Error fetching blocks:', blocksError);
      throw new Error(`Failed to fetch form blocks: ${blocksError.message}`);
    }

    // Process each block
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      
      if (block.type === BlockType.STATIC) {
        await this.processStaticBlockSubmission(submissionData.id, block.id, sessionId, i);
      } else if (block.type === BlockType.DYNAMIC) {
        await this.processDynamicBlockSubmission(submissionData.id, block.id, sessionId, i);
      }
    }

    // Mark the session as completed
    await this.sessionService.completeSession(sessionId);

    // Return the submission
    return this.getSubmission(submissionData.id);
  }

  /**
   * Process a static block for submission
   * @param submissionId Submission ID
   * @param blockId Static block ID
   * @param sessionId Session ID
   * @param orderIndex Block order index
   * @private
   */
  private async processStaticBlockSubmission(
    submissionId: string,
    blockId: string,
    sessionId: string,
    orderIndex: number
  ): Promise<void> {
    // Get the static block details
    const block = await this.blockService.getBlock(blockId);
    if (block.type !== BlockType.STATIC) {
      throw new Error(`Block ${blockId} is not a static block`);
    }

    // Get the answer for this block if any
    const { data: answers, error: answersError } = await this.supabase
      .from('session_answers')
      .select('*')
      .eq('session_id', sessionId)
      .eq('block_id', blockId)
      .order('answered_at', { ascending: false })
      .limit(1);

    if (answersError) {
      console.error('Error fetching static block answer:', answersError);
      throw new Error(`Failed to fetch static block answer: ${answersError.message}`);
    }

    // Create submission block record
    const answerValue = answers.length > 0 ? answers[0].answer_value : null;
    
    const { error } = await this.supabase
      .from('submission_blocks')
      .insert({
        submission_id: submissionId,
        block_id: blockId,
        block_type: BlockType.STATIC,
        order_index: orderIndex,
        question: block.questionText,
        answer: answerValue ? JSON.stringify(answerValue) : null,
        dynamic_conversation: null
      });

    if (error) {
      console.error('Error saving static block submission:', error);
      throw new Error(`Failed to save static block submission: ${error.message}`);
    }
  }

  /**
   * Process a dynamic block for submission
   * @param submissionId Submission ID
   * @param blockId Dynamic block ID
   * @param sessionId Session ID
   * @param orderIndex Block order index
   * @private
   */
  private async processDynamicBlockSubmission(
    submissionId: string,
    blockId: string,
    sessionId: string,
    orderIndex: number
  ): Promise<void> {
    // Find the dynamic conversation for this block
    const { data: conversations, error: conversationsError } = await this.supabase
      .from('dynamic_block_conversations')
      .select('*')
      .eq('session_id', sessionId)
      .eq('block_id', blockId)
      .limit(1);

    if (conversationsError) {
      console.error('Error fetching dynamic conversation:', conversationsError);
      throw new Error(`Failed to fetch dynamic conversation: ${conversationsError.message}`);
    }

    if (conversations.length === 0) {
      // No conversation found, create an empty submission record
      const { error } = await this.supabase
        .from('submission_blocks')
        .insert({
          submission_id: submissionId,
          block_id: blockId,
          block_type: BlockType.DYNAMIC,
          order_index: orderIndex,
          question: null,
          answer: null,
          dynamic_conversation: { questions: [], answers: [] }
        });

      if (error) {
        console.error('Error saving empty dynamic block submission:', error);
        throw new Error(`Failed to save empty dynamic block submission: ${error.message}`);
      }
      
      return;
    }

    // Get the full conversation
    const conversation = await this.sessionService.getDynamicBlockConversation(conversations[0].id);

    // Format for storage
    const conversationData = {
      questions: conversation.questions.map(q => q.questionText),
      answers: conversation.answers.map(a => a.answerText)
    };

    // Create submission block record
    const { error } = await this.supabase
      .from('submission_blocks')
      .insert({
        submission_id: submissionId,
        block_id: blockId,
        block_type: BlockType.DYNAMIC,
        order_index: orderIndex,
        question: null,
        answer: null,
        dynamic_conversation: conversationData
      });

    if (error) {
      console.error('Error saving dynamic block submission:', error);
      throw new Error(`Failed to save dynamic block submission: ${error.message}`);
    }
  }

  /**
   * Get a submission by ID
   * @param submissionId Submission ID
   * @returns Complete submission with all block data
   */
  async getSubmission(submissionId: string): Promise<FormSubmission> {
    await this.initClient();
    
    // Get basic submission data
    const { data: submission, error: submissionError } = await this.supabase
      .from('form_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (submissionError) {
      console.error('Error fetching submission:', submissionError);
      throw new Error(`Submission not found: ${submissionError.message}`);
    }

    // Get all submission blocks
    const { data: blocks, error: blocksError } = await this.supabase
      .from('submission_blocks')
      .select('*')
      .eq('submission_id', submissionId)
      .order('order_index', { ascending: true });

    if (blocksError) {
      console.error('Error fetching submission blocks:', blocksError);
      throw new Error(`Failed to fetch submission blocks: ${blocksError.message}`);
    }

    // Format block data
    const submissionBlocks: FormSubmissionBlock[] = blocks.map((block: any) => ({
      id: block.id,
      submissionId: block.submission_id,
      blockId: block.block_id,
      blockType: block.block_type,
      orderIndex: block.order_index,
      question: block.question,
      answer: block.answer ? JSON.parse(block.answer) : null,
      dynamicConversation: block.dynamic_conversation
    }));

    return {
      id: submission.id,
      formId: submission.form_id,
      sessionId: submission.session_id,
      submittedAt: new Date(submission.submitted_at),
      blocks: submissionBlocks
    };
  }

  /**
   * Get all submissions for a form
   * @param formId Form ID
   * @returns Array of submissions without block data
   */
  async getFormSubmissions(formId: string): Promise<Omit<FormSubmission, 'blocks'>[]> {
    await this.initClient();
    
    const { data, error } = await this.supabase
      .from('form_submissions')
      .select('*')
      .eq('form_id', formId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching form submissions:', error);
      throw new Error(`Failed to fetch form submissions: ${error.message}`);
    }

    return data.map((submission: any) => ({
      id: submission.id,
      formId: submission.form_id,
      sessionId: submission.session_id,
      submittedAt: new Date(submission.submitted_at)
    }));
  }

  /**
   * Export a submission as a flat object
   * @param submissionId Submission ID
   * @returns Flattened submission data for export
   */
  async exportSubmission(submissionId: string): Promise<Record<string, any>> {
    const submission = await this.getSubmission(submissionId);
    const result: Record<string, any> = {
      submissionId: submission.id,
      formId: submission.formId,
      submittedAt: submission.submittedAt.toISOString()
    };

    // Process static blocks
    const staticBlocks = submission.blocks.filter(b => b.blockType === BlockType.STATIC);
    for (const block of staticBlocks) {
      if (block.question) {
        // Create a safe key from the question text
        const key = this.createSafeKey(block.question);
        result[key] = block.answer;
      }
    }

    // Process dynamic blocks
    const dynamicBlocks = submission.blocks.filter(b => b.blockType === BlockType.DYNAMIC);
    for (let i = 0; i < dynamicBlocks.length; i++) {
      const block = dynamicBlocks[i];
      if (block.dynamicConversation) {
        const { questions, answers } = block.dynamicConversation;
        
        // Add each question and answer pair
        for (let j = 0; j < questions.length; j++) {
          if (j < answers.length) { // Only include answered questions
            const key = this.createSafeKey(`dynamicBlock${i+1}_Q${j+1}`);
            result[`${key}_question`] = questions[j];
            result[`${key}_answer`] = answers[j];
          }
        }
      }
    }

    return result;
  }

  /**
   * Create a safe key for object properties from any text
   * @param text Input text
   * @returns Safe property key
   * @private
   */
  private createSafeKey(text: string): string {
    // Remove special characters, limit length, and ensure valid JavaScript identifier
    return text
      .trim()
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .replace(/^[0-9]/, '_$&')
      .replace(/_+/g, '_')
      .substring(0, 50);
  }

  /**
   * Get statistics for a form's submissions
   * @param formId Form ID
   * @returns Statistics for the form
   */
  async getSubmissionStats(formId: string): Promise<{
    totalSubmissions: number;
    completionRate: number;
    averageResponseTime: number;
    submissionsOverTime: { date: string; count: number }[];
  }> {
    await this.initClient();
    
    // Get all sessions for this form
    const { data: sessions, error: sessionsError } = await this.supabase
      .from('form_sessions')
      .select('*')
      .eq('form_id', formId);

    if (sessionsError) {
      console.error('Error fetching form sessions for stats:', sessionsError);
      throw new Error(`Failed to fetch sessions for stats: ${sessionsError.message}`);
    }

    // Get all submissions for this form
    const { data: submissions, error: submissionsError } = await this.supabase
      .from('form_submissions')
      .select('*')
      .eq('form_id', formId);

    if (submissionsError) {
      console.error('Error fetching form submissions for stats:', submissionsError);
      throw new Error(`Failed to fetch submissions for stats: ${submissionsError.message}`);
    }

    // Calculate statistics
    const totalSessions = sessions.length;
    const totalSubmissions = submissions.length;
    const completionRate = totalSessions > 0 ? (totalSubmissions / totalSessions) * 100 : 0;

    // Calculate average response time
    let totalResponseTimeMs = 0;
    let validResponseTimes = 0;

    submissions.forEach((submission: any) => {
      const matchingSession = sessions.find((session: any) => session.id === submission.session_id);
      if (matchingSession && matchingSession.started_at) {
        const startTime = new Date(matchingSession.started_at).getTime();
        const endTime = new Date(submission.submitted_at).getTime();
        const responseTime = endTime - startTime;
        
        // Only count valid response times (greater than 0 and less than 24 hours)
        if (responseTime > 0 && responseTime < 24 * 60 * 60 * 1000) {
          totalResponseTimeMs += responseTime;
          validResponseTimes++;
        }
      }
    });

    const averageResponseTime = validResponseTimes > 0 
      ? Math.round(totalResponseTimeMs / validResponseTimes / 1000) // Convert to seconds
      : 0;

    // Group submissions by date
    const submissionsByDate = submissions.reduce((acc: Record<string, number>, sub: any) => {
      const date = new Date(sub.submitted_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array sorted by date
    const submissionsOverTime = Object.entries(submissionsByDate)
      .map(([date, count]) => ({ date, count: count as number }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalSubmissions,
      completionRate: Math.round(completionRate * 10) / 10, // Round to 1 decimal place
      averageResponseTime,
      submissionsOverTime
    };
  }
}
