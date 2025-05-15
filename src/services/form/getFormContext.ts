import { createClient } from '@/lib/supabase/server';
import { DbDynamicBlockConfig } from '@/types/block/DbBlock';
import { FormContextData, StaticQuestionContext, DynamicQuestionContext } from '@/types/form-service-types';

// Cache for form context data - key is formId
const formContextCache = new Map<string, { 
  data: FormContextData; 
  timestamp: number; 
  version: number;
}>();

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

/**
 * Get the context of a form including all questions
 * 
 * @param formId - The ID of the form
 * @param currentBlockId - The ID of the current block (to exclude from context)
 * @param forceRefresh - Whether to force a cache refresh
 * @returns Form context data for AI processing
 */
export async function getFormContext(
  formId: string, 
  currentBlockId: string,
  forceRefresh = false
): Promise<FormContextData> {
  // Create cache key (based only on formId, not currentBlockId)
  const cacheKey = formId;
  const now = Date.now();
  
  // Check cache if not forcing refresh
  if (!forceRefresh && formContextCache.has(cacheKey)) {
    const cachedData = formContextCache.get(cacheKey)!;
    
    // Return cached data if not expired
    if (now - cachedData.timestamp < CACHE_EXPIRATION) {
      // Deep clone the cached data before returning to prevent mutations
      const clonedData = JSON.parse(JSON.stringify(cachedData.data)) as FormContextData;
      
      // Filter out the current block from the results
      return filterCurrentBlock(clonedData, currentBlockId);
    }
  }
  
  const supabase = await createClient();
  
  try {
    // 1. Get form info
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('form_id, title')
      .eq('form_id', formId)
      .single();
    
    if (formError) {
      console.error('Error fetching form:', formError);
      throw formError;
    }
    
    // 2. Get all blocks for this form
    const { data: blocks, error: blocksError } = await supabase
      .from('form_blocks')
      .select('*')
      .eq('form_id', formId)
      .order('order_index');
    
    if (blocksError) {
      console.error('Error fetching form blocks:', blocksError);
      throw blocksError;
    }
    
    // 3. Get dynamic block configs for all dynamic blocks
    const dynamicBlockIds = blocks
      .filter(block => block.type === 'dynamic')
      .map(block => block.id);
    
    let dynamicConfigs: DbDynamicBlockConfig[] = [];
    
    if (dynamicBlockIds.length > 0) {
      const { data: configs, error: configsError } = await supabase
        .from('dynamic_block_configs')
        .select('*')
        .in('block_id', dynamicBlockIds);
      
      if (configsError) {
        console.error('Error fetching dynamic block configs:', configsError);
        throw configsError;
      }
      
      dynamicConfigs = configs || [];
    }
    
    // 4. Format data
    const staticQuestions: StaticQuestionContext[] = blocks
      .filter(block => block.type === 'static')
      .map(block => ({
        id: block.id,
        title: block.title,
        description: block.description,
        type: 'static' as const,
        subtype: block.subtype
      }));
    
    const dynamicBlocks: DynamicQuestionContext[] = blocks
      .filter(block => block.type === 'dynamic')
      .map(block => {
        const config = dynamicConfigs.find(c => c.block_id === block.id);
        return {
          id: block.id,
          title: block.title,
          description: block.description,
          type: 'dynamic' as const,
          starter_type: "question", content: config?.starter_question || ''
        };
      });
    
    // 5. Construct complete form context
    const formContext: FormContextData = {
      formId,
      formTitle: form.title,
      staticQuestions,
      dynamicBlocks
    };
    
    // 6. Update cache with version number
    const newCacheEntry = {
      data: formContext,
      timestamp: now,
      version: (formContextCache.get(cacheKey)?.version || 0) + 1
    };
    
    formContextCache.set(cacheKey, newCacheEntry);
    
    // 7. Return filtered data (removing current block)
    return filterCurrentBlock(JSON.parse(JSON.stringify(formContext)), currentBlockId);
    
  } catch (error) {
    console.error('Error getting form context:', error);
    throw error;
  }
}

/**
 * Filter out the current block from the form context
 */
function filterCurrentBlock(context: FormContextData, currentBlockId: string): FormContextData {
  return {
    ...context,
    staticQuestions: context.staticQuestions.filter(q => q.id !== currentBlockId),
    dynamicBlocks: context.dynamicBlocks.filter(b => b.id !== currentBlockId)
  };
}

/**
 * Mark a form's context as dirty (needs refresh)
 * Call this when a form or its blocks are updated
 */
export function invalidateFormContextCache(formId: string): void {
  formContextCache.delete(formId);
}

/**
 * Format the form context into a prompt-friendly string
 */
export function formatFormContext(context: FormContextData): string {
  let prompt = `This question is part of a form titled "${context.formTitle}" which contains the following questions:\n\n`;
  
  // Add static questions
  if (context.staticQuestions.length > 0) {
    prompt += "Static Questions:\n";
    context.staticQuestions.forEach((q, i) => {
      prompt += `${i+1}. ${q.title}${q.description ? ` - ${q.description}` : ''} (Type: ${q.subtype})\n`;
    });
    prompt += "\n";
  }
  
  // Add other dynamic blocks
  if (context.dynamicBlocks.length > 0) {
    prompt += "Other Dynamic Conversation Blocks:\n";
    context.dynamicBlocks.forEach((b, i) => {
      prompt += `${i+1}. Block: ${b.title}\n   Starter Question: "${b.content}"\n`;
    });
  }
  
  return prompt;
}
