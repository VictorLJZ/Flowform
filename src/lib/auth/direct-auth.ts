/**
 * Direct Auth API Module
 * 
 * This module provides direct HTTP-based alternatives to Supabase auth functions
 * that bypass WebSocket connections, which can be problematic after tab switching.
 * 
 * These functions use direct fetch calls to Supabase REST endpoints with proper auth headers.
 */

import { createClient } from '@/lib/supabase/client';

/**
 * Directly verify user authentication via HTTP
 * Bypasses WebSocket connections which often fail after tab switching
 */
export async function verifyAuthDirect() {
  // First try to get the current session token
  try {
    const supabase = createClient();
    
    // Attempt to get the session (this shouldn't use WebSockets)
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData?.session?.access_token) {
      console.log('[DirectAuth] No session token found');
      return { user: null, error: 'No session token' };
    }
    
    // Use direct fetch with proper auth header instead of WebSocket-based API
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${sessionData.session.access_token}`,
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`Direct auth API request failed: ${response.status}`);
    }
    
    const userData = await response.json();
    console.log('[DirectAuth] Verification successful via direct HTTP');
    
    return { 
      user: userData, 
      error: null,
      session: sessionData.session
    };
  } catch (error) {
    console.error('[DirectAuth] Error during direct auth verification:', error);
    return { user: null, error };
  }
}

/**
 * Fetch workspace data directly via HTTP rather than using Supabase client
 * This is more reliable after tab switching
 */
export async function fetchWorkspacesDirect(userId: string) {
  try {
    const supabase = createClient();
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData?.session?.access_token) {
      console.log('[DirectAuth] No session token for workspace fetch');
      return { data: null, error: 'No session token' };
    }
    
    // Direct fetch to the workspace_members REST endpoint
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/workspace_members?user_id=eq.${userId}&select=workspace_id,role,workspaces(*)`, 
      {
        headers: {
          'Authorization': `Bearer ${sessionData.session.access_token}`,
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Content-Type': 'application/json',
        },
        method: 'GET'
      }
    );
    
    if (!response.ok) {
      throw new Error(`Direct workspace API request failed: ${response.status}`);
    }
    
    const workspaceData = await response.json();
    console.log('[DirectAuth] Workspace fetch successful via direct HTTP');
    
    return { data: workspaceData, error: null };
  } catch (error) {
    console.error('[DirectAuth] Error fetching workspaces directly:', error);
    return { data: null, error };
  }
}

/**
 * Fetch forms data directly via HTTP rather than using Supabase client
 */
export async function fetchFormsDirect(workspaceId?: string) {
  try {
    const supabase = createClient();
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData?.session?.access_token) {
      console.log('[DirectAuth] No session token for forms fetch');
      return { data: null, error: 'No session token' };
    }
    
    // Construct the URL based on whether workspaceId is provided
    const url = workspaceId
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/forms?workspace_id=eq.${workspaceId}&select=*`
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/forms?select=*`;
    
    // Direct fetch to the forms REST endpoint
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${sessionData.session.access_token}`,
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        'Content-Type': 'application/json',
      },
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`Direct forms API request failed: ${response.status}`);
    }
    
    const formsData = await response.json();
    console.log('[DirectAuth] Forms fetch successful via direct HTTP');
    
    return { data: formsData, error: null };
  } catch (error) {
    console.error('[DirectAuth] Error fetching forms directly:', error);
    return { data: null, error };
  }
}
