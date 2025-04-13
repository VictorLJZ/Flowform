import { createClient } from '@/lib/supabase/client';
import { Form, FormBlock } from '@/types/supabase-types';
import { FormBlock as FrontendFormBlock } from '@/registry/blockRegistry';
import { mapToDbBlockType } from '@/utils/blockTypeMapping';
import { formatForPostgreSQL, executePostgreSQLRPC, ensureCriticalFields } from '@/utils/postgresCompatibility';
import { PostgreSQLFormData, PostgreSQLBlockData } from '@/types/postgresql-types';
import { v4 as uuidv4 } from 'uuid';

// Input types for saveFormWithBlocks
interface SaveFormInput {
  id: string;
  title: string;
  description?: string;
  workspace_id?: string;
  created_by?: string;
  status?: 'draft' | 'published' | 'archived';
  theme?: Record<string, any>;
  settings?: Record<string, any>;
}

interface SaveFormOutput {
  form: Form;
  blocks: FormBlock[];
  success: boolean;
}

/**
 * Save a complete form with all its blocks
 * Handles creating a new form or updating an existing one
 * Synchronizes blocks by adding new ones, updating changed ones, and removing deleted ones
 * Uses a database transaction via RPC for data consistency
 * 
 * This implementation uses PostgreSQL compatibility utilities to handle array dimension
 * parsing errors and ensure proper data transmission to the database.
 * 
 * @param formData Form data to save
 * @param blocks Form blocks to save
 * @returns Object containing saved form, blocks, and success status
 */
