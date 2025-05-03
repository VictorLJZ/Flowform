// Workspace Service - Client Index File
// Re-exports only client-safe workspace services that can be used in client components

// Client-side implementations
export * from './getUserWorkspacesClient';
export * from './getWorkspaceMembersClient';
export * from './getWorkspaceClient';
export * from './changeUserRoleClient';
export * from './removeWorkspaceMemberClient';

// Direct services that don't use server-side imports
export * from './createWorkspace';
export * from './updateWorkspace';
export * from './deleteWorkspace';
export * from './initializeDefaultWorkspace';
export * from './leaveWorkspace';

// Invitation management (ensuring client-safety)
export * from './inviteToWorkspace';
export * from './acceptInvitation';
export * from './declineInvitation';
export * from './getPendingInvitations';
export * from './getSentInvitations';
export * from './resendInvitation';
export * from './revokeInvitation';
