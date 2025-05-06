useFormSubmission.ts:119 ⚠️ Analytics not available for block submit tracking
useFormSubmission.useCallback[trackBlockSubmission] @ useFormSubmission.ts:119
useFormSubmission.useCallback[submitAnswer] @ useFormSubmission.ts:169
BlockRenderer.slideWrapperProps.onNext @ BlockRenderer.tsx:136
executeDispatch @ react-dom-client.development.js:16426
runWithFiberInDEV @ react-dom-client.development.js:1510
processDispatchQueue @ react-dom-client.development.js:16476
(anonymous) @ react-dom-client.development.js:17074
batchedUpdates$1 @ react-dom-client.development.js:3253
dispatchEventForPluginEventSystem @ react-dom-client.development.js:16630
dispatchEvent @ react-dom-client.development.js:20716
dispatchDiscreteEvent @ react-dom-client.development.js:20684
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: true}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
BlockRenderer.tsx:74 BlockRenderer - rendering block: {id: '595742ea-c3ea-4ecd-8035-dcd3891fff1c', blockTypeId: 'short_text', currentAnswer: '666', hasAnalytics: true, hasBlockRef: true}
BlockRenderer.tsx:84 🔍 DEBUG BlockRenderer - analytics.blockRef for block 595742ea-c3ea-4ecd-8035-dcd3891fff1c: {blockRef: {…}, refCurrent: null}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: true}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
BlockRenderer.tsx:74 BlockRenderer - rendering block: {id: '595742ea-c3ea-4ecd-8035-dcd3891fff1c', blockTypeId: 'short_text', currentAnswer: '666', hasAnalytics: true, hasBlockRef: true}
BlockRenderer.tsx:84 🔍 DEBUG BlockRenderer - analytics.blockRef for block 595742ea-c3ea-4ecd-8035-dcd3891fff1c: {blockRef: {…}, refCurrent: null}
SlideWrapper.tsx:77 [SlideWrapper] Mode: viewer isBuilder: false onNext exists: true
useBlockViewTracking.ts:44 🔍 DEBUG: useBlockViewTracking for block 595742ea-c3ea-4ecd-8035-dcd3891fff1c {disabled: false, hasTrackedCurrent: true, blockRefExists: true}
useBlockViewTracking.ts:52 🚫 DEBUG: Skipping block tracking for 595742ea-c3ea-4ecd-8035-dcd3891fff1c {reason: 'already tracked'}
useBlockViewTracking.ts:44 🔍 DEBUG: useBlockViewTracking for block undefined {disabled: false, hasTrackedCurrent: false, blockRefExists: false}
useBlockViewTracking.ts:52 🚫 DEBUG: Skipping block tracking for undefined {reason: 'missing blockId'}
useFormSubmission.ts:186 [useFormSubmission] Submitting payload: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', blockId: '595742ea-c3ea-4ecd-8035-dcd3891fff1c', blockType: 'static', answer: '666', isCompletion: false, …}
hot-reloader-client.tsx:371 [Fast Refresh] rebuilding
hot-reloader-client.tsx:116 [Fast Refresh] done in 31ms
hot-reloader-client.tsx:371 [Fast Refresh] rebuilding
hot-reloader-client.tsx:116 [Fast Refresh] done in 31ms
useFormSubmission.ts:189 Fetch finished loading: PUT "http://localhost:3000/api/forms/c65e6371-e3da-44ee-8c89-55f104f1e6c2/sessions".
useFormSubmission.useCallback[submitAnswer] @ useFormSubmission.ts:189
await in useFormSubmission.useCallback[submitAnswer]
BlockRenderer.slideWrapperProps.onNext @ BlockRenderer.tsx:136
executeDispatch @ react-dom-client.development.js:16426
runWithFiberInDEV @ react-dom-client.development.js:1510
processDispatchQueue @ react-dom-client.development.js:16476
(anonymous) @ react-dom-client.development.js:17074
batchedUpdates$1 @ react-dom-client.development.js:3253
dispatchEventForPluginEventSystem @ react-dom-client.development.js:16630
dispatchEvent @ react-dom-client.development.js:20716
dispatchDiscreteEvent @ react-dom-client.development.js:20684
useFormSubmission.ts:205 [useFormSubmission] Submission response: {completed: false, nextBlock: {…}}
page.tsx:131 [Analytics] Track submit: {block_id: '595742ea-c3ea-4ecd-8035-dcd3891fff1c', block_type: 'static'}
useFormCompletionTracking.ts:50 [TRACKING DEBUG] trackCompletion called with: {additionalMetadata: {…}, formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', hasTracked: false, disabled: false}
useFormCompletionTracking.ts:73 [TRACKING DEBUG] Got visitor ID: df98cd1f-f91d-4ab2-ac03-9d7c34c2d171
useFormCompletionTracking.ts:81 [TRACKING DEBUG] Preparing form completion tracking payload: {form_id: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', response_id: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', visitor_id: 'df98cd1f-f91d-4ab2-ac03-9d7c34c2d171', total_time_seconds: 15, metadata_keys: Array(0), …}
useFormCompletionTracking.ts:92 [TRACKING DEBUG] Calling trackFormCompletionClient with parameters: c65e6371-e3da-44ee-8c89-55f104f1e6c2 b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f
trackFormCompletionClient.ts:24 [TRACKING DEBUG] trackFormCompletionClient called with: {form_id: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', response_id: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', metadata_keys: Array(4), metadata_values: {…}}
trackFormCompletionClient.ts:55 [ANALYTICS] Tracking form completion with data: {form_id: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', response_id: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', visitor_id: 'df98cd1f-f91d-4ab2-ac03-9d7c34c2d171', total_time_seconds: 15}
useFormSubmission.ts:238 [SubmitAnswer] Not last question, moving next
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: true}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
BlockRenderer.tsx:74 BlockRenderer - rendering block: {id: 'e01b2d31-1d36-405a-affb-ccba9e9f3c51', blockTypeId: 'long_text', currentAnswer: '666', hasAnalytics: true, hasBlockRef: true}
BlockRenderer.tsx:84 🔍 DEBUG BlockRenderer - analytics.blockRef for block e01b2d31-1d36-405a-affb-ccba9e9f3c51: {blockRef: {…}, refCurrent: null}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: true}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
BlockRenderer.tsx:74 BlockRenderer - rendering block: {id: 'e01b2d31-1d36-405a-affb-ccba9e9f3c51', blockTypeId: 'long_text', currentAnswer: '666', hasAnalytics: true, hasBlockRef: true}
BlockRenderer.tsx:84 🔍 DEBUG BlockRenderer - analytics.blockRef for block e01b2d31-1d36-405a-affb-ccba9e9f3c51: {blockRef: {…}, refCurrent: null}
SlideWrapper.tsx:77 [SlideWrapper] Mode: viewer isBuilder: false onNext exists: true
SlideWrapper.tsx:192 [BlockTracking] Block e01b2d31-1d36-405a-affb-ccba9e9f3c51 ref attached to DOM
SlideWrapper.tsx:196 📍 DEBUG SlideWrapper: {id: 'e01b2d31-1d36-405a-affb-ccba9e9f3c51', containerRef === blockRef: true, containerRefValue: div.w-full.h-full.flex-1, blockRefValue: div.w-full.h-full.flex-1}
useBlockViewTracking.ts:44 🔍 DEBUG: useBlockViewTracking for block e01b2d31-1d36-405a-affb-ccba9e9f3c51 {disabled: false, hasTrackedCurrent: false, blockRefExists: true}
useBlockViewTracking.ts:102 📣 DEBUG: Starting observation of block e01b2d31-1d36-405a-affb-ccba9e9f3c51 {element: div.w-full.h-full.flex-1, threshold: 0.5}
useAnalytics.ts:92 [ANALYTICS DEBUG] useAnalytics detected changes: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useBlockViewTracking.ts:44 🔍 DEBUG: useBlockViewTracking for block undefined {disabled: false, hasTrackedCurrent: false, blockRefExists: false}
useBlockViewTracking.ts:52 🚫 DEBUG: Skipping block tracking for undefined {reason: 'missing blockId'}
SlideWrapper.tsx:77 [SlideWrapper] Mode: viewer isBuilder: false onNext exists: true
SlideWrapper.tsx:192 [BlockTracking] Block e01b2d31-1d36-405a-affb-ccba9e9f3c51 ref attached to DOM
SlideWrapper.tsx:196 📍 DEBUG SlideWrapper: {id: 'e01b2d31-1d36-405a-affb-ccba9e9f3c51', containerRef === blockRef: true, containerRefValue: div.w-full.h-full.flex-1, blockRefValue: div.w-full.h-full.flex-1}
useBlockViewTracking.ts:44 🔍 DEBUG: useBlockViewTracking for block e01b2d31-1d36-405a-affb-ccba9e9f3c51 {disabled: false, hasTrackedCurrent: false, blockRefExists: true}
useBlockViewTracking.ts:102 📣 DEBUG: Starting observation of block e01b2d31-1d36-405a-affb-ccba9e9f3c51 {element: div.w-full.h-full.flex-1, threshold: 0.5}
useAnalytics.ts:92 [ANALYTICS DEBUG] useAnalytics detected changes: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
trackFormCompletionClient.ts:80 [ANALYTICS] Sending form completion request to API
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: true}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
BlockRenderer.tsx:74 BlockRenderer - rendering block: {id: 'e01b2d31-1d36-405a-affb-ccba9e9f3c51', blockTypeId: 'long_text', currentAnswer: '', hasAnalytics: true, hasBlockRef: true}
BlockRenderer.tsx:84 🔍 DEBUG BlockRenderer - analytics.blockRef for block e01b2d31-1d36-405a-affb-ccba9e9f3c51: {blockRef: {…}, refCurrent: null}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: true}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
BlockRenderer.tsx:74 BlockRenderer - rendering block: {id: 'e01b2d31-1d36-405a-affb-ccba9e9f3c51', blockTypeId: 'long_text', currentAnswer: '', hasAnalytics: true, hasBlockRef: true}
BlockRenderer.tsx:84 🔍 DEBUG BlockRenderer - analytics.blockRef for block e01b2d31-1d36-405a-affb-ccba9e9f3c51: {blockRef: {…}, refCurrent: null}
SlideWrapper.tsx:77 [SlideWrapper] Mode: viewer isBuilder: false onNext exists: true
useBlockViewTracking.ts:44 🔍 DEBUG: useBlockViewTracking for block e01b2d31-1d36-405a-affb-ccba9e9f3c51 {disabled: false, hasTrackedCurrent: false, blockRefExists: true}
useBlockViewTracking.ts:102 📣 DEBUG: Starting observation of block e01b2d31-1d36-405a-affb-ccba9e9f3c51 {element: div.w-full.h-full.flex-1, threshold: 0.5}
useBlockViewTracking.ts:44 🔍 DEBUG: useBlockViewTracking for block undefined {disabled: false, hasTrackedCurrent: false, blockRefExists: false}
useBlockViewTracking.ts:52 🚫 DEBUG: Skipping block tracking for undefined {reason: 'missing blockId'}
hot-reloader-client.tsx:371 [Fast Refresh] rebuilding
useBlockViewTracking.ts:78 👀 BLOCK TRACKING VERIFICATION: About to track block e01b2d31-1d36-405a-affb-ccba9e9f3c51
trackBlockViewClient.ts:22 Fetch finished loading: POST "http://localhost:3000/api/analytics/track/block-view".
trackBlockViewClient @ trackBlockViewClient.ts:22
useBlockViewTracking.useEffect @ useBlockViewTracking.ts:81
hot-reloader-client.tsx:116 [Fast Refresh] done in 574ms
trackFormCompletionClient.ts:108 [ANALYTICS] Form completion tracking successful
useFormCompletionTracking.ts:108 [TRACKING DEBUG] Successfully called completion tracking client
trackFormCompletionClient.ts:81 Fetch finished loading: POST "http://localhost:3000/api/analytics/track/form-completion".
trackWithRetry @ trackFormCompletionClient.ts:81
await in trackWithRetry
trackFormCompletionClient @ trackFormCompletionClient.ts:121
useFormCompletionTracking.useCallback[trackCompletion] @ useFormCompletionTracking.ts:97
FormViewerPage.useCallback[trackSubmitFn] @ page.tsx:134
useFormSubmission.useCallback[submitAnswer] @ useFormSubmission.ts:210
await in useFormSubmission.useCallback[submitAnswer]
BlockRenderer.slideWrapperProps.onNext @ BlockRenderer.tsx:136
executeDispatch @ react-dom-client.development.js:16426
runWithFiberInDEV @ react-dom-client.development.js:1510
processDispatchQueue @ react-dom-client.development.js:16476
(anonymous) @ react-dom-client.development.js:17074
batchedUpdates$1 @ react-dom-client.development.js:3253
dispatchEventForPluginEventSystem @ react-dom-client.development.js:16630
dispatchEvent @ react-dom-client.development.js:20716
dispatchDiscreteEvent @ react-dom-client.development.js:20684
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: true}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
BlockRenderer.tsx:74 BlockRenderer - rendering block: {id: 'e01b2d31-1d36-405a-affb-ccba9e9f3c51', blockTypeId: 'long_text', currentAnswer: 's', hasAnalytics: true, hasBlockRef: true}
BlockRenderer.tsx:84 🔍 DEBUG BlockRenderer - analytics.blockRef for block e01b2d31-1d36-405a-affb-ccba9e9f3c51: {blockRef: {…}, refCurrent: null}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: true}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
BlockRenderer.tsx:74 BlockRenderer - rendering block: {id: 'e01b2d31-1d36-405a-affb-ccba9e9f3c51', blockTypeId: 'long_text', currentAnswer: 's', hasAnalytics: true, hasBlockRef: true}
BlockRenderer.tsx:84 🔍 DEBUG BlockRenderer - analytics.blockRef for block e01b2d31-1d36-405a-affb-ccba9e9f3c51: {blockRef: {…}, refCurrent: null}
SlideWrapper.tsx:77 [SlideWrapper] Mode: viewer isBuilder: false onNext exists: true
useBlockViewTracking.ts:44 🔍 DEBUG: useBlockViewTracking for block e01b2d31-1d36-405a-affb-ccba9e9f3c51 {disabled: false, hasTrackedCurrent: true, blockRefExists: true}
useBlockViewTracking.ts:52 🚫 DEBUG: Skipping block tracking for e01b2d31-1d36-405a-affb-ccba9e9f3c51 {reason: 'already tracked'}
useBlockViewTracking.ts:44 🔍 DEBUG: useBlockViewTracking for block undefined {disabled: false, hasTrackedCurrent: false, blockRefExists: false}
useBlockViewTracking.ts:52 🚫 DEBUG: Skipping block tracking for undefined {reason: 'missing blockId'}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: true}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
BlockRenderer.tsx:74 BlockRenderer - rendering block: {id: 'e01b2d31-1d36-405a-affb-ccba9e9f3c51', blockTypeId: 'long_text', currentAnswer: 'ss', hasAnalytics: true, hasBlockRef: true}
BlockRenderer.tsx:84 🔍 DEBUG BlockRenderer - analytics.blockRef for block e01b2d31-1d36-405a-affb-ccba9e9f3c51: {blockRef: {…}, refCurrent: null}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: true}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
BlockRenderer.tsx:74 BlockRenderer - rendering block: {id: 'e01b2d31-1d36-405a-affb-ccba9e9f3c51', blockTypeId: 'long_text', currentAnswer: 'ss', hasAnalytics: true, hasBlockRef: true}
BlockRenderer.tsx:84 🔍 DEBUG BlockRenderer - analytics.blockRef for block e01b2d31-1d36-405a-affb-ccba9e9f3c51: {blockRef: {…}, refCurrent: null}
SlideWrapper.tsx:77 [SlideWrapper] Mode: viewer isBuilder: false onNext exists: true
useBlockViewTracking.ts:44 🔍 DEBUG: useBlockViewTracking for block e01b2d31-1d36-405a-affb-ccba9e9f3c51 {disabled: false, hasTrackedCurrent: true, blockRefExists: true}
useBlockViewTracking.ts:52 🚫 DEBUG: Skipping block tracking for e01b2d31-1d36-405a-affb-ccba9e9f3c51 {reason: 'already tracked'}
useBlockViewTracking.ts:44 🔍 DEBUG: useBlockViewTracking for block undefined {disabled: false, hasTrackedCurrent: false, blockRefExists: false}
useBlockViewTracking.ts:52 🚫 DEBUG: Skipping block tracking for undefined {reason: 'missing blockId'}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: true}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
BlockRenderer.tsx:74 BlockRenderer - rendering block: {id: 'e01b2d31-1d36-405a-affb-ccba9e9f3c51', blockTypeId: 'long_text', currentAnswer: 'sss', hasAnalytics: true, hasBlockRef: true}
BlockRenderer.tsx:84 🔍 DEBUG BlockRenderer - analytics.blockRef for block e01b2d31-1d36-405a-affb-ccba9e9f3c51: {blockRef: {…}, refCurrent: null}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: true}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
BlockRenderer.tsx:74 BlockRenderer - rendering block: {id: 'e01b2d31-1d36-405a-affb-ccba9e9f3c51', blockTypeId: 'long_text', currentAnswer: 'sss', hasAnalytics: true, hasBlockRef: true}
BlockRenderer.tsx:84 🔍 DEBUG BlockRenderer - analytics.blockRef for block e01b2d31-1d36-405a-affb-ccba9e9f3c51: {blockRef: {…}, refCurrent: null}
SlideWrapper.tsx:77 [SlideWrapper] Mode: viewer isBuilder: false onNext exists: true
useBlockViewTracking.ts:44 🔍 DEBUG: useBlockViewTracking for block e01b2d31-1d36-405a-affb-ccba9e9f3c51 {disabled: false, hasTrackedCurrent: true, blockRefExists: true}
useBlockViewTracking.ts:52 🚫 DEBUG: Skipping block tracking for e01b2d31-1d36-405a-affb-ccba9e9f3c51 {reason: 'already tracked'}
useBlockViewTracking.ts:44 🔍 DEBUG: useBlockViewTracking for block undefined {disabled: false, hasTrackedCurrent: false, blockRefExists: false}
useBlockViewTracking.ts:52 🚫 DEBUG: Skipping block tracking for undefined {reason: 'missing blockId'}
useFormSubmission.ts:119 ⚠️ Analytics not available for block submit tracking
useFormSubmission.useCallback[trackBlockSubmission] @ useFormSubmission.ts:119
useFormSubmission.useCallback[submitAnswer] @ useFormSubmission.ts:169
BlockRenderer.slideWrapperProps.onNext @ BlockRenderer.tsx:136
executeDispatch @ react-dom-client.development.js:16426
runWithFiberInDEV @ react-dom-client.development.js:1510
processDispatchQueue @ react-dom-client.development.js:16476
(anonymous) @ react-dom-client.development.js:17074
batchedUpdates$1 @ react-dom-client.development.js:3253
dispatchEventForPluginEventSystem @ react-dom-client.development.js:16630
dispatchEvent @ react-dom-client.development.js:20716
dispatchDiscreteEvent @ react-dom-client.development.js:20684
<button>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:326
SlideWrapper @ SlideWrapper.tsx:177
react-stack-bottom-frame @ react-dom-client.development.js:23949
renderWithHooksAgain @ react-dom-client.development.js:5178
renderWithHooks @ react-dom-client.development.js:5090
updateFunctionComponent @ react-dom-client.development.js:8327
beginWork @ react-dom-client.development.js:9944
runWithFiberInDEV @ react-dom-client.development.js:1510
performUnitOfWork @ react-dom-client.development.js:15119
workLoopSync @ react-dom-client.development.js:14943
renderRootSync @ react-dom-client.development.js:14923
performWorkOnRoot @ react-dom-client.development.js:14410
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16274
performWorkUntilDeadline @ scheduler.development.js:45
<SlideWrapper>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:326
TextAreaBlock @ TextAreaBlock.tsx:103
react-stack-bottom-frame @ react-dom-client.development.js:23949
renderWithHooksAgain @ react-dom-client.development.js:5178
renderWithHooks @ react-dom-client.development.js:5090
updateFunctionComponent @ react-dom-client.development.js:8327
beginWork @ react-dom-client.development.js:9944
runWithFiberInDEV @ react-dom-client.development.js:1510
performUnitOfWork @ react-dom-client.development.js:15119
workLoopSync @ react-dom-client.development.js:14943
renderRootSync @ react-dom-client.development.js:14923
performWorkOnRoot @ react-dom-client.development.js:14410
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16274
performWorkUntilDeadline @ scheduler.development.js:45
<TextAreaBlock>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:326
renderBlock @ BlockRenderer.tsx:183
BlockRenderer @ BlockRenderer.tsx:203
react-stack-bottom-frame @ react-dom-client.development.js:23949
renderWithHooksAgain @ react-dom-client.development.js:5178
renderWithHooks @ react-dom-client.development.js:5090
updateFunctionComponent @ react-dom-client.development.js:8327
beginWork @ react-dom-client.development.js:9944
runWithFiberInDEV @ react-dom-client.development.js:1510
performUnitOfWork @ react-dom-client.development.js:15119
workLoopSync @ react-dom-client.development.js:14943
renderRootSync @ react-dom-client.development.js:14923
performWorkOnRoot @ react-dom-client.development.js:14410
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16274
performWorkUntilDeadline @ scheduler.development.js:45
<BlockRenderer>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:326
FormViewerPage @ page.tsx:283
react-stack-bottom-frame @ react-dom-client.development.js:23949
renderWithHooksAgain @ react-dom-client.development.js:5178
renderWithHooks @ react-dom-client.development.js:5090
updateFunctionComponent @ react-dom-client.development.js:8327
beginWork @ react-dom-client.development.js:9944
runWithFiberInDEV @ react-dom-client.development.js:1510
performUnitOfWork @ react-dom-client.development.js:15119
workLoopSync @ react-dom-client.development.js:14943
renderRootSync @ react-dom-client.development.js:14923
performWorkOnRoot @ react-dom-client.development.js:14410
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16274
performWorkUntilDeadline @ scheduler.development.js:45
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: true}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
BlockRenderer.tsx:74 BlockRenderer - rendering block: {id: 'e01b2d31-1d36-405a-affb-ccba9e9f3c51', blockTypeId: 'long_text', currentAnswer: 'sss', hasAnalytics: true, hasBlockRef: true}
BlockRenderer.tsx:84 🔍 DEBUG BlockRenderer - analytics.blockRef for block e01b2d31-1d36-405a-affb-ccba9e9f3c51: {blockRef: {…}, refCurrent: null}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: true}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
BlockRenderer.tsx:74 BlockRenderer - rendering block: {id: 'e01b2d31-1d36-405a-affb-ccba9e9f3c51', blockTypeId: 'long_text', currentAnswer: 'sss', hasAnalytics: true, hasBlockRef: true}
BlockRenderer.tsx:84 🔍 DEBUG BlockRenderer - analytics.blockRef for block e01b2d31-1d36-405a-affb-ccba9e9f3c51: {blockRef: {…}, refCurrent: null}
SlideWrapper.tsx:77 [SlideWrapper] Mode: viewer isBuilder: false onNext exists: true
useBlockViewTracking.ts:44 🔍 DEBUG: useBlockViewTracking for block e01b2d31-1d36-405a-affb-ccba9e9f3c51 {disabled: false, hasTrackedCurrent: true, blockRefExists: true}
useBlockViewTracking.ts:52 🚫 DEBUG: Skipping block tracking for e01b2d31-1d36-405a-affb-ccba9e9f3c51 {reason: 'already tracked'}
useBlockViewTracking.ts:44 🔍 DEBUG: useBlockViewTracking for block undefined {disabled: false, hasTrackedCurrent: false, blockRefExists: false}
useBlockViewTracking.ts:52 🚫 DEBUG: Skipping block tracking for undefined {reason: 'missing blockId'}
useFormSubmission.ts:186 [useFormSubmission] Submitting payload: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', blockId: 'e01b2d31-1d36-405a-affb-ccba9e9f3c51', blockType: 'static', answer: 'sss', isCompletion: true, …}
hot-reloader-client.tsx:371 [Fast Refresh] rebuilding
hot-reloader-client.tsx:116 [Fast Refresh] done in 58ms
useFormSubmission.ts:189 Fetch finished loading: PUT "http://localhost:3000/api/forms/c65e6371-e3da-44ee-8c89-55f104f1e6c2/sessions".
useFormSubmission.useCallback[submitAnswer] @ useFormSubmission.ts:189
await in useFormSubmission.useCallback[submitAnswer]
BlockRenderer.slideWrapperProps.onNext @ BlockRenderer.tsx:136
executeDispatch @ react-dom-client.development.js:16426
runWithFiberInDEV @ react-dom-client.development.js:1510
processDispatchQueue @ react-dom-client.development.js:16476
(anonymous) @ react-dom-client.development.js:17074
batchedUpdates$1 @ react-dom-client.development.js:3253
dispatchEventForPluginEventSystem @ react-dom-client.development.js:16630
dispatchEvent @ react-dom-client.development.js:20716
dispatchDiscreteEvent @ react-dom-client.development.js:20684
<button>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:326
SlideWrapper @ SlideWrapper.tsx:177
react-stack-bottom-frame @ react-dom-client.development.js:23949
renderWithHooksAgain @ react-dom-client.development.js:5178
renderWithHooks @ react-dom-client.development.js:5090
updateFunctionComponent @ react-dom-client.development.js:8327
beginWork @ react-dom-client.development.js:9944
runWithFiberInDEV @ react-dom-client.development.js:1510
performUnitOfWork @ react-dom-client.development.js:15119
workLoopSync @ react-dom-client.development.js:14943
renderRootSync @ react-dom-client.development.js:14923
performWorkOnRoot @ react-dom-client.development.js:14410
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16274
performWorkUntilDeadline @ scheduler.development.js:45
<SlideWrapper>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:326
TextAreaBlock @ TextAreaBlock.tsx:103
react-stack-bottom-frame @ react-dom-client.development.js:23949
renderWithHooksAgain @ react-dom-client.development.js:5178
renderWithHooks @ react-dom-client.development.js:5090
updateFunctionComponent @ react-dom-client.development.js:8327
beginWork @ react-dom-client.development.js:9944
runWithFiberInDEV @ react-dom-client.development.js:1510
performUnitOfWork @ react-dom-client.development.js:15119
workLoopSync @ react-dom-client.development.js:14943
renderRootSync @ react-dom-client.development.js:14923
performWorkOnRoot @ react-dom-client.development.js:14410
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16274
performWorkUntilDeadline @ scheduler.development.js:45
<TextAreaBlock>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:326
renderBlock @ BlockRenderer.tsx:183
BlockRenderer @ BlockRenderer.tsx:203
react-stack-bottom-frame @ react-dom-client.development.js:23949
renderWithHooksAgain @ react-dom-client.development.js:5178
renderWithHooks @ react-dom-client.development.js:5090
updateFunctionComponent @ react-dom-client.development.js:8327
beginWork @ react-dom-client.development.js:9944
runWithFiberInDEV @ react-dom-client.development.js:1510
performUnitOfWork @ react-dom-client.development.js:15119
workLoopSync @ react-dom-client.development.js:14943
renderRootSync @ react-dom-client.development.js:14923
performWorkOnRoot @ react-dom-client.development.js:14410
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16274
performWorkUntilDeadline @ scheduler.development.js:45
<BlockRenderer>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:326
FormViewerPage @ page.tsx:283
react-stack-bottom-frame @ react-dom-client.development.js:23949
renderWithHooksAgain @ react-dom-client.development.js:5178
renderWithHooks @ react-dom-client.development.js:5090
updateFunctionComponent @ react-dom-client.development.js:8327
beginWork @ react-dom-client.development.js:9944
runWithFiberInDEV @ react-dom-client.development.js:1510
performUnitOfWork @ react-dom-client.development.js:15119
workLoopSync @ react-dom-client.development.js:14943
renderRootSync @ react-dom-client.development.js:14923
performWorkOnRoot @ react-dom-client.development.js:14410
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16274
performWorkUntilDeadline @ scheduler.development.js:45
useFormSubmission.ts:205 [useFormSubmission] Submission response: {completed: true, message: 'Form completed'}
page.tsx:131 [Analytics] Track submit: {block_id: 'e01b2d31-1d36-405a-affb-ccba9e9f3c51', block_type: 'static'}
useFormCompletionTracking.ts:50 [TRACKING DEBUG] trackCompletion called with: {additionalMetadata: {…}, formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', hasTracked: true, disabled: false}
useFormCompletionTracking.ts:60 [TRACKING DEBUG] Skipping form completion tracking due to: {disabled: false, formId_missing: false, responseId_missing: false, already_tracked: true}
useFormCompletionTracking.useCallback[trackCompletion] @ useFormCompletionTracking.ts:60
FormViewerPage.useCallback[trackSubmitFn] @ page.tsx:134
useFormSubmission.useCallback[submitAnswer] @ useFormSubmission.ts:210
await in useFormSubmission.useCallback[submitAnswer]
BlockRenderer.slideWrapperProps.onNext @ BlockRenderer.tsx:136
executeDispatch @ react-dom-client.development.js:16426
runWithFiberInDEV @ react-dom-client.development.js:1510
processDispatchQueue @ react-dom-client.development.js:16476
(anonymous) @ react-dom-client.development.js:17074
batchedUpdates$1 @ react-dom-client.development.js:3253
dispatchEventForPluginEventSystem @ react-dom-client.development.js:16630
dispatchEvent @ react-dom-client.development.js:20716
dispatchDiscreteEvent @ react-dom-client.development.js:20684
<button>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:326
SlideWrapper @ SlideWrapper.tsx:177
react-stack-bottom-frame @ react-dom-client.development.js:23949
renderWithHooksAgain @ react-dom-client.development.js:5178
renderWithHooks @ react-dom-client.development.js:5090
updateFunctionComponent @ react-dom-client.development.js:8327
beginWork @ react-dom-client.development.js:9944
runWithFiberInDEV @ react-dom-client.development.js:1510
performUnitOfWork @ react-dom-client.development.js:15119
workLoopSync @ react-dom-client.development.js:14943
renderRootSync @ react-dom-client.development.js:14923
performWorkOnRoot @ react-dom-client.development.js:14410
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16274
performWorkUntilDeadline @ scheduler.development.js:45
<SlideWrapper>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:326
TextAreaBlock @ TextAreaBlock.tsx:103
react-stack-bottom-frame @ react-dom-client.development.js:23949
renderWithHooksAgain @ react-dom-client.development.js:5178
renderWithHooks @ react-dom-client.development.js:5090
updateFunctionComponent @ react-dom-client.development.js:8327
beginWork @ react-dom-client.development.js:9944
runWithFiberInDEV @ react-dom-client.development.js:1510
performUnitOfWork @ react-dom-client.development.js:15119
workLoopSync @ react-dom-client.development.js:14943
renderRootSync @ react-dom-client.development.js:14923
performWorkOnRoot @ react-dom-client.development.js:14410
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16274
performWorkUntilDeadline @ scheduler.development.js:45
<TextAreaBlock>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:326
renderBlock @ BlockRenderer.tsx:183
BlockRenderer @ BlockRenderer.tsx:203
react-stack-bottom-frame @ react-dom-client.development.js:23949
renderWithHooksAgain @ react-dom-client.development.js:5178
renderWithHooks @ react-dom-client.development.js:5090
updateFunctionComponent @ react-dom-client.development.js:8327
beginWork @ react-dom-client.development.js:9944
runWithFiberInDEV @ react-dom-client.development.js:1510
performUnitOfWork @ react-dom-client.development.js:15119
workLoopSync @ react-dom-client.development.js:14943
renderRootSync @ react-dom-client.development.js:14923
performWorkOnRoot @ react-dom-client.development.js:14410
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16274
performWorkUntilDeadline @ scheduler.development.js:45
<BlockRenderer>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:326
FormViewerPage @ page.tsx:283
react-stack-bottom-frame @ react-dom-client.development.js:23949
renderWithHooksAgain @ react-dom-client.development.js:5178
renderWithHooks @ react-dom-client.development.js:5090
updateFunctionComponent @ react-dom-client.development.js:8327
beginWork @ react-dom-client.development.js:9944
runWithFiberInDEV @ react-dom-client.development.js:1510
performUnitOfWork @ react-dom-client.development.js:15119
workLoopSync @ react-dom-client.development.js:14943
renderRootSync @ react-dom-client.development.js:14923
performWorkOnRoot @ react-dom-client.development.js:14410
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16274
performWorkUntilDeadline @ scheduler.development.js:45
useFormSubmission.ts:216 [SubmitAnswer] Last question, marking form complete
useFormSubmission.ts:222 [TRACKING DEBUG] useFormSubmission calling onFormCompleteRef with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', has_ref: true, payload: {…}}
page.tsx:144 [Analytics] Track completion: {}
useFormCompletionTracking.ts:50 [TRACKING DEBUG] trackCompletion called with: {additionalMetadata: {…}, formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', hasTracked: true, disabled: false}
useFormCompletionTracking.ts:60 [TRACKING DEBUG] Skipping form completion tracking due to: {disabled: false, formId_missing: false, responseId_missing: false, already_tracked: true}
useFormCompletionTracking.useCallback[trackCompletion] @ useFormCompletionTracking.ts:60
FormViewerPage.useCallback[trackCompletionFn] @ page.tsx:146
useFormSubmission.useCallback[submitAnswer] @ useFormSubmission.ts:232
await in useFormSubmission.useCallback[submitAnswer]
BlockRenderer.slideWrapperProps.onNext @ BlockRenderer.tsx:136
executeDispatch @ react-dom-client.development.js:16426
runWithFiberInDEV @ react-dom-client.development.js:1510
processDispatchQueue @ react-dom-client.development.js:16476
(anonymous) @ react-dom-client.development.js:17074
batchedUpdates$1 @ react-dom-client.development.js:3253
dispatchEventForPluginEventSystem @ react-dom-client.development.js:16630
dispatchEvent @ react-dom-client.development.js:20716
dispatchDiscreteEvent @ react-dom-client.development.js:20684
<button>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:326
SlideWrapper @ SlideWrapper.tsx:177
react-stack-bottom-frame @ react-dom-client.development.js:23949
renderWithHooksAgain @ react-dom-client.development.js:5178
renderWithHooks @ react-dom-client.development.js:5090
updateFunctionComponent @ react-dom-client.development.js:8327
beginWork @ react-dom-client.development.js:9944
runWithFiberInDEV @ react-dom-client.development.js:1510
performUnitOfWork @ react-dom-client.development.js:15119
workLoopSync @ react-dom-client.development.js:14943
renderRootSync @ react-dom-client.development.js:14923
performWorkOnRoot @ react-dom-client.development.js:14410
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16274
performWorkUntilDeadline @ scheduler.development.js:45
<SlideWrapper>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:326
TextAreaBlock @ TextAreaBlock.tsx:103
react-stack-bottom-frame @ react-dom-client.development.js:23949
renderWithHooksAgain @ react-dom-client.development.js:5178
renderWithHooks @ react-dom-client.development.js:5090
updateFunctionComponent @ react-dom-client.development.js:8327
beginWork @ react-dom-client.development.js:9944
runWithFiberInDEV @ react-dom-client.development.js:1510
performUnitOfWork @ react-dom-client.development.js:15119
workLoopSync @ react-dom-client.development.js:14943
renderRootSync @ react-dom-client.development.js:14923
performWorkOnRoot @ react-dom-client.development.js:14410
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16274
performWorkUntilDeadline @ scheduler.development.js:45
<TextAreaBlock>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:326
renderBlock @ BlockRenderer.tsx:183
BlockRenderer @ BlockRenderer.tsx:203
react-stack-bottom-frame @ react-dom-client.development.js:23949
renderWithHooksAgain @ react-dom-client.development.js:5178
renderWithHooks @ react-dom-client.development.js:5090
updateFunctionComponent @ react-dom-client.development.js:8327
beginWork @ react-dom-client.development.js:9944
runWithFiberInDEV @ react-dom-client.development.js:1510
performUnitOfWork @ react-dom-client.development.js:15119
workLoopSync @ react-dom-client.development.js:14943
renderRootSync @ react-dom-client.development.js:14923
performWorkOnRoot @ react-dom-client.development.js:14410
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16274
performWorkUntilDeadline @ scheduler.development.js:45
<BlockRenderer>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:326
FormViewerPage @ page.tsx:283
react-stack-bottom-frame @ react-dom-client.development.js:23949
renderWithHooksAgain @ react-dom-client.development.js:5178
renderWithHooks @ react-dom-client.development.js:5090
updateFunctionComponent @ react-dom-client.development.js:8327
beginWork @ react-dom-client.development.js:9944
runWithFiberInDEV @ react-dom-client.development.js:1510
performUnitOfWork @ react-dom-client.development.js:15119
workLoopSync @ react-dom-client.development.js:14943
renderRootSync @ react-dom-client.development.js:14923
performWorkOnRoot @ react-dom-client.development.js:14410
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16274
performWorkUntilDeadline @ scheduler.development.js:45
useFormSubmission.ts:233 [TRACKING DEBUG] onFormCompleteRef.current completed successfully
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useBlockViewTracking.ts:44 🔍 DEBUG: useBlockViewTracking for block undefined {disabled: false, hasTrackedCurrent: false, blockRefExists: false}blockRefExists: falsedisabled: falsehasTrackedCurrent: false[[Prototype]]: Object
useBlockViewTracking.ts:52 🚫 DEBUG: Skipping block tracking for undefined {reason: 'missing blockId'}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}
useFormCompletionTracking.ts:29 [TRACKING DEBUG] useFormCompletionTracking initialized with: {formId: 'c65e6371-e3da-44ee-8c89-55f104f1e6c2', responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, has_metadata: false}
useAnalytics.ts:102 [ANALYTICS DEBUG] useAnalytics re-rendering return value with: {responseId: 'b26cb7c5-9c2e-4d91-b2fb-bb04d7ae045f', disabled: false, formCompletionDisabled: false}