export async function saveFormWithBlocks(
  formData: SaveFormInput, 
  blocks: FrontendFormBlock[]
): Promise<SaveFormOutput> {
  const supabase = createClient();
  
  // DIAGNOSTIC: First, fetch the actual function definition from PostgreSQL to see what it expects
  try {
    console.log('🔍 Fetching PostgreSQL function definition for better understanding...');
    const { data: funcDef, error: funcError } = await supabase.rpc('pg_get_functiondef', { 
      p_function_name: 'save_form_with_blocks_typed'
    });
    
    if (funcError) {
      console.log('❌ Error getting function definition:', funcError);
    } else if (funcDef) {
      console.log('✅ PostgreSQL function definition:', funcDef);
    } else {
      console.log('⚠️ Could not retrieve function definition');
      
      // Try to get the function another way
      const { data: funcInfo, error: infoError } = await supabase
        .from('pg_proc')
        .select('*')
        .eq('proname', 'save_form_with_blocks_typed')
        .single();
      
      if (infoError) {
        console.log('❌ Error getting function info:', infoError);
      } else if (funcInfo) {
        console.log('✅ PostgreSQL function info:', funcInfo);
      }
    }
  } catch (e) {
    console.log('❌ Exception during function definition lookup:', e);
  }
  
  try {
    console.log('Saving form with blocks using type-safe approach...');
    
    // Extract and ensure critical fields with proper types
    const {
      id,
      title = 'Untitled Form',
      description = '',
      workspace_id,
      created_by,
      status = 'draft',
      theme = { name: 'default', primaryColor: '#0284c7', fontFamily: 'inter' },
      settings = { showProgressBar: true, requireSignIn: false }
    } = formData;
    
    console.log('Form data prepared with critical fields:');
    console.log('- workspace_id:', workspace_id);
    console.log('- id:', id);
    
    if (!workspace_id) {
      throw new Error('workspace_id is required for saving forms');
    }
    
    // Map frontend blocks to database format with proper type/subtype
    const preparedBlocks = blocks.map(frontendBlock => {
      const { type, subtype } = mapToDbBlockType(frontendBlock.blockTypeId);
      
      // Create block with type-safe properties
      const blockData: PostgreSQLBlockData = {
        id: frontendBlock.id,
        type,
        subtype,
        title: frontendBlock.title || '',
        description: frontendBlock.description || null,
        required: !!frontendBlock.required,
        order_index: frontendBlock.order || 0,
        settings: frontendBlock.settings || {}
      };
      
      // Add dynamic config for dynamic blocks
      if (type === 'dynamic') {
        blockData.dynamic_config = {
          starter_question: frontendBlock.settings?.startingPrompt || 'How can I help you today?',
          temperature: frontendBlock.settings?.temperature || 0.7,
          max_questions: frontendBlock.settings?.maxQuestions || 5,
          ai_instructions: frontendBlock.settings?.contextInstructions || null
        };
      }
      
      return blockData;
    });
    
    console.log(`Prepared ${preparedBlocks.length} blocks for saving`);
    
    // 🔄 SIMPLIFIED APPROACH: Always use JSON.stringify for ALL blocks data
    // PostgreSQL expects JSONB which can properly handle arrays when sent as a JSON string
    console.log('Executing type-safe PostgreSQL RPC...');
    console.log('🔎 DIAGNOSTICS: Blocks array length:', preparedBlocks.length);
    
    // CRITICAL: Convert blocks to JSON string directly - no special formatting needed
    // This is because PostgreSQL functions expect JSONB parameters which Supabase handles correctly
    // when we pass raw JSON strings
    const blocksJson = JSON.stringify(preparedBlocks);
    console.log('🔎 DIAGNOSTICS: Stringified blocks sample:', 
               blocksJson.substring(0, Math.min(blocksJson.length, 100)) + '...');
    
    // TEST 1: Check if this is an empty array case (which seems to cause problems)
    const isEmptyBlocksArray = preparedBlocks.length === 0;
    console.log('📡 TEST: Is this an empty blocks array?', isEmptyBlocksArray);
    
    // TEST 2: Generate some alternative JSONB formats to try
    const alternativeFormat1 = JSON.stringify({ data: preparedBlocks }); // Wrap in object
    const alternativeFormat2 = preparedBlocks.length > 0 ? blocksJson : JSON.stringify({});
    const alternativeFormat3 = preparedBlocks.length > 0 ? blocksJson : '{"data":[]}'; // Empty array in object
    
    console.log('📡 TEST: Alternative format 1 (wrapped):', alternativeFormat1);
    console.log('📡 TEST: Alternative format 2 (empty object):', alternativeFormat2);
    console.log('📡 TEST: Alternative format 3 (empty array in object):', alternativeFormat3);
    
    // CRITICAL TEST: Choose which format to use for the blocks data
    // We'll try the alternative format 3 (empty array in object) for empty arrays
    const chosenBlocksFormat = isEmptyBlocksArray ? alternativeFormat3 : blocksJson;
    
    // Create parameters object with the chosen blocks format
    const rpcParams = {
      p_form_id: id,
      p_title: title,
      p_description: description,
      p_workspace_id: workspace_id,
      p_created_by: created_by,
      p_status: status,
      p_theme: theme,
      p_settings: settings,
      // Use our chosen format for PostgreSQL JSONB compatibility
      p_blocks_data: chosenBlocksFormat
    };
    
    console.log('🔎 DIAGNOSTICS: Using blocks format:', isEmptyBlocksArray ? 'Alternative format 3' : 'Standard JSON');
    
    // 👇 Log what we're sending to PostgreSQL in extreme detail
    console.log('🔎 DIAGNOSTICS: RPC params:', rpcParams);
    console.log('🔎 DIAGNOSTICS: p_blocks_data type:', typeof rpcParams.p_blocks_data);
    console.log('🔎 DIAGNOSTICS: p_blocks_data value:', rpcParams.p_blocks_data);
    
    // Add SQL logging for debugging - construct what the SQL would look like
    try {
      const mockSql = `
-- MOCK SQL for debugging purposes
SELECT save_form_with_blocks_typed(
  '${id}'::uuid,
  '${title}'::text,
  '${description}'::text,
  '${workspace_id}'::uuid,
  ${created_by ? `'${created_by}'::uuid` : 'NULL'},
  '${status}'::text,
  '${JSON.stringify(theme)}'::jsonb,
  '${JSON.stringify(settings)}'::jsonb,
  '${chosenBlocksFormat.replace(/'/g, "''")}'
);
      `;
      
      // EXPLICIT EMPTY ARRAY TEST: Show how PostgreSQL would handle an explicit empty array
      const explicitEmptyArrayTest = `
-- EXPLICIT EMPTY ARRAY TEST
-- This shows different ways PostgreSQL can receive empty arrays:

-- Test 1: As a JSONB string (what we're doing)
SELECT '${chosenBlocksFormat}'::jsonb;

-- Test 2: As a typed empty array (PostgreSQL native syntax)
SELECT ARRAY[]::jsonb[];

-- Test 3: As a JSON object with empty array property
SELECT '{"data":[]}'::jsonb;
      `;
      console.log('🔬 MOCK SQL THAT WOULD BE EXECUTED:\n', mockSql);
      if (isEmptyBlocksArray) {
        console.log('📡 EXPLICIT EMPTY ARRAY TESTS:\n', explicitEmptyArrayTest);
      }
    } catch (err) {
      console.log('🔬 Error creating mock SQL:', err);
    }
    
    // Intercept the network request for deep inspection
    console.log('🌐 Attempting to intercept the network request...');
    
    // Log raw request body for analysis
    console.log('🌐 Raw Request Details:')
    try {
      // Here we use a trick to catch the raw request data
      const originalFetch = window.fetch;
      window.fetch = async function(input, init) {
        // Only intercept our specific RPC call
        const url = input.toString();
        if (url.includes('rpc/save_form_with_blocks_typed')) {
          console.log('🌐 NETWORK: Intercepted request URL:', url);
          console.log('🌐 NETWORK: Request method:', init?.method);
          console.log('🌐 NETWORK: Request headers:', init?.headers);
          
          // Log the request payload in different formats for comparison
          if (init?.body) {
            const rawBody = init.body.toString();
            console.log('🌐 NETWORK: Raw request body:', rawBody);
            
            try {
              // Try to parse it as JSON to check the format
              const jsonBody = JSON.parse(rawBody);
              console.log('🌐 NETWORK: Parsed JSON body:', jsonBody);
              
              // Specifically inspect the blocks data
              if (jsonBody.p_blocks_data) {
                console.log('🌐 NETWORK: p_blocks_data type:', typeof jsonBody.p_blocks_data);
                console.log('🌐 NETWORK: p_blocks_data value sample:', 
                          typeof jsonBody.p_blocks_data === 'string' ?
                          jsonBody.p_blocks_data.substring(0, 100) : jsonBody.p_blocks_data);
              }
            } catch (e) {
              console.log('🌐 NETWORK: Failed to parse request body as JSON:', e);
            }
          }
        }
        
        // Restore original fetch and make the actual call
        window.fetch = originalFetch;
        return originalFetch(input, init);
      };
    } catch (e) {
      console.log('🌐 Failed to intercept request:', e);
    }
    
    // Prepare the form data object - NO stringification needed for jsonb parameters
    const formDataObj = {
      id: id,
      title: title,
      description: description,
      workspace_id: workspace_id,
      created_by: created_by,
      status: status,
      theme: theme,
      settings: settings
    };

    // Deep inspection of each field and its type
    console.log('🔬 DEEP DIAGNOSTICS - Form Data Object:');
    console.log('  id:', { value: id, type: typeof id, nullCheck: id === null, undefinedCheck: id === undefined });
    console.log('  workspace_id:', { value: workspace_id, type: typeof workspace_id, nullCheck: workspace_id === null, undefinedCheck: workspace_id === undefined });
    console.log('  created_by:', { value: created_by, type: typeof created_by, nullCheck: created_by === null, undefinedCheck: created_by === undefined });
    
    // No need for stringification - PostgreSQL expects actual objects for jsonb
    console.log('🔬 DEEP DIAGNOSTICS - Form object direct:', formDataObj);
    
    // Process blocks data similarly - no stringification needed
    // Map blocks to database format using the same approach as before
    // BUT convert any string IDs to proper UUIDs
    
    // Let's call our PostgreSQL function directly with a custom RPC call that includes proper type handling
    // This is a more direct approach that bypasses the JSON serialization issues
    
    // Create a special call to save_form_with_blocks_empty_safe that properly handles UUIDs
    console.log('🔬 Using specialized PostgreSQL call with proper UUID handling');
    
    // First, prepare the blocks data with proper UUIDs
    const blocksData = blocks.map(frontendBlock => {
      const { type, subtype } = mapToDbBlockType(frontendBlock.blockTypeId);
      
      // Generate a proper UUID if the ID isn't already a UUID
      const blockId = frontendBlock.id.includes('-') && 
                     frontendBlock.id.length === 36 ? 
                     frontendBlock.id : uuidv4();
      
      console.log(`Converting block ID from ${frontendBlock.id} to UUID ${blockId}`);
      
      return {
        // For PostgreSQL UUID columns, force proper UUID formatting
        id: blockId,
        type,
        subtype,
        title: frontendBlock.title || '',
        description: frontendBlock.description || null,
        required: !!frontendBlock.required,
        order_index: frontendBlock.order || 0,
        settings: frontendBlock.settings || {}
      };
    })
    console.log('🔬 DEEP DIAGNOSTICS - Direct blocks data:', blocksData);
    
    // First, try a different approach by directly calling a prepared SQL statement that explicitly casts the IDs as UUIDs
    // This bypasses the JSON type conversion issues
    console.log('🔬 DEEP DIAGNOSTICS - Creating direct SQL call with explicit UUID casting');
    
    // Create a SQL statement with proper UUID casting
    const sqlStatement = `
      SELECT save_form_with_blocks_typed(
        $1::uuid, -- form_id
        $2::text, -- title
        $3::text, -- description
        $4::uuid, -- workspace_id
        $5::uuid, -- created_by
        $6::text, -- status
        $7::jsonb, -- theme
        $8::jsonb, -- settings
        $9::jsonb -- blocks
      ) as result;
    `;
    
    // Extract values in the right order for the SQL query
    const sqlParams = [
      formDataObj.id,
      formDataObj.title,
      formDataObj.description || '',
      formDataObj.workspace_id,
      formDataObj.created_by,
      formDataObj.status,
      formDataObj.theme,
      formDataObj.settings,
      blocksData
    ];
    
    console.log('🔬 DEEP DIAGNOSTICS - SQL params:', sqlParams);
    
    // Execute the prepared statement using a let for result handling
    let result: any = null;
    let resultError: any = null;
    
    // Try the direct SQL approach first
    const sqlResult = await supabase.rpc('execute_sql_with_params', {
      p_sql: sqlStatement,
      p_params: sqlParams
    });
    
    // Check if this worked
    if (sqlResult.error) {
      console.log('⚠️ Direct SQL approach failed:', sqlResult.error);
      console.log('🔄 Falling back to RPC call with object passing');
      
      // Fall back to the RPC approach
      const rpcResult = await supabase.rpc('save_form_with_blocks_empty_safe', {
        p_form_data: formDataObj,
        p_blocks_data: blocksData
      });
      
      // Store these results
      result = rpcResult.data;
      resultError = rpcResult.error;
    } else {
      // The SQL approach worked
      result = sqlResult.data;
      resultError = null;
    }
    
    // Now use our variables for the rest of the function
    const data = result;
    const error = resultError;
    
    // Handle errors if any
    if (error) {
      console.error('Error saving form with blocks:', error);
      throw error;
    }
    
    // Ensure data exists before accessing properties
    if (!data) {
      throw new Error('Received null data from save_form_with_blocks_empty_safe');
    }

    // Log the response to diagnose the structure
    console.log('Response from save_form_with_blocks_empty_safe:', data);
    
    // Handle the response format from our empty-safe function
    // Our function now returns: { form: {...}, blocks: [...], success: true }
    if (!data.form) {
      console.error('Unexpected response format:', data);
      throw new Error('Invalid response format from save_form_with_blocks_empty_safe');
    }

    console.log('Form saved successfully! ID:', data.form.id);
    return {
      form: data.form as Form,
      blocks: Array.isArray(data.blocks) ? data.blocks : [],
      success: true
    };
  } catch (error) {
    // Final error handling
    console.error('Failed to save form with blocks:', error);
    throw error;
  }
}
