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
  
  try {
    // Create Supabase client
    const supabase = createClient();

    
    // Check session
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    

    
    // Test workspaces table access

    
    // Test workspace_members table
    if (session?.user?.id) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data: memberData, error: memberError, status: memberStatus } = await supabase
        .from('workspace_members')
        .select('workspace_id, role')
        .eq('user_id', session.user.id)
        .limit(1);
        

      
      // Test workspaces table
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data: wsData, error: wsError, status: wsStatus } = await supabase
        .from('workspaces')
        .select('id, name, description')
        .limit(1);
        

      
      // Test forms table
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data: formsData, error: formsError, status: formsStatus } = await supabase
        .from('forms')
        .select('form_id, title, status')
        .limit(1);
        

    }
    

    return { success: true, isAuthenticated: !!session, userId: session?.user?.id };
  } catch (error) {
    console.error('[AuthCheck] Error checking authentication:', error);
    return { success: false, error };
  }
}

// Make available globally in development
if (process.env.NODE_ENV === 'development') {
  if (typeof window !== 'undefined') {
    // Use a more specific type for the window object
    (window as Window & typeof globalThis & { checkAuth?: typeof checkAuthStatus }).checkAuth = checkAuthStatus;

  }
}
