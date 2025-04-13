formBuilderStore.ts:196 ==== DEBUG: FormBuilder saveForm ====
formBuilderStore.ts:197 Save Data being prepared: {id: 'd86e3353-0087-43a8-a1cb-17b0a399424d', title: 'Untitled Form', description: '', workspace_id: 'f9f45bf0-4835-4947-87df-df8c42da7410', created_by: '226d4bff-1c02-4c9f-9fec-f574cfe8a333', …}
formBuilderStore.ts:198 Blocks to save: [{…}]
formBuilderStore.ts:202 FormBuilder Block 0 settings: {placeholder: 'Type your answer here...', maxLength: 255}
saveFormWithBlocks.ts:48 🔍 Fetching PostgreSQL function definition for better understanding...
fetch.ts:15 
            
            
           POST https://ajghquxxyenvzebhpobn.supabase.co/rest/v1/rpc/pg_get_functiondef 404 (Not Found)
(anonymous) @ fetch.ts:15
(anonymous) @ fetch.ts:46
fulfilled @ fetch.ts:2
Promise.then
step @ fetch.ts:2
(anonymous) @ fetch.ts:2
push.[project]/node_modules/@supabase/supabase-js/dist/module/lib/fetch.js [app-client] (ecmascript).__awaiter @ fetch.ts:2
(anonymous) @ fetch.ts:34
then @ PostgrestBuilder.ts:101
saveFormWithBlocks.ts:54 ❌ Error getting function definition: {code: 'PGRST202', details: 'Searched for the function public.pg_get_functionde…r, but no matches were found in the schema cache.', hint: null, message: 'Could not find the function public.pg_get_functiondef(p_function_name) in the schema cache'}
saveFormWithBlocks.ts:78 Saving form with blocks using type-safe approach...
saveFormWithBlocks.ts:92 Form data prepared with critical fields:
saveFormWithBlocks.ts:93 - workspace_id: f9f45bf0-4835-4947-87df-df8c42da7410
saveFormWithBlocks.ts:94 - id: d86e3353-0087-43a8-a1cb-17b0a399424d
saveFormWithBlocks.ts:129 Prepared 1 blocks for saving
saveFormWithBlocks.ts:133 Executing type-safe PostgreSQL RPC...
saveFormWithBlocks.ts:134 🔎 DIAGNOSTICS: Blocks array length: 1
saveFormWithBlocks.ts:140 🔎 DIAGNOSTICS: Stringified blocks sample: [{"id":"block-1744588326029","type":"static","subtype":"text_short","title":"wd","description":null,...
saveFormWithBlocks.ts:145 📡 TEST: Is this an empty blocks array? false
saveFormWithBlocks.ts:152 📡 TEST: Alternative format 1 (wrapped): {"data":[{"id":"block-1744588326029","type":"static","subtype":"text_short","title":"wd","description":null,"required":false,"order_index":0,"settings":{"placeholder":"Type your answer here...","maxLength":255}}]}
saveFormWithBlocks.ts:153 📡 TEST: Alternative format 2 (empty object): [{"id":"block-1744588326029","type":"static","subtype":"text_short","title":"wd","description":null,"required":false,"order_index":0,"settings":{"placeholder":"Type your answer here...","maxLength":255}}]
saveFormWithBlocks.ts:154 📡 TEST: Alternative format 3 (empty array in object): [{"id":"block-1744588326029","type":"static","subtype":"text_short","title":"wd","description":null,"required":false,"order_index":0,"settings":{"placeholder":"Type your answer here...","maxLength":255}}]
saveFormWithBlocks.ts:174 🔎 DIAGNOSTICS: Using blocks format: Standard JSON
saveFormWithBlocks.ts:177 🔎 DIAGNOSTICS: RPC params: {p_form_id: 'd86e3353-0087-43a8-a1cb-17b0a399424d', p_title: 'Untitled Form', p_description: '', p_workspace_id: 'f9f45bf0-4835-4947-87df-df8c42da7410', p_created_by: '226d4bff-1c02-4c9f-9fec-f574cfe8a333', …}
saveFormWithBlocks.ts:178 🔎 DIAGNOSTICS: p_blocks_data type: string
saveFormWithBlocks.ts:179 🔎 DIAGNOSTICS: p_blocks_data value: [{"id":"block-1744588326029","type":"static","subtype":"text_short","title":"wd","description":null,"required":false,"order_index":0,"settings":{"placeholder":"Type your answer here...","maxLength":255}}]
saveFormWithBlocks.ts:212 🔬 MOCK SQL THAT WOULD BE EXECUTED:
 
-- MOCK SQL for debugging purposes
SELECT save_form_with_blocks_typed(
  'd86e3353-0087-43a8-a1cb-17b0a399424d'::uuid,
  'Untitled Form'::text,
  ''::text,
  'f9f45bf0-4835-4947-87df-df8c42da7410'::uuid,
  '226d4bff-1c02-4c9f-9fec-f574cfe8a333'::uuid,
  'draft'::text,
  '{"name":"default","primaryColor":"#0284c7","fontFamily":"inter"}'::jsonb,
  '{"showProgressBar":true,"requireSignIn":false}'::jsonb,
  '[{"id":"block-1744588326029","type":"static","subtype":"text_short","title":"wd","description":null,"required":false,"order_index":0,"settings":{"placeholder":"Type your answer here...","maxLength":255}}]'
);
      
saveFormWithBlocks.ts:221 🌐 Attempting to intercept the network request...
saveFormWithBlocks.ts:224 🌐 Raw Request Details:
saveFormWithBlocks.ts:280 🔬 DEEP DIAGNOSTICS - Form Data Object:
saveFormWithBlocks.ts:281   id: {value: 'd86e3353-0087-43a8-a1cb-17b0a399424d', type: 'string', nullCheck: false, undefinedCheck: false}
saveFormWithBlocks.ts:282   workspace_id: {value: 'f9f45bf0-4835-4947-87df-df8c42da7410', type: 'string', nullCheck: false, undefinedCheck: false}
fetch.ts:15 Fetch failed loading: POST "https://ajghquxxyenvzebhpobn.supabase.co/rest/v1/rpc/pg_get_functiondef".
(anonymous) @ fetch.ts:15
(anonymous) @ fetch.ts:46
fulfilled @ fetch.ts:2
Promise.then
step @ fetch.ts:2
(anonymous) @ fetch.ts:2
push.[project]/node_modules/@supabase/supabase-js/dist/module/lib/fetch.js [app-client] (ecmascript).__awaiter @ fetch.ts:2
(anonymous) @ fetch.ts:34
then @ PostgrestBuilder.ts:101
saveFormWithBlocks.ts:283   created_by: {value: '226d4bff-1c02-4c9f-9fec-f574cfe8a333', type: 'string', nullCheck: false, undefinedCheck: false}
saveFormWithBlocks.ts:286 🔬 DEEP DIAGNOSTICS - Form object direct: {id: 'd86e3353-0087-43a8-a1cb-17b0a399424d', title: 'Untitled Form', description: '', workspace_id: 'f9f45bf0-4835-4947-87df-df8c42da7410', created_by: '226d4bff-1c02-4c9f-9fec-f574cfe8a333', …}
saveFormWithBlocks.ts:296 🔬 Using specialized PostgreSQL call with proper UUID handling
saveFormWithBlocks.ts:307 Converting block ID from block-1744588326029 to UUID ddeb31c2-ebee-4025-83fe-faad30831df1
saveFormWithBlocks.ts:321 🔬 DEEP DIAGNOSTICS - Direct blocks data: [{…}]
saveFormWithBlocks.ts:325 🔬 DEEP DIAGNOSTICS - Creating direct SQL call with explicit UUID casting
saveFormWithBlocks.ts:355 🔬 DEEP DIAGNOSTICS - SQL params: (9) ['d86e3353-0087-43a8-a1cb-17b0a399424d', 'Untitled Form', '', 'f9f45bf0-4835-4947-87df-df8c42da7410', '226d4bff-1c02-4c9f-9fec-f574cfe8a333', 'draft', {…}, {…}, Array(1)]
fetch.ts:15 Fetch failed loading: POST "https://ajghquxxyenvzebhpobn.supabase.co/rest/v1/rpc/execute_sql_with_params".
(anonymous) @ fetch.ts:15
(anonymous) @ fetch.ts:46
fulfilled @ fetch.ts:2
Promise.then
step @ fetch.ts:2
(anonymous) @ fetch.ts:2
push.[project]/node_modules/@supabase/supabase-js/dist/module/lib/fetch.js [app-client] (ecmascript).__awaiter @ fetch.ts:2
(anonymous) @ fetch.ts:34
then @ PostgrestBuilder.ts:101
fetch.ts:15 
            
            
           POST https://ajghquxxyenvzebhpobn.supabase.co/rest/v1/rpc/execute_sql_with_params 404 (Not Found)
(anonymous) @ fetch.ts:15
(anonymous) @ fetch.ts:46
fulfilled @ fetch.ts:2
Promise.then
step @ fetch.ts:2
(anonymous) @ fetch.ts:2
push.[project]/node_modules/@supabase/supabase-js/dist/module/lib/fetch.js [app-client] (ecmascript).__awaiter @ fetch.ts:2
(anonymous) @ fetch.ts:34
then @ PostgrestBuilder.ts:101
saveFormWithBlocks.ts:369 ⚠️ Direct SQL approach failed: {code: 'PGRST202', details: 'Searched for the function public.execute_sql_with_…r, but no matches were found in the schema cache.', hint: 'Perhaps you meant to call the function public.save_form_with_blocks', message: 'Could not find the function public.execute_sql_with_params(p_params, p_sql) in the schema cache'}
saveFormWithBlocks.ts:370 🔄 Falling back to RPC call with object passing
fetch.ts:15 Fetch finished loading: POST "https://ajghquxxyenvzebhpobn.supabase.co/rest/v1/rpc/save_form_with_blocks_empty_safe".
(anonymous) @ fetch.ts:15
(anonymous) @ fetch.ts:46
fulfilled @ fetch.ts:2
Promise.then
step @ fetch.ts:2
(anonymous) @ fetch.ts:2
push.[project]/node_modules/@supabase/supabase-js/dist/module/lib/fetch.js [app-client] (ecmascript).__awaiter @ fetch.ts:2
(anonymous) @ fetch.ts:34
then @ PostgrestBuilder.ts:101
saveFormWithBlocks.ts:403 Response from save_form_with_blocks_empty_safe: {form: {…}, blocks: Array(1), success: true}
saveFormWithBlocks.ts:412 Form saved successfully! ID: undefined
formBuilderStore.ts:216 Form saved successfully with transaction: {form: {…}, blocks: Array(1), success: true}