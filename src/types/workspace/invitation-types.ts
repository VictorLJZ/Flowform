/**
 * Extended workspace invitation types
 * 
 * This file defines additional types related to workspace invitations following the project's
 * three-layer type system architecture (Db/Api/Ui). It extends the core invitation types
 * defined in ApiWorkspace.ts, DbWorkspace.ts, and UiWorkspace.ts.
 */

import { ApiWorkspaceInvitation, ApiWorkspaceRole } from './ApiWorkspace';

/**
 * Email data structure for invitation emails
 */
export interface InvitationEmailData {
  messageId: string;
  accepted: string[];
  rejected: string[];
  pending: string[];
  response: {
    id: string;
    status: string;
  };
}

/**
 * Invitation send response
 */
export interface InvitationSendResponse {
  success: boolean;
  emailData: InvitationEmailData;
}

/**
 * Bulk invitation input for creating multiple invitations at once
 */
export interface ApiBulkInvitationInput {
  emails: string[];
  role: ApiWorkspaceRole;
  message?: string;
}

/**
 * Extended invitation type with additional tracking information
 */
export interface ApiWorkspaceInvitationWithTracking extends ApiWorkspaceInvitation {
  emailSentAt?: string;
  emailStatus?: 'sent' | 'failed' | 'pending';
  lastReminderSentAt?: string;
}
