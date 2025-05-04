# SWR Fetcher Analysis for Workspace Isolation

## Current Implementation Patterns

After a detailed examination of the SWR fetchers in FlowForm, I've identified several patterns in how workspace data is currently accessed and managed.

### Positive Patterns

1. **Workspace ID in SWR Keys**
   - Most hooks consistently use workspace ID in the SWR key: `[resource, workspaceId]`
   - Example: `useForms` uses `['forms', workspaceId]` for proper caching
   - Example: `useDashboardData` uses `['dashboardData', workspaceId]`

2. **Conditional Fetching**
   - Fetchers typically check for workspace ID existence before triggering fetches
   - Setting key to `null` when workspaceId is missing prevents improper data access
   - Example in `useWorkspaceMembers`: `key = workspaceId && userId ? ['workspaceMembers', workspaceId] : null`

3. **Explicit Workspace Filtering**
   - Service functions apply workspace filtering at query time
   - Example in `useForms`: `.eq('workspace_id', wid)` ensures data scope

4. **Integration with Authentication**
   - Most hooks check for user authentication state in addition to workspace context
   - Example: `useWorkspaceMembers` combines user ID and workspace ID checks

### Inconsistencies and Gaps

1. **No Central SWR Pattern**
   - Each hook implements its own fetching logic with different patterns
   - No central function that enforces workspace context in all fetches

2. **Manual Implementation Required**
   - Developers must remember to add workspace filtering manually
   - No safeguards against forgetting to add workspace context

3. **Different Parameter Handling**
   - Some hooks take workspace ID directly
   - Others infer it from store or other sources
   - Inconsistent handling of undefined/null workspace IDs

4. **No Standardized Error Handling**
   - Varying approaches to workspace access errors across hooks
   - Some throw errors, others return empty arrays

## SWR Challenges for Workspace Isolation

The current pattern has these specific limitations:

1. **Safety Through Obscurity**
   - Relies on developers remembering to include workspace filters
   - No automatic enforcement of workspace boundaries

2. **Potential for Cross-Workspace Data Access**
   - If a developer forgets workspace filtering, data leakage can occur
   - Example: a query that skips the `.eq('workspace_id', wid)` would return all data

3. **No Central Control Point**
   - Changes to workspace isolation strategy require updates to many files
   - Testing and validating correct workspace isolation is difficult

## Recommended Patterns

Based on the analysis, we should implement:

1. **SWR Wrapper with Automatic Workspace Context**
   - Create a central `useWorkspaceSWR` hook that automatically includes workspace ID 
   - Standardize error handling for workspace-related failures

2. **Key Normalization Function**
   - Create a utility to standardize SWR key creation with workspace context
   - Example: `createWorkspaceKey('forms', otherParams)` → `['workspace:wid:forms', otherParams]`

3. **Fetcher Factory with Automatic Filtering**
   - Create fetcher factories that automatically inject workspace filters
   - Example: `createWorkspaceFetcher(fn)` that automatically adds workspace context

This approach would maintain the current flexibility while adding automatic workspace isolation with minimal changes to existing code.
