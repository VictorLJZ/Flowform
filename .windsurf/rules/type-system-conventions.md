FlowForm Type System Conventions
Core Layers and Type Handling
Hooks (e.g., useWorkspaces.ts, useCurrentWorkspace.ts):
Primarily deal with and expose API Types
They fetch data (which ultimately comes from API routes or services that provide API Types) and provide it to components

Components (e.g., WorkspaceSwitcher.tsx, RenameDialog.tsx):
Consume and work with API Types
They receive props and display data based on the structure of API Types

UI Elements (general term for parts of components):
If they are displaying data from your models, they should use API Types passed down from their parent components or hooks

API Routes (e.g., /api/workspaces/route.ts):
Input from Client: Expect API Types
Database Interaction: Use Db Types when querying or writing to the database (e.g., Supabase)
Output to Client: Must return API Types (this often involves transforming Db Types to API Types before sending the response)

Services (e.g., createWorkspace.ts, getUserWorkspacesClient.ts):
Client-Side Services (called from hooks/components):
If they call an API route: They will send/receive API Types
If they interact directly with a client-side database interface (like getWorkspaceClient.ts did initially with Supabase): They fetch Db Types but must transform them into API Types before returning them to the rest of the frontend

Server-Side Services (utility functions used only within API routes):
If they help with database operations: They'll use Db Types
If they help with request/response handling: They might deal with both, or just API types

Pages (e.g., dashboard/page.tsx):
Primarily use API Types
They fetch data via hooks (which provide API Types) and pass this data to components
