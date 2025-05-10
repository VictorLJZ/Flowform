web-client-content-script.js:2 Uncaught (in promise) Error: Access to storage is not allowed from this context.
react-dom-client.development.js:24914 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
workspaceStore.ts:341 [workspaceStore] Store rehydrated with workspaces: 2
10Fetch finished loading: GET "<URL>".
useWorkspaceSWR.ts:145 [WorkspaceFetcher:currentWorkspace] Fetching with workspace: 56125fd1-69f5-4205-ba52-13b3210ee2d5
useWorkspaceSWR.ts:145 [WorkspaceFetcher:recent-forms] Fetching with workspace: 56125fd1-69f5-4205-ba52-13b3210ee2d5
useRecentForms.ts:15 [useRecentForms] Fetching recent forms for workspace: 56125fd1-69f5-4205-ba52-13b3210ee2d5
workspace-provider.tsx:177 [WorkspaceProvider] No workspaces available, skipping workspace selection
workspace-provider.tsx:177 [WorkspaceProvider] No workspaces available, skipping workspace selection
useRecentForms.ts:30 [useRecentForms] Fetched 2 forms for workspace 56125fd1-69f5-4205-ba52-13b3210ee2d5
hot-reloader-client.tsx:371 [Fast Refresh] rebuilding
hot-reloader-client.tsx:116 [Fast Refresh] done in 28ms
hot-reloader-client.tsx:371 [Fast Refresh] rebuilding
hot-reloader-client.tsx:116 [Fast Refresh] done in 56ms
useWorkspaceInitialization.ts:36 [useWorkspaceInitialization] Successfully fetched workspaces: {count: 2, currentWorkspaceId: '56125fd1-69f5-4205-ba52-13b3210ee2d5'}
useWorkspaceInitialization.ts:60 [useWorkspaceInitialization] No manual selection, using refreshWorkspaces
workspaceStore.ts:230 [workspaceStore:refreshWorkspaces] Starting refresh...
workspaceStore.ts:254 [workspaceStore:refreshWorkspaces] Refreshed: {workspaceCount: 2, currentId: '56125fd1-69f5-4205-ba52-13b3210ee2d5', isManuallySelected: false}
workspaceStore.ts:278 [workspaceStore:refreshWorkspaces] Current workspace exists, keeping selection: 56125fd1-69f5-4205-ba52-13b3210ee2d5
workspace-provider.tsx:208 [WorkspaceProvider] Using existing workspace selection: 56125fd1-69f5-4205-ba52-13b3210ee2d5
workspaceStore.ts:126 [workspaceStore:setWorkspaces] Skipping redundant update - workspace list unchanged
getFormWithBlocksClient.ts:23 🔥👾🔍💾🧪 CLIENT DIAGNOSTIC: Received 4 blocks from API for form 4aa75992-0fad-42be-b5b6-2054bd674cd7
getFormWithBlocksClient.ts:25 🔥👾🔍💾🧪 BLOCK 43f37fb3-e625-49f5-8571-0a4f515aa268: type=static, subtype=multiple_choice, title=Multiple Choice Question
getFormWithBlocksClient.ts:25 🔥👾🔍💾🧪 BLOCK 4a3f1917-ac91-409f-911c-0c2431aca423: type=static, subtype=short_text, title=Short Text Question
getFormWithBlocksClient.ts:25 🔥👾🔍💾🧪 BLOCK 4b61e923-56a0-4434-b609-34c5285c1eee: type=static, subtype=long_text, title=Long Text Question
getFormWithBlocksClient.ts:25 🔥👾🔍💾🧪 BLOCK ce8d1a58-9bce-4e43-bd8c-1b4d2924f441: type=static, subtype=number, title=Number Input
getFormWithBlocksClient.ts:33 🔎 [getFormWithBlocksClient] Received workflow_edges from API for form 4aa75992-0fad-42be-b5b6-2054bd674cd7:
getFormWithBlocksClient.ts:35   Edge ID: 1216de81-658c-45f1-8677-6989d7150c1c, default_target_id: 4a3f1917-ac91-409f-911c-0c2431aca423, type: string, property_exists: true
getFormWithBlocksClient.ts:35   Edge ID: 9d3acc05-5255-422b-9b2e-4079bef85818, default_target_id: ce8d1a58-9bce-4e43-bd8c-1b4d2924f441, type: string, property_exists: true
getFormWithBlocksClient.ts:35   Edge ID: 6fe3e5b7-2ab0-403b-8e0e-bea4a7668d8a, default_target_id: ce8d1a58-9bce-4e43-bd8c-1b4d2924f441, type: string, property_exists: true
page.tsx:90 🔄 FORM LOAD: Loading form data from API
page.tsx:126 🔄 BLOCK MAPPING: id=43f37fb3-e625-49f5-8571-0a4f515aa268, type=static, subtype=multiple_choice
page.tsx:126 🔄 BLOCK MAPPING: id=4a3f1917-ac91-409f-911c-0c2431aca423, type=static, subtype=short_text
page.tsx:126 🔄 BLOCK MAPPING: id=4b61e923-56a0-4434-b609-34c5285c1eee, type=static, subtype=long_text
page.tsx:126 🔄 BLOCK MAPPING: id=ce8d1a58-9bce-4e43-bd8c-1b4d2924f441, type=static, subtype=number
page.tsx:154 🔄 FORM LOAD: Processing 3 workflow connections from API
page.tsx:187 🔎 [page.tsx - AFTER MAPPING] Mapped appConnections for form 4aa75992-0fad-42be-b5b6-2054bd674cd7:
page.tsx:189   Connection ID: 1216de81-658c-45f1-8677-6989d7150c1c, mapped defaultTargetId: 4a3f1917-ac91-409f-911c-0c2431aca423, type: string, rules_count: 0
page.tsx:189   Connection ID: 9d3acc05-5255-422b-9b2e-4079bef85818, mapped defaultTargetId: ce8d1a58-9bce-4e43-bd8c-1b4d2924f441, type: string, rules_count: 0
page.tsx:189   Connection ID: 6fe3e5b7-2ab0-403b-8e0e-bea4a7668d8a, mapped defaultTargetId: ce8d1a58-9bce-4e43-bd8c-1b4d2924f441, type: string, rules_count: 0
page.tsx:196 🔄 FORM LOAD: Set 3 connections in store
block-pill.tsx:63 BlockPill rendering for blockTypeId: multiple_choice, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type multiple_choice, core: multiple_choice
block-pill.tsx:63 BlockPill rendering for blockTypeId: multiple_choice, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type multiple_choice, core: multiple_choice
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: long_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type long_text, core: long_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: long_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type long_text, core: long_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: number, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type number, core: number
block-pill.tsx:63 BlockPill rendering for blockTypeId: number, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type number, core: number
block-pill.tsx:63 BlockPill rendering for blockTypeId: multiple_choice, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type multiple_choice, core: multiple_choice
block-pill.tsx:63 BlockPill rendering for blockTypeId: multiple_choice, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type multiple_choice, core: multiple_choice
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: long_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type long_text, core: long_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: long_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type long_text, core: long_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: number, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type number, core: number
block-pill.tsx:63 BlockPill rendering for blockTypeId: number, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type number, core: number
hot-reloader-client.tsx:371 [Fast Refresh] rebuilding
hot-reloader-client.tsx:116 [Fast Refresh] done in 630ms
block-pill.tsx:63 BlockPill rendering for blockTypeId: multiple_choice, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type multiple_choice, core: multiple_choice
block-pill.tsx:63 BlockPill rendering for blockTypeId: multiple_choice, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type multiple_choice, core: multiple_choice
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: long_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type long_text, core: long_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: long_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type long_text, core: long_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: number, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type number, core: number
block-pill.tsx:63 BlockPill rendering for blockTypeId: number, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type number, core: number
workflow-canvas.tsx:266 [React Flow]: It looks like you've created a new nodeTypes or edgeTypes object. If this wasn't on purpose please define the nodeTypes/edgeTypes outside of the component or memoize them. Help: https://reactflow.dev/error#002
devWarn @ index.mjs:153
useNodeOrEdgeTypes.useMemo[typesParsed] @ index.mjs:3742
mountMemo @ react-dom-client.development.js:6156
useMemo @ react-dom-client.development.js:23010
exports.useMemo @ react.development.js:1212
useNodeOrEdgeTypes @ index.mjs:3738
GraphView @ index.mjs:3752
react-stack-bottom-frame @ react-dom-client.development.js:23949
renderWithHooks @ react-dom-client.development.js:5078
updateFunctionComponent @ react-dom-client.development.js:8327
updateSimpleMemoComponent @ react-dom-client.development.js:8178
updateMemoComponent @ react-dom-client.development.js:8111
beginWork @ react-dom-client.development.js:10372
runWithFiberInDEV @ react-dom-client.development.js:1510
performUnitOfWork @ react-dom-client.development.js:15119
workLoopSync @ react-dom-client.development.js:14943
renderRootSync @ react-dom-client.development.js:14923
performWorkOnRoot @ react-dom-client.development.js:14410
performSyncWorkOnRoot @ react-dom-client.development.js:16289
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:16137
processRootScheduleInMicrotask @ react-dom-client.development.js:16174
(anonymous) @ react-dom-client.development.js:16308
<GraphView>
exports.createElement @ react.development.js:1020
ReactFlow @ index.mjs:4100
react-stack-bottom-frame @ react-dom-client.development.js:23949
renderWithHooksAgain @ react-dom-client.development.js:5178
renderWithHooks @ react-dom-client.development.js:5090
updateForwardRef @ react-dom-client.development.js:8071
beginWork @ react-dom-client.development.js:10283
runWithFiberInDEV @ react-dom-client.development.js:1510
performUnitOfWork @ react-dom-client.development.js:15119
workLoopSync @ react-dom-client.development.js:14943
renderRootSync @ react-dom-client.development.js:14923
performWorkOnRoot @ react-dom-client.development.js:14410
performSyncWorkOnRoot @ react-dom-client.development.js:16289
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:16137
processRootScheduleInMicrotask @ react-dom-client.development.js:16174
(anonymous) @ react-dom-client.development.js:16308
<ReactFlow>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:326
WorkflowCanvas @ workflow-canvas.tsx:266
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
performSyncWorkOnRoot @ react-dom-client.development.js:16289
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:16137
processRootScheduleInMicrotask @ react-dom-client.development.js:16174
(anonymous) @ react-dom-client.development.js:16308
<WorkflowCanvas>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:326
WorkflowContent @ workflow-content.tsx:91
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
performSyncWorkOnRoot @ react-dom-client.development.js:16289
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:16137
processRootScheduleInMicrotask @ react-dom-client.development.js:16174
(anonymous) @ react-dom-client.development.js:16308
<WorkflowContent>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:326
FormBuilderPageContent @ page.tsx:407
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
performSyncWorkOnRoot @ react-dom-client.development.js:16289
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:16137
processRootScheduleInMicrotask @ react-dom-client.development.js:16174
(anonymous) @ react-dom-client.development.js:16308
workflow-canvas.tsx:266 [React Flow]: It looks like you've created a new nodeTypes or edgeTypes object. If this wasn't on purpose please define the nodeTypes/edgeTypes outside of the component or memoize them. Help: https://reactflow.dev/error#002
devWarn @ index.mjs:153
useNodeOrEdgeTypes.useMemo[typesParsed] @ index.mjs:3742
mountMemo @ react-dom-client.development.js:6156
useMemo @ react-dom-client.development.js:23010
exports.useMemo @ react.development.js:1212
useNodeOrEdgeTypes @ index.mjs:3738
GraphView @ index.mjs:3753
react-stack-bottom-frame @ react-dom-client.development.js:23949
renderWithHooks @ react-dom-client.development.js:5078
updateFunctionComponent @ react-dom-client.development.js:8327
updateSimpleMemoComponent @ react-dom-client.development.js:8178
updateMemoComponent @ react-dom-client.development.js:8111
beginWork @ react-dom-client.development.js:10372
runWithFiberInDEV @ react-dom-client.development.js:1510
performUnitOfWork @ react-dom-client.development.js:15119
workLoopSync @ react-dom-client.development.js:14943
renderRootSync @ react-dom-client.development.js:14923
performWorkOnRoot @ react-dom-client.development.js:14410
performSyncWorkOnRoot @ react-dom-client.development.js:16289
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:16137
processRootScheduleInMicrotask @ react-dom-client.development.js:16174
(anonymous) @ react-dom-client.development.js:16308
<GraphView>
exports.createElement @ react.development.js:1020
ReactFlow @ index.mjs:4100
react-stack-bottom-frame @ react-dom-client.development.js:23949
renderWithHooksAgain @ react-dom-client.development.js:5178
renderWithHooks @ react-dom-client.development.js:5090
updateForwardRef @ react-dom-client.development.js:8071
beginWork @ react-dom-client.development.js:10283
runWithFiberInDEV @ react-dom-client.development.js:1510
performUnitOfWork @ react-dom-client.development.js:15119
workLoopSync @ react-dom-client.development.js:14943
renderRootSync @ react-dom-client.development.js:14923
performWorkOnRoot @ react-dom-client.development.js:14410
performSyncWorkOnRoot @ react-dom-client.development.js:16289
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:16137
processRootScheduleInMicrotask @ react-dom-client.development.js:16174
(anonymous) @ react-dom-client.development.js:16308
<ReactFlow>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:326
WorkflowCanvas @ workflow-canvas.tsx:266
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
performSyncWorkOnRoot @ react-dom-client.development.js:16289
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:16137
processRootScheduleInMicrotask @ react-dom-client.development.js:16174
(anonymous) @ react-dom-client.development.js:16308
<WorkflowCanvas>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:326
WorkflowContent @ workflow-content.tsx:91
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
performSyncWorkOnRoot @ react-dom-client.development.js:16289
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:16137
processRootScheduleInMicrotask @ react-dom-client.development.js:16174
(anonymous) @ react-dom-client.development.js:16308
<WorkflowContent>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:326
FormBuilderPageContent @ page.tsx:407
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
performSyncWorkOnRoot @ react-dom-client.development.js:16289
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:16137
processRootScheduleInMicrotask @ react-dom-client.development.js:16174
(anonymous) @ react-dom-client.development.js:16308
use-workflow-data.ts:71 🔎🔎 [WorkflowData] Converting 3 connections to ReactFlow edges
use-workflow-data.ts:74 🔎🔎 [WorkflowData] Connections data sample: (3) ['43f37fb3-e625-49f5-8571-0a4f515aa268 -> 4a3f1917-ac91-409f-911c-0c2431aca423 (Rules: 0)', '4a3f1917-ac91-409f-911c-0c2431aca423 -> ce8d1a58-9bce-4e43-bd8c-1b4d2924f441 (Rules: 0)', '4b61e923-56a0-4434-b609-34c5285c1eee -> ce8d1a58-9bce-4e43-bd8c-1b4d2924f441 (Rules: 0)']
use-workflow-data.ts:120 🔎✅ [WorkflowData] Created edge for default path: 43f37fb3-e625-49f5-8571-0a4f515aa268 -> 4a3f1917-ac91-409f-911c-0c2431aca423
use-workflow-data.ts:120 🔎✅ [WorkflowData] Created edge for default path: 4a3f1917-ac91-409f-911c-0c2431aca423 -> ce8d1a58-9bce-4e43-bd8c-1b4d2924f441
use-workflow-data.ts:120 🔎✅ [WorkflowData] Created edge for default path: 4b61e923-56a0-4434-b609-34c5285c1eee -> ce8d1a58-9bce-4e43-bd8c-1b4d2924f441
use-workflow-data.ts:190 🔎📊 [WorkflowData] Setting 3 edges in ReactFlow
use-workflow-data.ts:71 🔎🔎 [WorkflowData] Converting 3 connections to ReactFlow edges
use-workflow-data.ts:74 🔎🔎 [WorkflowData] Connections data sample: (3) ['43f37fb3-e625-49f5-8571-0a4f515aa268 -> 4a3f1917-ac91-409f-911c-0c2431aca423 (Rules: 0)', '4a3f1917-ac91-409f-911c-0c2431aca423 -> ce8d1a58-9bce-4e43-bd8c-1b4d2924f441 (Rules: 0)', '4b61e923-56a0-4434-b609-34c5285c1eee -> ce8d1a58-9bce-4e43-bd8c-1b4d2924f441 (Rules: 0)']
use-workflow-data.ts:120 🔎✅ [WorkflowData] Created edge for default path: 43f37fb3-e625-49f5-8571-0a4f515aa268 -> 4a3f1917-ac91-409f-911c-0c2431aca423
use-workflow-data.ts:120 🔎✅ [WorkflowData] Created edge for default path: 4a3f1917-ac91-409f-911c-0c2431aca423 -> ce8d1a58-9bce-4e43-bd8c-1b4d2924f441
use-workflow-data.ts:120 🔎✅ [WorkflowData] Created edge for default path: 4b61e923-56a0-4434-b609-34c5285c1eee -> ce8d1a58-9bce-4e43-bd8c-1b4d2924f441
use-workflow-data.ts:190 🔎📊 [WorkflowData] Setting 3 edges in ReactFlow
block-pill.tsx:63 BlockPill rendering for blockTypeId: multiple_choice, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type multiple_choice, core: multiple_choice
block-pill.tsx:63 BlockPill rendering for blockTypeId: multiple_choice, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type multiple_choice, core: multiple_choice
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: long_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type long_text, core: long_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: long_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type long_text, core: long_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: number, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type number, core: number
block-pill.tsx:63 BlockPill rendering for blockTypeId: number, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type number, core: number
workflow-canvas.tsx:200 🔄 Applying automatic layout on workflow tab load
block-pill.tsx:63 BlockPill rendering for blockTypeId: multiple_choice, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type multiple_choice, core: multiple_choice
block-pill.tsx:63 BlockPill rendering for blockTypeId: multiple_choice, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type multiple_choice, core: multiple_choice
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: long_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type long_text, core: long_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: long_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type long_text, core: long_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: number, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type number, core: number
block-pill.tsx:63 BlockPill rendering for blockTypeId: number, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type number, core: number
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: multiple_choice, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type multiple_choice, core: multiple_choice
block-pill.tsx:63 BlockPill rendering for blockTypeId: multiple_choice, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type multiple_choice, core: multiple_choice
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: long_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type long_text, core: long_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: long_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type long_text, core: long_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: number, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type number, core: number
block-pill.tsx:63 BlockPill rendering for blockTypeId: number, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type number, core: number
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
workflow-sidebar.tsx:25 [WorkflowSidebar] For ID 4a3f1917-ac91-409f-911c-0c2431aca423:
workflow-sidebar.tsx:26 [WorkflowSidebar] Found Connection: undefined
workflow-sidebar.tsx:27 [WorkflowSidebar] Found Block: {id: '4a3f1917-ac91-409f-911c-0c2431aca423', blockTypeId: 'short_text', type: 'static', subtype: 'short_text', title: 'Short Text Question', …}
workflow-sidebar.tsx:43 [WorkflowSidebar] Resolved Element: {id: '4a3f1917-ac91-409f-911c-0c2431aca423', type: 'formBlock', data: {…}, position: {…}}
workflow-sidebar.tsx:55 🔍 SELECTION: Element ID 4a3f1917-ac91-409f-911c-0c2431aca423 is a node
workflow-sidebar.tsx:25 [WorkflowSidebar] For ID 4a3f1917-ac91-409f-911c-0c2431aca423:
workflow-sidebar.tsx:26 [WorkflowSidebar] Found Connection: undefined
workflow-sidebar.tsx:27 [WorkflowSidebar] Found Block: {id: '4a3f1917-ac91-409f-911c-0c2431aca423', blockTypeId: 'short_text', type: 'static', subtype: 'short_text', title: 'Short Text Question', …}
workflow-sidebar.tsx:43 [WorkflowSidebar] Resolved Element: {id: '4a3f1917-ac91-409f-911c-0c2431aca423', type: 'formBlock', data: {…}, position: {…}}
workflow-sidebar.tsx:55 🔍 SELECTION: Element ID 4a3f1917-ac91-409f-911c-0c2431aca423 is a node
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
default-target.tsx:67 🔴🔴🔴🔴🔴 [DT] Props: connectionId: 9d3acc05-5255-422b-9b2e-4079bef85818
default-target.tsx:68 🟠🟠🟠🟠🟠 [DT] Props: defaultTargetId: ce8d1a58-9bce-4e43-bd8c-1b4d2924f441
default-target.tsx:69 🟡🟡🟡🟡🟡 [DT] currentConnection: {"id":"9d3acc05-5255-422b-9b2e-4079bef85818","sourceId":"4a3f1917-ac91-409f-911c-0c2431aca423","defaultTargetId":"ce8d1a58-9bce-4e43-bd8c-1b4d2924f441","rules":[],"order_index":1}
default-target.tsx:70 🟢🟢🟢🟢🟢 [DT] currentConnection.is_explicit: undefined
default-target.tsx:71 🔵🔵🔵🔵🔵 [DT] defaultTargetBlock: {"id":"ce8d1a58-9bce-4e43-bd8c-1b4d2924f441","blockTypeId":"number","type":"static","subtype":"number","title":"Number Input","required":false,"order_index":3,"settings":{"step":1,"placeholder":"0"}}
default-target.tsx:72 🟣🟣🟣🟣🟣 [DT] Display Value for Select: 
default-target.tsx:67 🔴🔴🔴🔴🔴 [DT] Props: connectionId: 9d3acc05-5255-422b-9b2e-4079bef85818
default-target.tsx:68 🟠🟠🟠🟠🟠 [DT] Props: defaultTargetId: ce8d1a58-9bce-4e43-bd8c-1b4d2924f441
default-target.tsx:69 🟡🟡🟡🟡🟡 [DT] currentConnection: {"id":"9d3acc05-5255-422b-9b2e-4079bef85818","sourceId":"4a3f1917-ac91-409f-911c-0c2431aca423","defaultTargetId":"ce8d1a58-9bce-4e43-bd8c-1b4d2924f441","rules":[],"order_index":1}
default-target.tsx:70 🟢🟢🟢🟢🟢 [DT] currentConnection.is_explicit: undefined
default-target.tsx:71 🔵🔵🔵🔵🔵 [DT] defaultTargetBlock: {"id":"ce8d1a58-9bce-4e43-bd8c-1b4d2924f441","blockTypeId":"number","type":"static","subtype":"number","title":"Number Input","required":false,"order_index":3,"settings":{"step":1,"placeholder":"0"}}
default-target.tsx:72 🟣🟣🟣🟣🟣 [DT] Display Value for Select: 
use-workflow-data.ts:71 🔎🔎 [WorkflowData] Converting 3 connections to ReactFlow edges
use-workflow-data.ts:74 🔎🔎 [WorkflowData] Connections data sample: (3) ['43f37fb3-e625-49f5-8571-0a4f515aa268 -> 4a3f1917-ac91-409f-911c-0c2431aca423 (Rules: 0)', '4a3f1917-ac91-409f-911c-0c2431aca423 -> ce8d1a58-9bce-4e43-bd8c-1b4d2924f441 (Rules: 0)', '4b61e923-56a0-4434-b609-34c5285c1eee -> ce8d1a58-9bce-4e43-bd8c-1b4d2924f441 (Rules: 0)']
use-workflow-data.ts:120 🔎✅ [WorkflowData] Created edge for default path: 43f37fb3-e625-49f5-8571-0a4f515aa268 -> 4a3f1917-ac91-409f-911c-0c2431aca423
use-workflow-data.ts:120 🔎✅ [WorkflowData] Created edge for default path: 4a3f1917-ac91-409f-911c-0c2431aca423 -> ce8d1a58-9bce-4e43-bd8c-1b4d2924f441
use-workflow-data.ts:120 🔎✅ [WorkflowData] Created edge for default path: 4b61e923-56a0-4434-b609-34c5285c1eee -> ce8d1a58-9bce-4e43-bd8c-1b4d2924f441
use-workflow-data.ts:190 🔎📊 [WorkflowData] Setting 3 edges in ReactFlow
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
workflow-sidebar.tsx:25 [WorkflowSidebar] For ID 4a3f1917-ac91-409f-911c-0c2431aca423:
workflow-sidebar.tsx:26 [WorkflowSidebar] Found Connection: undefined
workflow-sidebar.tsx:27 [WorkflowSidebar] Found Block: {id: '4a3f1917-ac91-409f-911c-0c2431aca423', blockTypeId: 'short_text', type: 'static', subtype: 'short_text', title: 'Short Text Question', …}
workflow-sidebar.tsx:43 [WorkflowSidebar] Resolved Element: {id: '4a3f1917-ac91-409f-911c-0c2431aca423', type: 'formBlock', data: {…}, position: {…}}
workflow-sidebar.tsx:55 🔍 SELECTION: Element ID 4a3f1917-ac91-409f-911c-0c2431aca423 is a node
workflow-sidebar.tsx:25 [WorkflowSidebar] For ID 4a3f1917-ac91-409f-911c-0c2431aca423:
workflow-sidebar.tsx:26 [WorkflowSidebar] Found Connection: undefined
workflow-sidebar.tsx:27 [WorkflowSidebar] Found Block: {id: '4a3f1917-ac91-409f-911c-0c2431aca423', blockTypeId: 'short_text', type: 'static', subtype: 'short_text', title: 'Short Text Question', …}
workflow-sidebar.tsx:43 [WorkflowSidebar] Resolved Element: {id: '4a3f1917-ac91-409f-911c-0c2431aca423', type: 'formBlock', data: {…}, position: {…}}
workflow-sidebar.tsx:55 🔍 SELECTION: Element ID 4a3f1917-ac91-409f-911c-0c2431aca423 is a node
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
default-target.tsx:67 🔴🔴🔴🔴🔴 [DT] Props: connectionId: 9d3acc05-5255-422b-9b2e-4079bef85818
default-target.tsx:68 🟠🟠🟠🟠🟠 [DT] Props: defaultTargetId: ce8d1a58-9bce-4e43-bd8c-1b4d2924f441
default-target.tsx:69 🟡🟡🟡🟡🟡 [DT] currentConnection: {"id":"9d3acc05-5255-422b-9b2e-4079bef85818","sourceId":"4a3f1917-ac91-409f-911c-0c2431aca423","defaultTargetId":"ce8d1a58-9bce-4e43-bd8c-1b4d2924f441","rules":[],"order_index":1}
default-target.tsx:70 🟢🟢🟢🟢🟢 [DT] currentConnection.is_explicit: undefined
default-target.tsx:71 🔵🔵🔵🔵🔵 [DT] defaultTargetBlock: {"id":"ce8d1a58-9bce-4e43-bd8c-1b4d2924f441","blockTypeId":"number","type":"static","subtype":"number","title":"Number Input","required":false,"order_index":3,"settings":{"step":1,"placeholder":"0"}}
default-target.tsx:72 🟣🟣🟣🟣🟣 [DT] Display Value for Select: 
default-target.tsx:67 🔴🔴🔴🔴🔴 [DT] Props: connectionId: 9d3acc05-5255-422b-9b2e-4079bef85818
default-target.tsx:68 🟠🟠🟠🟠🟠 [DT] Props: defaultTargetId: ce8d1a58-9bce-4e43-bd8c-1b4d2924f441
default-target.tsx:69 🟡🟡🟡🟡🟡 [DT] currentConnection: {"id":"9d3acc05-5255-422b-9b2e-4079bef85818","sourceId":"4a3f1917-ac91-409f-911c-0c2431aca423","defaultTargetId":"ce8d1a58-9bce-4e43-bd8c-1b4d2924f441","rules":[],"order_index":1}
default-target.tsx:70 🟢🟢🟢🟢🟢 [DT] currentConnection.is_explicit: undefined
default-target.tsx:71 🔵🔵🔵🔵🔵 [DT] defaultTargetBlock: {"id":"ce8d1a58-9bce-4e43-bd8c-1b4d2924f441","blockTypeId":"number","type":"static","subtype":"number","title":"Number Input","required":false,"order_index":3,"settings":{"step":1,"placeholder":"0"}}
default-target.tsx:72 🟣🟣🟣🟣🟣 [DT] Display Value for Select: 
block-pill.tsx:63 BlockPill rendering for blockTypeId: multiple_choice, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type multiple_choice, core: multiple_choice
block-pill.tsx:63 BlockPill rendering for blockTypeId: multiple_choice, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type multiple_choice, core: multiple_choice
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: long_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type long_text, core: long_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: long_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type long_text, core: long_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: number, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type number, core: number
block-pill.tsx:63 BlockPill rendering for blockTypeId: number, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type number, core: number
block-pill.tsx:63 BlockPill rendering for blockTypeId: multiple_choice, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type multiple_choice, core: multiple_choice
block-pill.tsx:63 BlockPill rendering for blockTypeId: multiple_choice, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type multiple_choice, core: multiple_choice
block-pill.tsx:63 BlockPill rendering for blockTypeId: long_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type long_text, core: long_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: long_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type long_text, core: long_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: number, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type number, core: number
block-pill.tsx:63 BlockPill rendering for blockTypeId: number, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type number, core: number
workflow-sidebar.tsx:25 [WorkflowSidebar] For ID 4a3f1917-ac91-409f-911c-0c2431aca423:
workflow-sidebar.tsx:26 [WorkflowSidebar] Found Connection: undefined
workflow-sidebar.tsx:27 [WorkflowSidebar] Found Block: {id: '4a3f1917-ac91-409f-911c-0c2431aca423', blockTypeId: 'short_text', type: 'static', subtype: 'short_text', title: 'Short Text Question', …}
workflow-sidebar.tsx:43 [WorkflowSidebar] Resolved Element: {id: '4a3f1917-ac91-409f-911c-0c2431aca423', type: 'formBlock', data: {…}, position: {…}}
workflow-sidebar.tsx:55 🔍 SELECTION: Element ID 4a3f1917-ac91-409f-911c-0c2431aca423 is a node
workflow-sidebar.tsx:25 [WorkflowSidebar] For ID 4a3f1917-ac91-409f-911c-0c2431aca423:
workflow-sidebar.tsx:26 [WorkflowSidebar] Found Connection: undefined
workflow-sidebar.tsx:27 [WorkflowSidebar] Found Block: {id: '4a3f1917-ac91-409f-911c-0c2431aca423', blockTypeId: 'short_text', type: 'static', subtype: 'short_text', title: 'Short Text Question', …}
workflow-sidebar.tsx:43 [WorkflowSidebar] Resolved Element: {id: '4a3f1917-ac91-409f-911c-0c2431aca423', type: 'formBlock', data: {…}, position: {…}}
workflow-sidebar.tsx:55 🔍 SELECTION: Element ID 4a3f1917-ac91-409f-911c-0c2431aca423 is a node
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
default-target.tsx:67 🔴🔴🔴🔴🔴 [DT] Props: connectionId: 9d3acc05-5255-422b-9b2e-4079bef85818
default-target.tsx:68 🟠🟠🟠🟠🟠 [DT] Props: defaultTargetId: ce8d1a58-9bce-4e43-bd8c-1b4d2924f441
default-target.tsx:69 🟡🟡🟡🟡🟡 [DT] currentConnection: {"id":"9d3acc05-5255-422b-9b2e-4079bef85818","sourceId":"4a3f1917-ac91-409f-911c-0c2431aca423","defaultTargetId":"ce8d1a58-9bce-4e43-bd8c-1b4d2924f441","rules":[],"order_index":1}
default-target.tsx:70 🟢🟢🟢🟢🟢 [DT] currentConnection.is_explicit: undefined
default-target.tsx:71 🔵🔵🔵🔵🔵 [DT] defaultTargetBlock: {"id":"ce8d1a58-9bce-4e43-bd8c-1b4d2924f441","blockTypeId":"number","type":"static","subtype":"number","title":"Number Input","required":false,"order_index":3,"settings":{"step":1,"placeholder":"0"}}
default-target.tsx:72 🟣🟣🟣🟣🟣 [DT] Display Value for Select: 
default-target.tsx:67 🔴🔴🔴🔴🔴 [DT] Props: connectionId: 9d3acc05-5255-422b-9b2e-4079bef85818
default-target.tsx:68 🟠🟠🟠🟠🟠 [DT] Props: defaultTargetId: ce8d1a58-9bce-4e43-bd8c-1b4d2924f441
default-target.tsx:69 🟡🟡🟡🟡🟡 [DT] currentConnection: {"id":"9d3acc05-5255-422b-9b2e-4079bef85818","sourceId":"4a3f1917-ac91-409f-911c-0c2431aca423","defaultTargetId":"ce8d1a58-9bce-4e43-bd8c-1b4d2924f441","rules":[],"order_index":1}
default-target.tsx:70 🟢🟢🟢🟢🟢 [DT] currentConnection.is_explicit: undefined
default-target.tsx:71 🔵🔵🔵🔵🔵 [DT] defaultTargetBlock: {"id":"ce8d1a58-9bce-4e43-bd8c-1b4d2924f441","blockTypeId":"number","type":"static","subtype":"number","title":"Number Input","required":false,"order_index":3,"settings":{"step":1,"placeholder":"0"}}
default-target.tsx:72 🟣🟣🟣🟣🟣 [DT] Display Value for Select: 
block-pill.tsx:63 BlockPill rendering for blockTypeId: multiple_choice, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type multiple_choice, core: multiple_choice
block-pill.tsx:63 BlockPill rendering for blockTypeId: multiple_choice, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type multiple_choice, core: multiple_choice
block-pill.tsx:63 BlockPill rendering for blockTypeId: long_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type long_text, core: long_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: long_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type long_text, core: long_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: number, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type number, core: number
block-pill.tsx:63 BlockPill rendering for blockTypeId: number, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type number, core: number
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text
block-pill.tsx:63 BlockPill rendering for blockTypeId: short_text, found definition: true
block-pill.tsx:79 BlockPill: Finding icon for type short_text, core: short_text