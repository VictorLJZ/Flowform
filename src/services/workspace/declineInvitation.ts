import { createClient } from "@/lib/supabase/client";

/**
 * Decline a workspace invitation using the invitation token
 * @param token The invitation token
 */
export async function declineInvitation(token: string): Promise<void> {
  const supabase = createClient();
  
  // Mark the invitation as declined
  const { error } = await supabase
    .from("workspace_invitations")
    .update({ status: "declined" })
    .eq("token", token);
  
  if (error) {
    throw new Error("Failed to decline invitation");
  }
}
