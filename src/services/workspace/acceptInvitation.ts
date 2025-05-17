import { createClient } from "@/lib/supabase/client";
import { ApiWorkspace } from "@/types/workspace/ApiWorkspace";

/**
 * Accept a workspace invitation using the invitation token
 * @param token The invitation token
 * @returns The workspace that the user has been added to
 */
export async function acceptInvitation(token: string): Promise<ApiWorkspace> {
  const supabase = createClient();
  
  // First get the invitation details
  const { data: invitation, error: invitationError } = await supabase
    .from("workspace_invitations")
    .select(`
      *,
      workspaces:workspace_id (*)
    `)
    .eq("token", token)
    .single();
  
  if (invitationError || !invitation) {
    throw new Error("Invalid invitation or token has expired");
  }
  
  // Get the current user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    throw new Error("Authentication required");
  }
  
  // Check if email matches the invitation
  if (userData.user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
    throw new Error(`This invitation was sent to ${invitation.email}`);
  }
  
  // Check if invitation has expired
  if (new Date(invitation.expires_at) < new Date()) {
    throw new Error("This invitation has expired");
  }
  
  // Add the user to the workspace
  const { error: memberError } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: invitation.workspace_id,
      user_id: userData.user.id,
      role: invitation.role,
    });
  
  if (memberError) {
    if (memberError.code === "23505") {
      // User already exists in workspace (unique constraint violation)
      throw new Error("You are already a member of this workspace");
    }
    throw new Error("Failed to join workspace");
  }
  
  // Mark the invitation as accepted
  await supabase
    .from("workspace_invitations")
    .update({ status: "accepted" })
    .eq("token", token);
  
  // Return the workspace
  return invitation.workspaces as ApiWorkspace;
}
