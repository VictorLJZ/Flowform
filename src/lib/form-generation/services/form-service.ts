import { 
  FormConfig, 
  StaticBlock, 
  DynamicBlock, 
  BlockType,
  FormSession,
  FormSubmission
} from '@/types/form-types';
import { BaseService } from './base-service';

/**
 * Service for managing form operations
 */
export class FormService extends BaseService {
  /**
   * Create a new form
   * @param formData Basic form configuration
   * @returns The ID of the newly created form
   */
  async createForm(formData: {
    title: string;
    description?: string;
    maxBlocks?: number;
    allowSaveProgress?: boolean;
    settings?: Record<string, any>;
  }): Promise<string> {
    await this.initClient(); // Initialize Supabase client

    const { data, error } = await this.supabase
      .from('forms')
      .insert({
        title: formData.title,
        description: formData.description || null,
        max_blocks: formData.maxBlocks || 50,
        allow_save_progress: formData.allowSaveProgress ?? true,
        settings: formData.settings || {},
        status: 'draft',
        version: 1,
        created_by: (await this.supabase.auth.getUser()).data.user?.id
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating form:', error);
      throw new Error(`Failed to create form: ${error.message}`);
    }

    return data.id;
  }

  /**
   * Get a form by ID with all its blocks
   * @param formId The form ID
   * @returns Complete form configuration with blocks
   */
  async getForm(formId: string): Promise<FormConfig> {
    await this.initClient(); // Initialize Supabase client

    // Get form data
    const { data: formData, error: formError } = await this.supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .is('deleted_at', null)
      .single();

    if (formError) {
      console.error('Error fetching form:', formError);
      throw new Error(`Form not found: ${formError.message}`);
    }

    // Get blocks for this form
    const { data: blocksData, error: blocksError } = await this.supabase
      .from('blocks')
      .select('*')
      .eq('form_id', formId)
      .is('deleted_at', null)
      .order('order_index', { ascending: true });

    if (blocksError) {
      console.error('Error fetching blocks:', blocksError);
      throw new Error(`Failed to fetch form blocks: ${blocksError.message}`);
    }

    // Fetch detailed block data
    const blocks: (StaticBlock | DynamicBlock)[] = await Promise.all(
      blocksData.map(async (block: any) => {
        if (block.type === BlockType.STATIC) {
          const { data: staticData, error: staticError } = await this.supabase
            .from('static_blocks')
            .select('*')
            .eq('id', block.id)
            .single();

          if (staticError) {
            console.error('Error fetching static block:', staticError);
            throw new Error(`Failed to fetch static block: ${staticError.message}`);
          }

          return {
            ...block,
            ...staticData,
            type: BlockType.STATIC,
            createdAt: new Date(block.created_at),
            updatedAt: new Date(block.updated_at)
          } as StaticBlock;
        } else {
          const { data: dynamicData, error: dynamicError } = await this.supabase
            .from('dynamic_blocks')
            .select('*')
            .eq('id', block.id)
            .single();

          if (dynamicError) {
            console.error('Error fetching dynamic block:', dynamicError);
            throw new Error(`Failed to fetch dynamic block: ${dynamicError.message}`);
          }

          return {
            ...block,
            ...dynamicData,
            type: BlockType.DYNAMIC,
            createdAt: new Date(block.created_at),
            updatedAt: new Date(block.updated_at)
          } as DynamicBlock;
        }
      })
    );

    // Format into FormConfig
    return {
      id: formData.id,
      title: formData.title,
      description: formData.description,
      blocks,
      createdAt: new Date(formData.created_at),
      updatedAt: new Date(formData.updated_at),
      status: formData.status,
      version: formData.version,
      maxBlocks: formData.max_blocks,
      allowSaveProgress: formData.allow_save_progress,
      settings: formData.settings || {}
    };
  }

  /**
   * Get a list of forms
   * @param status Optional filter by status
   * @returns List of forms with basic info
   */
  async getForms(status?: 'draft' | 'published' | 'archived'): Promise<Array<Omit<FormConfig, 'blocks'>>> {
    await this.initClient(); // Initialize Supabase client

    let query = this.supabase
      .from('forms')
      .select('*')
      .is('deleted_at', null);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching forms:', error);
      throw new Error(`Failed to fetch forms: ${error.message}`);
    }

    return data.map((form: any) => ({
      id: form.id,
      title: form.title,
      description: form.description,
      createdAt: new Date(form.created_at),
      updatedAt: new Date(form.updated_at),
      status: form.status,
      version: form.version,
      maxBlocks: form.max_blocks,
      allowSaveProgress: form.allow_save_progress,
      settings: form.settings || {}
    }));
  }

