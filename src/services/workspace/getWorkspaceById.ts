import { createClient } from "@/lib/supabase/client";
import { ApiWorkspace } from "@/types/workspace/ApiWorkspace";

/**
 * Get a workspace by its ID
 * @param workspaceId The workspace ID to retrieve
 * @returns The workspace if found, null otherwise
 */
export async function getWorkspaceById(workspaceId: string): Promise<ApiWorkspace | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single();
  
  if (error || !data) {
    console.error("Error fetching workspace:", error);
    return null;
  }
  
  return data as ApiWorkspace;
}
