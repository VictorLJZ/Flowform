import { createClient } from '@/lib/supabase/client';
import { FormVersion, FormBlockVersion, VersionedResponse } from '@/types/form-version-types';

/**
 * Fetches form responses with version information to support displaying responses
 * for forms that have been modified over time.
 * 
 * @param formId The ID of the form
 * @param limit Maximum number of responses to fetch
 * @param offset Pagination offset
 * @returns Array of versioned responses with their associated blocks
 */
export async function getVersionedFormResponses(
  formId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{
  responses: VersionedResponse[],
  totalCount: number
}> {
  if (!formId) {
    return { responses: [], totalCount: 0 };
  }
  
  const supabase = createClient();
  
  try {
    // Step 1: Get form responses with version information
    const { data: responses, error: responseError, count } = await supabase
      .from('form_responses')
      .select(`
        *,
        form_version_id
      `, { count: 'exact' })
      .eq('form_id', formId)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (responseError) {
      console.error('Error fetching versioned responses:', responseError);
      throw responseError;
    }
    
    if (!responses || responses.length === 0) {
      return { responses: [], totalCount: 0 };
    }
    
    // Step 2: Get the form versions for these responses
    const versionIds = responses
      .map(r => r.form_version_id)
      .filter(Boolean) as string[];
      
    let formVersions: FormVersion[] = [];
    
    if (versionIds.length > 0) {
      const { data: versions, error: versionError } = await supabase
        .from('form_versions')
        .select('*')
        .in('id', versionIds);
        
      if (versionError) {
        console.error('Error fetching form versions:', versionError);
        throw versionError;
      }
      
      formVersions = versions || [];
    }
    
    // Step 3: Get the block versions for these form versions
    let blockVersions: FormBlockVersion[] = [];
    
    if (versionIds.length > 0) {
      const { data: blocks, error: blockError } = await supabase
        .from('form_block_versions')
        .select('*')
        .in('form_version_id', versionIds);
        
      if (blockError) {
        console.error('Error fetching block versions:', blockError);
        throw blockError;
      }
      
      blockVersions = blocks || [];
    }
    
    // Step 4: Get all static answers and dynamic responses
    const responseIds = responses.map(r => r.id);
    
    const { data: staticAnswers, error: staticError } = await supabase
      .from('static_block_answers')
      .select('*')
      .in('response_id', responseIds);
      
    if (staticError) {
      console.error('Error fetching static answers:', staticError);
      throw staticError;
    }
    
    const { data: dynamicResponses, error: dynamicError } = await supabase
      .from('dynamic_block_responses')
      .select('*')
      .in('response_id', responseIds);
      
    if (dynamicError) {
      console.error('Error fetching dynamic responses:', dynamicError);
      throw dynamicError;
    }
    
    // Step 5: Build the versioned responses
    const versionedResponses: VersionedResponse[] = responses.map(response => {
      // Find the form version for this response
      const formVersion = formVersions.find(v => v.id === response.form_version_id);
      
      // Find the block versions for this form version
      const versionBlocks = response.form_version_id 
        ? blockVersions.filter(b => b.form_version_id === response.form_version_id)
        : [];
        
      // Find the static answers for this response
      const responseStaticAnswers = staticAnswers
        ? staticAnswers.filter(a => a.response_id === response.id)
        : [];
        
      // Find the dynamic responses for this response
      const responseDynamicResponses = dynamicResponses
        ? dynamicResponses.filter(d => d.response_id === response.id)
        : [];
        
      return {
        ...response,
        form_version: formVersion,
        version_blocks: versionBlocks,
        static_answers: responseStaticAnswers,
        dynamic_responses: responseDynamicResponses
      };
    });
    
    return {
      responses: versionedResponses,
      totalCount: count || versionedResponses.length
    };
  } catch (error) {
    console.error('Error in getVersionedFormResponses:', error);
    throw error;
  }
}

/**
 * Get all form versions for a specific form
 * @param formId The ID of the form
 * @returns All versions of the form
 */
export async function getFormVersions(
  formId: string
): Promise<{ 
  versions: FormVersion[],
  currentVersion: FormVersion | null 
}> {
  if (!formId) {
    return { versions: [], currentVersion: null };
  }
  
  const supabase = createClient();
  
  try {
    const { data: versions, error } = await supabase
      .from('form_versions')
      .select('*')
      .eq('form_id', formId)
      .order('version_number', { ascending: false });
      
    if (error) {
      console.error('Error fetching form versions:', error);
      throw error;
    }
    
    return {
      versions: versions || [],
      currentVersion: versions && versions.length > 0 ? versions[0] : null
    };
  } catch (error) {
    console.error('Error in getFormVersions:', error);
    throw error;
  }
}
