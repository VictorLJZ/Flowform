/**
 * Server-side workspace member operations
 * 
 * This file provides functions for managing workspace membership.
 * All functions return database types with snake_case property names.
 */

import { createClient } from '@/lib/supabase/server';
import { DbWorkspaceMember, DbWorkspaceRole } from '@/types/workspace';

/**
 * Extended workspace member type with profile information
 */
export interface DbWorkspaceMemberWithProfile extends DbWorkspaceMember {
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
  };
}

/**
 * Get all members of a workspace
 * 
 * @param workspaceId - UUID of the workspace
 * @returns Array of workspace members
 */
export async function getWorkspaceMembers(workspaceId: string): Promise<DbWorkspaceMember[]> {
  if (!workspaceId) return [];
  
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspaceId);
      
    if (error) throw error;
    
    return data as DbWorkspaceMember[];
  } catch (error) {
    throw new Error(`Failed to get workspace members: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get workspace members with their profile information
 * 
 * @param workspaceId - UUID of the workspace
 * @returns Array of workspace members with profiles
 */
export async function getWorkspaceMembersWithProfiles(workspaceId: string): Promise<DbWorkspaceMemberWithProfile[]> {
  if (!workspaceId) return [];
  
  try {
    const supabase = await createClient();
    
    // Define our expected structure for type safety after the cast
    interface DbMemberWithProfileJoin {
      workspace_id: string;
      user_id: string;
      role: DbWorkspaceRole;
      joined_at: string;
      profiles: {
        full_name: string | null;
        avatar_url: string | null;
        email: string | null;
      };
    }
    
    // Join workspace_members with profiles table using separate queries for now
    // Get all workspace members first
    const { data: members, error: membersError } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspaceId);
      
    if (membersError) throw membersError;
    if (!members || members.length === 0) return [];
    
    // Get profiles for all members
    const userIds = members.map(member => member.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, email')
      .in('id', userIds);
      
    if (profilesError) throw profilesError;
    
    // Create a map of profiles by user ID for easy lookup
    const profileMap = (profiles || []).reduce((map, profile) => {
      map[profile.id] = profile;
      return map;
    }, {} as Record<string, any>);
    
    // Combine member data with profile data
    const data = members.map(member => {
      const profile = profileMap[member.user_id] || {};
      return {
        ...member,
        profiles: {
          full_name: profile.full_name || null,
          avatar_url: profile.avatar_url || null,
          email: profile.email || null
        }
      };
    });
    
    // First cast to unknown, then to our expected type for safety
    const typedData = (data as unknown) as DbMemberWithProfileJoin[];
    
    // Transform the join result to match DbWorkspaceMemberWithProfile
    return typedData.map(item => ({
      workspace_id: item.workspace_id,
      user_id: item.user_id,
      role: item.role,
      joined_at: item.joined_at,
      profile: {
        full_name: item.profiles ? item.profiles.full_name : null,
        avatar_url: item.profiles ? item.profiles.avatar_url : null,
        email: item.profiles ? item.profiles.email : null
      }
    })) as DbWorkspaceMemberWithProfile[];
  } catch (error) {
    console.error('Detailed error in getWorkspaceMembersWithProfiles:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to get workspace members with profiles: ${error.message}`);
    } else {
      console.error('Non-Error object thrown:', error);
      throw new Error(`Failed to get workspace members with profiles: ${JSON.stringify(error)}`);
    }
  }
}

/**
 * Add a member to a workspace
 * 
 * @param member - Member data to add (without joined_at timestamp)
 * @returns The newly created workspace member
 */
export async function addWorkspaceMember(
  member: Omit<DbWorkspaceMember, 'joined_at'>
): Promise<DbWorkspaceMember> {
  try {
    const supabase = await createClient();
    
    // Check if the user is already a member
    const { data: existingMember, error: checkError } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', member.workspace_id)
      .eq('user_id', member.user_id)
      .maybeSingle();
      
    if (checkError) throw checkError;
    
    // If already a member, return existing record
    if (existingMember) {
      return existingMember as DbWorkspaceMember;
    }
    
    // Add joined_at timestamp
    const newMember = {
      ...member,
      joined_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('workspace_members')
      .insert([newMember])
      .select()
      .single();
      
    if (error) throw error;
    
    return data as DbWorkspaceMember;
  } catch (error) {
    throw new Error(`Failed to add workspace member: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update a member's role in a workspace
 * 
 * @param workspaceId - UUID of the workspace
 * @param userId - UUID of the user
 * @param role - New role to assign
 * @returns The updated workspace member
 */
export async function updateMemberRole(
  workspaceId: string,
  userId: string,
  role: DbWorkspaceRole
): Promise<DbWorkspaceMember> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('workspace_members')
      .update({ role })
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .select()
      .single();
      
    if (error) throw error;
    
    return data as DbWorkspaceMember;
  } catch (error) {
    throw new Error(`Failed to update member role: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Remove a member from a workspace
 * 
 * @param workspaceId - UUID of the workspace
 * @param userId - UUID of the user to remove
 * @returns Object indicating success
 */
export async function removeWorkspaceMember(
  workspaceId: string,
  userId: string
): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();
    
    // Check if removing an owner
    const { data: member, error: checkError } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single();
      
    if (checkError) throw checkError;
    
    // Only proceed if the member exists
    if (member) {
      // Check if this is the last owner
      if (member.role === 'owner') {
        const { data: owners, error: ownersError } = await supabase
          .from('workspace_members')
          .select('user_id')
          .eq('workspace_id', workspaceId)
          .eq('role', 'owner');
          
        if (ownersError) throw ownersError;
        
        // If this is the only owner, prevent removal
        if (owners.length === 1 && owners[0].user_id === userId) {
          throw new Error('Cannot remove the last owner of a workspace');
        }
      }
      
      // Remove the member
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId);
        
      if (error) throw error;
    }
    
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to remove workspace member: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if a user is a member of a workspace
 * 
 * @param workspaceId - UUID of the workspace
 * @param userId - UUID of the user
 * @returns true if the user is a member, false otherwise
 */
export async function checkWorkspaceMembership(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('workspace_members')
      .select('user_id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    throw new Error(`Failed to check workspace membership: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
