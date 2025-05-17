# FlowForm Workspace Implementation Refactoring Plan

This document outlines a comprehensive plan to rebuild the workspace implementation in FlowForm with a focus on simplicity, reliability, and maintainability.

## Current Status: Phase 5 Complete ✅

- ✅ Phase 1: Clean Up and Delete Files - **COMPLETE**
- ✅ Phase 2: Rebuild Type System - **COMPLETE**
- ✅ Phase 3: Rebuild Core Services - **COMPLETE**
- ✅ Phase 4: Simplified State Management - **COMPLETE**
- ✅ Phase 5: Simplified Hook System - **COMPLETE**
- ✅ Phase 6: Rebuild UI Components - **IN PROGRESS**
- ⬜ Phase 7: Integration and Testing - **NOT STARTED**

The refactoring has successfully completed the first five phases, creating a robust and well-structured foundation for the workspace management system. The next step is to rebuild the UI components that utilize this new architecture.

## Phase 1: Clean Up and Delete Files

Delete these files completely:

- [x] `/src/hooks/useWorkspaceInitialization.ts`
- [x] `/src/hooks/useUrlWorkspaceSelection.ts`
- [x] `/src/hooks/useDefaultWorkspaceCreation.ts`
- [x] `/src/hooks/useWorkspaceSwitcher.ts`
- [x] `/src/hooks/useStorageSyncBetweenTabs.ts`
- [x] `/src/providers/workspace-provider.tsx`
- [x] `/src/hooks/useWorkspaceSWR.ts`
- [x] `/src/hooks/swr/useWorkspaceSWR.ts`
- [x] `/src/hooks/useWorkspaceInvitations.ts`
- [x] `/src/hooks/useWorkspaceDeletion.ts`
- [x] `/src/hooks/useWorkspace.ts`
- [x] `/src/hooks/useWorkspaceMembers.ts`
- [x] `/src/hooks/useCurrentWorkspace.ts`

## Phase 2: Rebuild Type System

### 2.1 Rebuild Core Types

- [x] Implement `/src/types/workspace/DbWorkspace.ts`
  - Defined database-level types with snake_case naming
  - Included proper documentation
  - Based on workspace database schema
  
- [x] Implement `/src/types/workspace/ApiWorkspace.ts`
  - Created API-level types with camelCase naming
  - Properly documented endpoints and payload types
  - Included request/response types

- [x] Implement `/src/types/workspace/UiWorkspace.ts`
  - Created UI-specific types that extend API types
  - Added display-oriented properties
  - Included proper documentation for UI component usage

### 2.2 Rebuild Type Transformations

- [x] Update transformation files with clean implementations:
  - [x] `/src/utils/type-utils/workspace/DbToApiWorkspace.ts` - Converts DB to API types
  - [x] `/src/utils/type-utils/workspace/ApiToDbWorkspace.ts` - Converts API to DB types
  - [x] `/src/utils/type-utils/workspace/ApiToUiWorkspace.ts` - Converts API to UI types
  
- [x] Implement strict null/undefined handling
- [x] Create utility functions for common operations

## Phase 3: Rebuild Core Services

### 3.1 Database Services (Server-Side)

- [x] Create file: `/src/services/workspace/workspaces.server.ts`
  - Core workspace operations (CRUD)
  - Proper error handling

- [x] Create file: `/src/services/workspace/members.server.ts`
  - Member management operations
  - Profile integrations

- [x] Create file: `/src/services/workspace/invitations.server.ts`
  - Invitation creation and management
  - Status updates for invitations

- [x] Create file: `/src/services/workspace/permissions.server.ts`
  - Permission and authorization checks
  - Role-based access control

- [x] Create file: `/src/services/workspace/utils.ts`
  - Shared utility functions
  
- [x] Create file: `/src/services/workspace/index.ts`
  - Export all server-side services

