import { createClient } from '@/lib/supabase/client';

/**
 * Utility function to check authentication status
 * Run this in the browser console to diagnose authentication issues
 * 
 * Usage: 
 * 1. Import in a component: import { checkAuthStatus } from '@/lib/debug/authCheck'
 * 2. Call in useEffect or event handler: await checkAuthStatus()
 * 3. Or expose to window for console access: (window as any).checkAuth = checkAuthStatus
 */
export async function checkAuthStatus() {
  console.log('[AuthCheck] Starting authentication check...');
  
  try {
    // Create Supabase client
    const supabase = createClient();
    console.log('[AuthCheck] Supabase client created');
    
    // Check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('[AuthCheck] Session status:', {
      hasSession: !!session,
      sessionError: sessionError,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userMetadata: session?.user?.user_metadata,
      expiresAt: session?.expires_at,
      // Show when token expires in readable format
      expiresIn: session?.expires_at ? 
        new Date(session.expires_at * 1000).toLocaleString() : 
        'Unknown',
      tokenType: session?.token_type,
      // Only show first and last few characters of the token
      accessToken: session?.access_token ? 
        `${session.access_token.substring(0, 10)}...${session.access_token.substring(session.access_token.length - 10)}` : 
        'No token',
      refreshToken: session?.refresh_token ?
        `${session.refresh_token.substring(0, 5)}...${session.refresh_token.substring(session.refresh_token.length - 5)}` :
        'No refresh token'
    });
    
    // Test workspaces table access
    console.log('[AuthCheck] Testing table access...');
    
    // Test workspace_members table
    if (session?.user?.id) {
      const { data: memberData, error: memberError, status: memberStatus } = await supabase
        .from('workspace_members')
        .select('workspace_id, role')
        .eq('user_id', session.user.id)
        .limit(1);
        
      console.log('[AuthCheck] workspace_members table access:', {
        success: !memberError,
        status: memberStatus,
        error: memberError,
        data: memberData
      });
      
      // Test workspaces table
      const { data: wsData, error: wsError, status: wsStatus } = await supabase
        .from('workspaces')
        .select('id, name, description')
        .limit(1);
        
      console.log('[AuthCheck] workspaces table access:', {
        success: !wsError,
        status: wsStatus,
        error: wsError,
        data: wsData
      });
      
      // Test forms table
      const { data: formsData, error: formsError, status: formsStatus } = await supabase
        .from('forms')
        .select('form_id, title, status')
        .limit(1);
        
      console.log('[AuthCheck] forms table access:', {
        success: !formsError,
        status: formsStatus,
        error: formsError,
        data: formsData
      });
    }
    
    console.log('[AuthCheck] Complete. Check browser console for detailed results.');
    return { success: true, isAuthenticated: !!session, userId: session?.user?.id };
  } catch (error) {
    console.error('[AuthCheck] Error checking authentication:', error);
    return { success: false, error };
  }
}

// Make available globally in development
if (process.env.NODE_ENV === 'development') {
  if (typeof window !== 'undefined') {
    (window as any).checkAuth = checkAuthStatus;
    console.log('[AuthCheck] Auth check function available in console. Type "checkAuth()" to run.');
  }
}