  /**
   * Update form details
   * @param formId Form ID
   * @param updates Form fields to update
   */
  async updateForm(formId: string, updates: Partial<{
    title: string;
    description: string;
    status: 'draft' | 'published' | 'archived';
    maxBlocks: number;
    allowSaveProgress: boolean;
    settings: Record<string, any>;
  }>): Promise<void> {
    await this.initClient(); // Initialize Supabase client

    // Prepare updates in snake_case for database
    const dbUpdates: Record<string, any> = {};
    
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.maxBlocks !== undefined) dbUpdates.max_blocks = updates.maxBlocks;
    if (updates.allowSaveProgress !== undefined) dbUpdates.allow_save_progress = updates.allowSaveProgress;
    if (updates.settings !== undefined) dbUpdates.settings = updates.settings;

    // Only perform update if there are changes
    if (Object.keys(dbUpdates).length > 0) {
      const { error } = await this.supabase
        .from('forms')
        .update(dbUpdates)
        .eq('id', formId)
        .is('deleted_at', null);

      if (error) {
        console.error('Error updating form:', error);
        throw new Error(`Failed to update form: ${error.message}`);
      }
    }
  }

  /**
   * Delete a form (soft delete)
   * @param formId Form ID
   */
  async deleteForm(formId: string): Promise<void> {
    await this.initClient(); // Initialize Supabase client

    const { error } = await this.supabase
      .from('forms')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', formId);

    if (error) {
      console.error('Error deleting form:', error);
      throw new Error(`Failed to delete form: ${error.message}`);
    }
  }

  /**
   * Publish a form
   * @param formId Form ID
   */
  async publishForm(formId: string): Promise<void> {
    await this.initClient(); // Initialize Supabase client

    // Start a transaction
    const { error } = await this.supabase.rpc('publish_form', {
      form_id: formId,
      new_status: 'published',
      new_version: 1 // Increment the version on publish
    });

    if (error) {
      console.error('Error publishing form:', error);
      throw new Error(`Failed to publish form: ${error.message}`);
    }
  }

  /**
   * Get form statistics
   * @param formId Form ID
   * @returns Statistics for the form
   */
  async getFormStats(formId: string): Promise<{
    views: number;
    starts: number;
    completions: number;
    avgCompletionTime: number;
  }> {
    await this.initClient(); // Initialize Supabase client

    // Get sessions count
    const { count: starts, error: startsError } = await this.supabase
      .from('form_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', formId);

    if (startsError) {
      console.error('Error fetching session count:', startsError);
      throw new Error(`Failed to fetch session count: ${startsError.message}`);
    }

    // Get completion count
    const { count: completions, error: completionsError } = await this.supabase
      .from('form_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', formId);

    if (completionsError) {
      console.error('Error fetching completion count:', completionsError);
      throw new Error(`Failed to fetch completion count: ${completionsError.message}`);
    }

    // Calculate average completion time
    const { data: completedSessions, error: sessionsError } = await this.supabase
      .from('form_sessions')
      .select('started_at, completed_at')
      .eq('form_id', formId)
      .not('completed_at', 'is', null);

    if (sessionsError) {
      console.error('Error fetching completed sessions:', sessionsError);
      throw new Error(`Failed to fetch completed sessions: ${sessionsError.message}`);
    }

    let totalTime = 0;
    let count = 0;

    completedSessions.forEach((session: any) => {
      const startTime = new Date(session.started_at).getTime();
      const endTime = new Date(session.completed_at).getTime();
      const duration = (endTime - startTime) / 1000; // Duration in seconds
      
      if (duration > 0 && duration < 7200) { // Ignore sessions longer than 2 hours
        totalTime += duration;
        count++;
      }
    });

    const avgCompletionTime = count > 0 ? Math.round(totalTime / count) : 0;

    return {
      views: starts || 0, // We count views same as starts for now
      starts: starts || 0,
      completions: completions || 0,
      avgCompletionTime
    };
  }
}