- [x] Delete all workspace service files:
  - [x] `/src/services/workspace/getUserWorkspaces.ts`
  - [x] `/src/services/workspace/getWorkspaceById.ts`
  - [x] `/src/services/workspace/createWorkspace.ts`
  - [x] `/src/services/workspace/updateWorkspace.ts`
  - [x] `/src/services/workspace/deleteWorkspace.ts`
  - [x] `/src/services/workspace/acceptInvitation.ts`
  - [x] `/src/services/workspace/changeUserRole.ts`
  - [x] `/src/services/workspace/changeUserRoleClient.ts`
  - [x] `/src/services/workspace/client.ts`
  - [x] `/src/services/workspace/declineInvitation.ts`
  - [x] `/src/services/workspace/getPendingInvitations.ts`
  - [x] `/src/services/workspace/getSentInvitations.ts`
  - [x] `/src/services/workspace/getUserWorkspacesClient.ts`
  - [x] `/src/services/workspace/getWorkspaceClient.ts`
  - [x] `/src/services/workspace/getWorkspaceMembers.ts`
  - [x] `/src/services/workspace/getWorkspaceMembersClient.ts`
  - [x] `/src/services/workspace/index.ts`
  - [x] `/src/services/workspace/initializeDefaultWorkspace.ts`
  - [x] `/src/services/workspace/inviteToWorkspace.ts`
  - [x] `/src/services/workspace/leaveWorkspace.ts`
  - [x] `/src/services/workspace/removeMember.ts`
  - [x] `/src/services/workspace/removeWorkspaceMemberClient.ts`
  - [x] `/src/services/workspace/resendInvitation.ts`
  - [x] `/src/services/workspace/revokeInvitation.ts`
  - [x] `/src/services/workspace/sendInvitationEmail.ts`
  - [x] `/src/services/workspace/transferWorkspaceOwnership.ts`

### 3.2 API Services (Client-Side)

- [x] Create file: `/src/services/workspace/client/workspaces.client.ts`
  - Core workspace API operations
  - Clean error handling and retries

- [x] Create file: `/src/services/workspace/client/members.client.ts`
  - Member management API operations
  - Invitation handling

- [x] Create file: `/src/services/workspace/client/invitations.client.ts`
  - Invitation API operations
  - Email integration for invites

- [x] Create file: `/src/services/workspace/client/permissions.client.ts`
  - Client-side permission utilities
  - Role-based UI helpers

- [x] Create file: `/src/services/workspace/client/index.ts`
  - Export all client-side services

### 3.3 API Routes

- [x] Delete `/src/app/api/workspaces/route.ts`

- [x] Delete `/src/app/api/workspaces/[workspaceId]/route.ts`

- [x] Delete `/src/app/api/workspaces/members/route.ts`
- [x] Delete `/src/app/api/workspaces/members/role/route.ts`
- [x] Delete `/src/app/api/workspaces/[workspaceId]/verify/route.ts`
- [x] Delete `/src/app/api/permissions/workspace/route.ts`

## Phase 4: Simplified State Management

### 4.1 Create New Workspace Store

- [x] Delete existing store: `/src/stores/workspaceStore.ts`
- [x] Create new file: `/src/stores/workspaceStore.ts`
  - Implement unified Zustand store
  - Include all core state and actions
  - Follow this pattern:

```typescript
interface WorkspaceState {
  // State
  workspaces: ApiWorkspace[];
  currentWorkspaceId: string | null;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  fetchWorkspaces: (userId: string) => Promise<void>;
  selectWorkspace: (id: string) => void;
  createWorkspace: (input: ApiWorkspaceInput) => Promise<ApiWorkspace>;
  updateWorkspace: (id: string, input: ApiWorkspaceUpdateInput) => Promise<ApiWorkspace>;
  deleteWorkspace: (id: string) => Promise<void>;
}
```

### 4.2 Create New Provider

- [x] Create new file: `/src/providers/workspace-provider.tsx`
  - Implement minimal provider with initialization logic
  - Handle authentication integration
  - Implement default workspace creation logic

## Phase 5: Simplified Hook System

### 5.1 Create Unified Workspace Hook

- [x] Create new file: `/src/hooks/useWorkspace.ts`
  - Implement all core workspace operations
  - Expose the Zustand store in a React-friendly way
  - Handle loading and error states properly

### 5.2 Create Permission Hook

