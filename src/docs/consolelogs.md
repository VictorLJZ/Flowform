
formBlocks.ts:58 🧩🧩 [BlocksSlice] Added new block with ID: 04a13b19-cbd4-4a1c-bb29-50ec91be61f6, now notifying workflow system
form-builder-content.tsx:286 Current Block: {id: '04a13b19-cbd4-4a1c-bb29-50ec91be61f6', blockTypeId: 'short_text', type: 'static', shouldRenderAIBlock: false}
form-builder-content.tsx:286 Current Block: {id: '04a13b19-cbd4-4a1c-bb29-50ec91be61f6', blockTypeId: 'short_text', type: 'static', shouldRenderAIBlock: false}
formBlocks.ts:68 🧩🔔 [BlocksSlice] Checking for onBlockAdded in store...
formBlocks.ts:70 🧩🔔 [BlocksSlice] Calling onBlockAdded(04a13b19-cbd4-4a1c-bb29-50ec91be61f6)...
formWorkflow.ts:85 🔍🔄 [WorkflowSlice] onBlockAdded called for blockId: 04a13b19-cbd4-4a1c-bb29-50ec91be61f6
formWorkflow.ts:90 🔍🔄 [WorkflowSlice] Current state: 1 blocks, 0 connections
formWorkflow.ts:99 🔍🔄 [WorkflowSlice] Found block: Short Text Question (04a13b19-cbd4-4a1c-bb29-50ec91be61f6) at order_index 0
autoConnectBlocks.ts:29 🔗🔗 [AutoConnect] Called with 1 blocks, 0 connections, targetBlockId: 04a13b19-cbd4-4a1c-bb29-50ec91be61f6
autoConnectBlocks.ts:36 🔗⚠️ [AutoConnect] Not enough blocks to create connections
formWorkflow.ts:125 ⚠️⚠️ [WorkflowSlice] No default connections needed for block 04a13b19-cbd4-4a1c-bb29-50ec91be61f6
form-builder-content.tsx:286 Current Block: {id: '04a13b19-cbd4-4a1c-bb29-50ec91be61f6', blockTypeId: 'short_text', type: 'static', shouldRenderAIBlock: false}
form-builder-content.tsx:286 Current Block: {id: '04a13b19-cbd4-4a1c-bb29-50ec91be61f6', blockTypeId: 'short_text', type: 'static', shouldRenderAIBlock: false}
form-builder-content.tsx:286 Current Block: {id: '04a13b19-cbd4-4a1c-bb29-50ec91be61f6', blockTypeId: 'short_text', type: 'static', shouldRenderAIBlock: false}
form-builder-content.tsx:286 Current Block: {id: '04a13b19-cbd4-4a1c-bb29-50ec91be61f6', blockTypeId: 'short_text', type: 'static', shouldRenderAIBlock: false}
form-builder-content.tsx:286 Current Block: {id: '04a13b19-cbd4-4a1c-bb29-50ec91be61f6', blockTypeId: 'short_text', type: 'static', shouldRenderAIBlock: false}
form-builder-content.tsx:286 Current Block: {id: '04a13b19-cbd4-4a1c-bb29-50ec91be61f6', blockTypeId: 'short_text', type: 'static', shouldRenderAIBlock: false}
formPersistence.ts:82 Saving form and blocks to Supabase...
form-builder-content.tsx:286 Current Block: {id: '04a13b19-cbd4-4a1c-bb29-50ec91be61f6', blockTypeId: 'short_text', type: 'static', shouldRenderAIBlock: false}
form-builder-content.tsx:286 Current Block: {id: '04a13b19-cbd4-4a1c-bb29-50ec91be61f6', blockTypeId: 'short_text', type: 'static', shouldRenderAIBlock: false}
formPersistence.ts:112 DEBUG - Preparing blocks for saveFormWithBlocks...
formPersistence.ts:133 DEBUG - Prepared block 0 (1qq): blockTypeId=short_text
formPersistence.ts:148 Preparing to save 1 blocks to form update
formPersistence.ts:163 DEBUG - About to call saveFormWithBlocks with formInput: {
  "form_id": "1e174cac-d6c0-4579-acd5-26fd78be7de2",
  "title": "Untitled Form",
  "description": "",
  "workspace_id": "56125fd1-69f5-4205-ba52-13b3210ee2d5",
  "created_by": "226d4bff-1c02-4c9f-9fec-f574cfe8a333",
  "status": "draft",
  "theme": {
    "colors": {
      "primary": "#0284c7",
      "background": "#ffffff",
      "text": "#1e293b",
      "accent": "#3b82f6",
      "success": "#10b981",
      "error": "#ef4444",
      "border": "#e2e8f0"
    },
    "typography": {
      "fontFamily": "Inter, sans-serif",
      "headingSize": "1.5rem",
      "bodySize": "1rem",
      "lineHeight": "1.5"
    },
    "layout": {
      "spacing": "normal",
      "containerWidth": "800px",
      "borderRadius": "0.375rem",
      "borderWidth": "1px",
      "shadowDepth": "light"
    }
  },
  "settings": {
    "theme": "default",
    "fontFamily": "inter",
    "primaryColor": "#0284c7",
    "requireSignIn": false,
    "showProgressBar": true,
    "workflow": {
      "nodePositions": {}
    }
  }
}
formPersistence.ts:164 DEBUG - backendBlocks to save: [
  {
    "id": "04a13b19-cbd4-4a1c-bb29-50ec91be61f6",
    "blockTypeId": "short_text",
    "title": "1qq",
    "description": "",
    "required": false,
    "order_index": 0,
    "settings": {
      "placeholder": "Type your answer here...",
      "maxLength": 255
    },
    "type": "static"
  }
]
fetch.ts:15 Fetch finished loading: PATCH "https://ajghquxxyenvzebhpobn.supabase.co/rest/v1/forms?form_id=eq.1e174cac-d6c0-4579-acd5-26fd78be7de2".
(anonymous) @ fetch.ts:15
(anonymous) @ fetch.ts:46
fulfilled @ fetch.ts:2
Promise.then
step @ fetch.ts:2
(anonymous) @ fetch.ts:2
push.[project]/node_modules/@supabase/supabase-js/dist/module/lib/fetch.js [app-client] (ecmascript).__awaiter @ fetch.ts:2
(anonymous) @ fetch.ts:34
then @ PostgrestBuilder.ts:101
blockTypeMapping.ts:16 DEBUG - mapToDbBlockType called with: short_text
blockTypeMapping.ts:59 DEBUG - Using short_text directly as static/short_text
fetch.ts:15 Fetch finished loading: POST "https://ajghquxxyenvzebhpobn.supabase.co/rest/v1/form_blocks?columns=%22id%22%2C%22form_id%22%2C%22type%22%2C%22subtype%22%2C%22title%22%2C%22description%22%2C%22required%22%2C%22order_index%22%2C%22settings%22&select=*".
(anonymous) @ fetch.ts:15
(anonymous) @ fetch.ts:46
fulfilled @ fetch.ts:2
Promise.then
step @ fetch.ts:2
(anonymous) @ fetch.ts:2
push.[project]/node_modules/@supabase/supabase-js/dist/module/lib/fetch.js [app-client] (ecmascript).__awaiter @ fetch.ts:2
(anonymous) @ fetch.ts:34
then @ PostgrestBuilder.ts:101
formPersistence.ts:168 DEBUG - Form saved successfully, result: {
  "success": true,
  "form": {
    "form_id": "1e174cac-d6c0-4579-acd5-26fd78be7de2",
    "workspace_id": "56125fd1-69f5-4205-ba52-13b3210ee2d5",
    "title": "Untitled Form",
    "description": "",
    "slug": "untitled-form-12",
    "status": "draft",
    "theme": {
      "colors": {
        "text": "#1e293b",
        "error": "#ef4444",
        "accent": "#3b82f6",
        "border": "#e2e8f0",
        "primary": "#0284c7",
        "success": "#10b981",
        "background": "#ffffff"
      },
      "layout": {
        "spacing": "normal",
        "borderWidth": "1px",
        "shadowDepth": "light",
        "borderRadius": "0.375rem",
        "containerWidth": "800px"
      },
      "typography": {
        "bodySize": "1rem",
        "fontFamily": "Inter, sans-serif",
        "lineHeight": "1.5",
        "headingSize": "1.5rem"
      }
    },
    "settings": {
      "theme": "default",
      "workflow": {
        "nodePositions": {}
      },
      "fontFamily": "inter",
      "primaryColor": "#0284c7",
      "requireSignIn": false,
      "showProgressBar": true
    },
    "created_at": "2025-05-07T23:33:12.085246+00:00",
    "created_by": "226d4bff-1c02-4c9f-9fec-f574cfe8a333",
    "updated_at": "2025-05-07T23:33:27.041738+00:00",
    "published_at": null
  },
  "blocks": [
    {
      "id": "04a13b19-cbd4-4a1c-bb29-50ec91be61f6",
      "form_id": "1e174cac-d6c0-4579-acd5-26fd78be7de2",
      "type": "static",
      "subtype": "short_text",
      "title": "1qq",
      "description": null,
      "required": false,
      "order_index": 0,
      "settings": {
        "maxLength": 255,
        "placeholder": "Type your answer here..."
      },
      "created_at": "2025-05-07T23:33:27.234248+00:00",
      "updated_at": "2025-05-07T23:33:27.234248+00:00"
    }
  ]
}
formPersistence.ts:260 DEBUG - Checking for dynamic blocks...
formPersistence.ts:266 DEBUG - Checking saved blocks for dynamic types:
formPersistence.ts:279 DEBUG - Saved block 04a13b19-cbd4-4a1c-bb29-50ec91be61f6 (1qq): type=static, subtype=short_text, isDynamic=false
formPersistence.ts:284 DEBUG - No dynamic blocks found, skipping dynamic config save.
formPersistence.ts:193 Saving 0 connections to workflow_edges table for form 1e174cac-d6c0-4579-acd5-26fd78be7de2
fetch.ts:15 Fetch finished loading: DELETE "https://ajghquxxyenvzebhpobn.supabase.co/rest/v1/workflow_edges?form_id=eq.1e174cac-d6c0-4579-acd5-26fd78be7de2".
(anonymous) @ fetch.ts:15
(anonymous) @ fetch.ts:46
fulfilled @ fetch.ts:2
formBlocks.ts:58 🧩🧩 [BlocksSlice] Added new block with ID: e972f8a1-9fd9-4d71-9999-b964ea6ed7fd, now notifying workflow system
form-builder-content.tsx:286 Current Block: {id: 'e972f8a1-9fd9-4d71-9999-b964ea6ed7fd', blockTypeId: 'long_text', type: 'static', shouldRenderAIBlock: false}
form-builder-content.tsx:286 Current Block: {id: 'e972f8a1-9fd9-4d71-9999-b964ea6ed7fd', blockTypeId: 'long_text', type: 'static', shouldRenderAIBlock: false}
formBlocks.ts:68 🧩🔔 [BlocksSlice] Checking for onBlockAdded in store...
formBlocks.ts:70 🧩🔔 [BlocksSlice] Calling onBlockAdded(e972f8a1-9fd9-4d71-9999-b964ea6ed7fd)...
formWorkflow.ts:85 🔍🔄 [WorkflowSlice] onBlockAdded called for blockId: e972f8a1-9fd9-4d71-9999-b964ea6ed7fd
formWorkflow.ts:90 🔍🔄 [WorkflowSlice] Current state: 2 blocks, 0 connections
formWorkflow.ts:99 🔍🔄 [WorkflowSlice] Found block: Long Text Question (e972f8a1-9fd9-4d71-9999-b964ea6ed7fd) at order_index 1
autoConnectBlocks.ts:29 🔗🔗 [AutoConnect] Called with 2 blocks, 0 connections, targetBlockId: e972f8a1-9fd9-4d71-9999-b964ea6ed7fd
autoConnectBlocks.ts:41 🔗🔍 [AutoConnect] Sorted blocks: 1qq (04a13b19-cbd4-4a1c-bb29-50ec91be61f6): index 0, Long Text Question (e972f8a1-9fd9-4d71-9999-b964ea6ed7fd): index 1
autoConnectBlocks.ts:51 🔗💾 [AutoConnect] Processing 1 blocks: e972f8a1-9fd9-4d71-9999-b964ea6ed7fd
autoConnectBlocks.ts:60 🔗❌ [AutoConnect] Skipping block e972f8a1-9fd9-4d71-9999-b964ea6ed7fd: is last block
autoConnectBlocks.ts:141 🔗📊 [AutoConnect] Returning 0 new connections
formWorkflow.ts:125 ⚠️⚠️ [WorkflowSlice] No default connections needed for block e972f8a1-9fd9-4d71-9999-b964ea6ed7fd
form-builder-content.tsx:286 Current Block: {id: 'e972f8a1-9fd9-4d71-9999-b964ea6ed7fd', blockTypeId: 'long_text', type: 'static', shouldRenderAIBlock: false}
form-builder-content.tsx:286 Current Block: {id: 'e972f8a1-9fd9-4d71-9999-b964ea6ed7fd', blockTypeId: 'long_text', type: 'static', shouldRenderAIBlock: false}
form-builder-content.tsx:286 Current Block: {id: 'e972f8a1-9fd9-4d71-9999-b964ea6ed7fd', blockTypeId: 'long_text', type: 'static', shouldRenderAIBlock: false}
form-builder-content.tsx:286 Current Block: {id: 'e972f8a1-9fd9-4d71-9999-b964ea6ed7fd', blockTypeId: 'long_text', type: 'static', shouldRenderAIBlock: false}
form-builder-content.tsx:286 Current Block: {id: 'e972f8a1-9fd9-4d71-9999-b964ea6ed7fd', blockTypeId: 'long_text', type: 'static', shouldRenderAIBlock: false}
form-builder-content.tsx:286 Current Block: {id: 'e972f8a1-9fd9-4d71-9999-b964ea6ed7fd', blockTypeId: 'long_text', type: 'static', shouldRenderAIBlock: false}
formPersistence.ts:82 Saving form and blocks to Supabase...
form-builder-content.tsx:286 Current Block: {id: 'e972f8a1-9fd9-4d71-9999-b964ea6ed7fd', blockTypeId: 'long_text', type: 'static', shouldRenderAIBlock: false}
form-builder-content.tsx:286 Current Block: {id: 'e972f8a1-9fd9-4d71-9999-b964ea6ed7fd', blockTypeId: 'long_text', type: 'static', shouldRenderAIBlock: false}
formPersistence.ts:112 DEBUG - Preparing blocks for saveFormWithBlocks...
formPersistence.ts:133 DEBUG - Prepared block 0 (1qq): blockTypeId=short_text
formPersistence.ts:133 DEBUG - Prepared block 1 (2ww): blockTypeId=long_text
formPersistence.ts:148 Preparing to save 2 blocks to form update
formPersistence.ts:163 DEBUG - About to call saveFormWithBlocks with formInput: {
  "form_id": "1e174cac-d6c0-4579-acd5-26fd78be7de2",
  "title": "Untitled Form",
  "description": "",
  "workspace_id": "56125fd1-69f5-4205-ba52-13b3210ee2d5",
  "created_by": "226d4bff-1c02-4c9f-9fec-f574cfe8a333",
  "status": "draft",
  "theme": {
    "colors": {
      "primary": "#0284c7",
      "background": "#ffffff",
      "text": "#1e293b",
      "accent": "#3b82f6",
      "success": "#10b981",
      "error": "#ef4444",
      "border": "#e2e8f0"
    },
    "typography": {
      "fontFamily": "Inter, sans-serif",
      "headingSize": "1.5rem",
      "bodySize": "1rem",
      "lineHeight": "1.5"
    },
    "layout": {
      "spacing": "normal",
      "containerWidth": "800px",
      "borderRadius": "0.375rem",
      "borderWidth": "1px",
      "shadowDepth": "light"
    }
  },
  "settings": {
    "theme": "default",
    "fontFamily": "inter",
    "primaryColor": "#0284c7",
    "requireSignIn": false,
    "showProgressBar": true,
    "workflow": {
      "nodePositions": {}
    }
  }
}
formPersistence.ts:164 DEBUG - backendBlocks to save: [
  {
    "id": "04a13b19-cbd4-4a1c-bb29-50ec91be61f6",
    "blockTypeId": "short_text",
    "title": "1qq",
    "description": "",
    "required": false,
    "order_index": 0,
    "settings": {
      "placeholder": "Type your answer here...",
      "maxLength": 255
    },
    "type": "static"
  },
  {
    "id": "e972f8a1-9fd9-4d71-9999-b964ea6ed7fd",
    "blockTypeId": "long_text",
    "title": "2ww",
    "description": "",
    "required": false,
    "order_index": 1,
    "settings": {
      "placeholder": "Type your detailed answer here...",
      "maxRows": 5
    },
    "type": "static"
  }
]
fetch.ts:15 Fetch finished loading: PATCH "https://ajghquxxyenvzebhpobn.supabase.co/rest/v1/forms?form_id=eq.1e174cac-d6c0-4579-acd5-26fd78be7de2".
(anonymous) @ fetch.ts:15
(anonymous) @ fetch.ts:46
fulfilled @ fetch.ts:2
Promise.then
step @ fetch.ts:2
(anonymous) @ fetch.ts:2
push.[project]/node_modules/@supabase/supabase-js/dist/module/lib/fetch.js [app-client] (ecmascript).__awaiter @ fetch.ts:2
(anonymous) @ fetch.ts:34
then @ PostgrestBuilder.ts:101
blockTypeMapping.ts:16 DEBUG - mapToDbBlockType called with: short_text
blockTypeMapping.ts:59 DEBUG - Using short_text directly as static/short_text
blockTypeMapping.ts:16 DEBUG - mapToDbBlockType called with: long_text
blockTypeMapping.ts:59 DEBUG - Using long_text directly as static/long_text
fetch.ts:15 Fetch finished loading: POST "https://ajghquxxyenvzebhpobn.supabase.co/rest/v1/form_blocks?columns=%22id%22%2C%22form_id%22%2C%22type%22%2C%22subtype%22%2C%22title%22%2C%22description%22%2C%22required%22%2C%22order_index%22%2C%22settings%22&select=*".
(anonymous) @ fetch.ts:15
(anonymous) @ fetch.ts:46
fulfilled @ fetch.ts:2
Promise.then
step @ fetch.ts:2
(anonymous) @ fetch.ts:2
push.[project]/node_modules/@supabase/supabase-js/dist/module/lib/fetch.js [app-client] (ecmascript).__awaiter @ fetch.ts:2
(anonymous) @ fetch.ts:34
then @ PostgrestBuilder.ts:101
formPersistence.ts:168 DEBUG - Form saved successfully, result: {
  "success": true,
  "form": {
    "form_id": "1e174cac-d6c0-4579-acd5-26fd78be7de2",
    "workspace_id": "56125fd1-69f5-4205-ba52-13b3210ee2d5",
    "title": "Untitled Form",
    "description": "",
    "slug": "untitled-form-12",
    "status": "draft",
    "theme": {
      "colors": {
        "text": "#1e293b",
        "error": "#ef4444",
        "accent": "#3b82f6",
        "border": "#e2e8f0",
        "primary": "#0284c7",
        "success": "#10b981",
        "background": "#ffffff"
      },
      "layout": {
        "spacing": "normal",
        "borderWidth": "1px",
        "shadowDepth": "light",
        "borderRadius": "0.375rem",
        "containerWidth": "800px"
      },
      "typography": {
        "bodySize": "1rem",
        "fontFamily": "Inter, sans-serif",
        "lineHeight": "1.5",
        "headingSize": "1.5rem"
      }
    },
    "settings": {
      "theme": "default",
      "workflow": {
        "nodePositions": {}
      },
      "fontFamily": "inter",
      "primaryColor": "#0284c7",
      "requireSignIn": false,
      "showProgressBar": true
    },
    "created_at": "2025-05-07T23:33:12.085246+00:00",
    "created_by": "226d4bff-1c02-4c9f-9fec-f574cfe8a333",
    "updated_at": "2025-05-07T23:33:35.215405+00:00",
    "published_at": null
  },
  "blocks": [
    {
      "id": "04a13b19-cbd4-4a1c-bb29-50ec91be61f6",
      "form_id": "1e174cac-d6c0-4579-acd5-26fd78be7de2",
      "type": "static",
      "subtype": "short_text",
      "title": "1qq",
      "description": null,
      "required": false,
      "order_index": 0,
      "settings": {
        "maxLength": 255,
        "placeholder": "Type your answer here..."
      },
      "created_at": "2025-05-07T23:33:27.234248+00:00",
      "updated_at": "2025-05-07T23:33:35.376992+00:00"
    },
    {
      "id": "e972f8a1-9fd9-4d71-9999-b964ea6ed7fd",
      "form_id": "1e174cac-d6c0-4579-acd5-26fd78be7de2",
      "type": "static",
      "subtype": "long_text",
      "title": "2ww",
      "description": null,
      "required": false,
      "order_index": 1,
      "settings": {
        "maxRows": 5,
        "placeholder": "Type your detailed answer here..."
      },
      "created_at": "2025-05-07T23:33:35.376992+00:00",
      "updated_at": "2025-05-07T23:33:35.376992+00:00"
    }
  ]
}
formPersistence.ts:260 DEBUG - Checking for dynamic blocks...
formPersistence.ts:266 DEBUG - Checking saved blocks for dynamic types:
formPersistence.ts:279 DEBUG - Saved block 04a13b19-cbd4-4a1c-bb29-50ec91be61f6 (1qq): type=static, subtype=short_text, isDynamic=false
formPersistence.ts:279 DEBUG - Saved block e972f8a1-9fd9-4d71-9999-b964ea6ed7fd (2ww): type=static, subtype=long_text, isDynamic=false
formPersistence.ts:284 DEBUG - No dynamic blocks found, skipping dynamic config save.
formPersistence.ts:193 Saving 0 connections to workflow_edges table for form 1e174cac-d6c0-4579-acd5-26fd78be7de2
fetch.ts:15 Fetch finished loading: DELETE "https://ajghquxxyenvzebhpobn.supabase.co/rest/v1/workflow_edges?form_id=eq.1e174cac-d6c0-4579-acd5-26fd78be7de2".
(anonymous) @ fetch.ts:15
(anonymous) @ fetch.ts:46
fulfilled @ fetch.ts:2
Promise.then
step @ fetch.ts:2
(anonymous) @ fetch.ts:2
push.[project]/node_modules/@supabase/supabase-js/dist/module/lib/fetch.js [app-client] (ecmascript).__awaiter @ fetch.ts:2
(anonymous) @ fetch.ts:34
then @ PostgrestBuilder.ts:101
formPersistence.ts:207 No workflow connections to save
form-builder-content.tsx:286 Current Block: {id: 'e972f8a1-9fd9-4d71-9999-b964ea6ed7fd', blockTypeId: 'long_text', type: 'static', shouldRenderAIBlock: false}
form-builder-content.tsx:286 Current Block: {id: 'e972f8a1-9fd9-4d71-9999-b964ea6ed7fd', blockTypeId: 'long_text', type: 'static', shouldRenderAIBlock: false}
autosaveForm.ts:61 Form autosaved successfully