- [x] Create new file: `/src/hooks/useWorkspacePermissions.ts`
  - Implement permission checks based on roles
  - Export utility functions for permission verification

### 5.3 Create Member Management Hooks

- [x] Create new file: `/src/hooks/useWorkspaceMembers.ts`
  - Implement member management functionality
  - Handle invitations, role changes, and removals

## Phase 6: Rebuild UI Components

### 6.1 Navigation Components

- [x] Rewrite `/src/components/dashboard/navigation/WorkspaceSwitcher.tsx`
  - Implement clean, minimal switcher
  - Focus on core functionality (display, select, create)
  - Handle loading and error states properly
  - Integrate with useWorkspace hook

### 6.2 Workspace Management Components

- [x] Update `/src/components/workspace/confirm-dialog.tsx`
  - Refactor to use new workspaceStore and hooks
  - Improve error handling and loading states
  - Add proper permission checks

- [x] Update `/src/components/workspace/rename-dialog.tsx`
  - Integrate with the new updateWorkspace function
  - Add proper validation and error handling
  - Update to use the permission system

### 6.3 Workspace Creation Components

- [x] Create `/src/components/workspace/CreateWorkspaceDialog.tsx`
  - Extracted from WorkspaceSwitcher for better separation of concerns
  - Implemented clean form with proper validation
  - Integrated with the createWorkspace function from useWorkspace hook
  - Added proper loading and error states

### 6.4 Member Management Components

- [x] Update `/src/components/workspace/members/members-list.tsx`
  - Refactored to use useWorkspace hooks
  - Implemented proper loading and error states
  - Added client-side filtering and sorting

- [x] Update `/src/components/workspace/members/members-header.tsx`
  - Updated imports to use correct type paths
  - Simplified props interface to remove unused properties
  - Fixed integration with parent components

- [x] Update `/src/components/workspace/members/member-item.tsx`
  - Implemented role management with permissions
  - Added remove member functionality
  - Integrated with useWorkspace and useWorkspacePermissions hooks

### 6.5 Invitation Management Components

- [x] Update `/src/components/workspace/invitation-list.tsx`
  - Refactor to use useWorkspaceMembers for invitations
  - Handle invitation status changes
  - Improve loading and error states

- [x] Update `/src/components/workspace/invitation-row.tsx`
  - Update invitation actions (resend, cancel)
  - Incorporate permission checks
  - Improve UI for better status visibility

- [x] Update `/src/components/workspace/invite-dialog.tsx`
  - Integrate with the new createInvitation function
  - Add proper validation and error handling
  - Implement role selection based on user permissions

## Phase 7: Integration and Testing

### 7.1 Update Dashboard Integration

- [x] Update `/src/app/dashboard/layout.tsx`
  - Integrate new workspace provider
  - Handle workspace initialization

### 7.2 Update Workspace Pages

- [x] Update `/src/app/dashboard/workspace/page.tsx`
  - Integrate with new workspace system
  - Handle loading and error states properly
  
- [x] Update `/src/app/dashboard/workspace/[workspaceId]/page.tsx`
  - Integrate with useWorkspace, useWorkspacePermissions hooks
  - Implement routing with params instead of store state
  - Implement proper loading and error handling

- [x] Update `/src/app/dashboard/workspace/[workspaceId]/settings/page.tsx`
  - Integrate with new hooks for workspace settings
  - Update UI to respect permission system

- [x] Update `/src/app/dashboard/workspace/[workspaceId]/settings/team/page.tsx`
  - Integrate with member management hooks
  - Add permission-based UI controls

### 7.3 Testing

- [ ] Create test plan for workspace functionality
- [ ] Implement tests for core services and hooks
- [ ] Perform manual testing of UI components

## Implementation Order

For the most efficient implementation, follow this order:

1. Phase 1: Clean up and delete files
2. Phase 2: Rebuild type system
3. Phase 3: Rebuild core services
4. Phase 4: Create new state management
5. Phase 5: Create simplified hooks
6. Phase 6: Rebuild UI components
7. Phase 7: Integration and testing

This approach allows you to build from the foundation up, ensuring each layer is solid before moving to the next.
