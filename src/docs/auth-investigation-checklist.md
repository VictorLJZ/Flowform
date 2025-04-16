# Authentication Issue Investigation Checklist

## Problem Statement
When switching tabs and returning to the application, the auth verification appears to get stuck in a "verifying" state, which blocks all subsequent operations including workspace loading and data fetching.

## Investigation Checklist

### 1. Log and Analyze Auth State Transitions
- [ ] Add detailed logging to `verifyAuth()` in `authStore.ts`
  - [ ] Log entry point and initial state
  - [ ] Log Supabase client creation
  - [ ] Log auth.getUser() call and response
  - [ ] Log state transitions
  - [ ] Log all exit points (success, errors, finally block)

### 2. Check Supabase Client Implementation
- [ ] Examine `createClient()` in `/src/lib/supabase/client.ts`
  - [ ] Check how tokens are handled
  - [ ] Verify initialization process
  - [ ] Look for any potential race conditions

### 3. Test Session Management
- [ ] Add session logging to `verifyAuth()`
  - [ ] Log session existence
  - [ ] Log session expiration details
  - [ ] Compare with current time

### 4. Add Timeout Protection
- [ ] Implement safety timeout in `verifyAuth()`
  - [ ] Set timeout to reset state after 10 seconds
  - [ ] Log timeout events if they occur

### 5. Debug Tab Switching Event Flow
- [ ] Log detailed tab visibility events
  - [ ] Document exact sequence from blur to focus
  - [ ] Track all triggered functions

### 6. Investigate Dependencies Between Components
- [ ] Map dependency chain:
  - [ ] AuthProvider → AuthStore → WorkspaceValidator → WorkspaceStore
  - [ ] Identify potential circular dependencies

### 7. Temporary Bypass Solutions
- [ ] Implement temporary fixes to isolate issues:
  - [ ] Bypass `syncStatus` check in `ensureStableAuth()`
  - [ ] Add forced state reset on tab visibility change

### 8. Network Request Analysis
- [ ] Observe Supabase network requests during tab switching
  - [ ] Check for failed or hanging requests
  - [ ] Verify request/response patterns

### 9. Investigate Fast Refresh Interactions
- [ ] Check if Fast Refresh during development disrupts auth flow
  - [ ] Test in production-like environment without Fast Refresh

## Implementation Plan

### Phase 1: Add Enhanced Logging
```typescript
// In authStore.ts - verifyAuth function
verifyAuth: async () => {
  console.log('⭐ [AUTH] STARTING verification, current syncStatus:', get().syncStatus);
  
  if (get().syncStatus === 'verifying') {
    console.log('⭐ [AUTH] Already verifying, skipping');
    return;
  }
  
  console.log('⭐ [AUTH] Setting syncStatus to verifying');
  set({ syncStatus: 'verifying' });
  
  try {
    console.log('⭐ [AUTH] Creating Supabase client');
    const supabase = createClient();
    
    console.log('⭐ [AUTH] Calling auth.getUser()');
    const { data, error } = await supabase.auth.getUser();
    
    console.log('⭐ [AUTH] getUser result:', { 
      success: !!data?.user,
      error: error?.message || null,
      userId: data?.user?.id || null
    });
    
    // Session check
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('⭐ [AUTH] Session status:', {
      hasSession: !!sessionData?.session,
      sessionExpires: sessionData?.session?.expires_at ? 
        new Date(sessionData.session.expires_at * 1000).toISOString() : 'no expiration',
      currentTime: new Date().toISOString()
    });
    
    // Original code continues...
    
    console.log('⭐ [AUTH] Completing verification, setting syncStatus to ready');
    
  } catch (error) {
    console.error('⭐ [AUTH] CRITICAL ERROR in verification:', error);
    console.log('⭐ [AUTH] Resetting syncStatus to ready after error');
    set({ syncStatus: 'ready', error: error.message });
  } finally {
    console.log('⭐ [AUTH] COMPLETED verification process, final syncStatus:', get().syncStatus);
  }
}
```

### Phase 2: Add Safety Timeout
```typescript
// Add to verifyAuth function
const verificationTimeout = setTimeout(() => {
  console.error('⭐ [AUTH] TIMEOUT: Auth verification took too long, resetting to ready state');
  set({ syncStatus: 'ready', error: 'Auth verification timed out' });
}, 10000); // 10 second timeout

try {
  // Existing code...
} finally {
  clearTimeout(verificationTimeout);
}
```

### Phase 3: Simplify Flow for Testing
```typescript
// Temporarily modify ensureStableAuth
ensureStableAuth: async () => {
  // Log current state
  console.log('⭐ [AUTH] ensureStableAuth called, current syncStatus:', get().syncStatus);
  
  // TEMPORARY: Add timeout protection
  const timeoutPromise = new Promise<void>((resolve) => {
    setTimeout(() => {
      console.warn('⭐ [AUTH] ensureStableAuth timed out, forcing resolution');
      resolve();
    }, 5000);
  });
  
  // Race between normal resolution and timeout
  return Promise.race([
    timeoutPromise,
    new Promise<void>(resolve => {
      // Only wait if not already ready
      if (get().syncStatus === 'ready') {
        console.log('⭐ [AUTH] Already stable, proceeding immediately');
        return resolve();
      }
      
      console.log('⭐ [AUTH] Waiting for stable auth state');
      const unsubscribe = useAuthStore.subscribe(state => {
        if (state.syncStatus === 'ready') {
          console.log('⭐ [AUTH] Auth became stable, resolving promise');
          unsubscribe();
          resolve();
        }
      });
    })
  ]);
}
```

## Analyzing Results

After implementing the logging:

1. **Look for Hanging Points**: Identify logs that appear before the problem but not after
2. **Check State Transitions**: Verify that `syncStatus` changes from "verifying" to "ready"
3. **Watch for Timeouts**: Note if safety timeouts are triggering

## Root Cause Identification Matrix

| Observed Behavior | Potential Root Cause |
|-------------------|----------------------|
| `verifyAuth()` never logs completion | Supabase API call is hanging |
| Error in console but syncStatus never resets | Exception handling issue |
| All logs appear but app still stuck | State not propagating to dependent components |
| Timeout triggers consistently | Underlying async operation never resolves |
| Session details show expired token | Token refresh mechanism failing |

This structured approach should help narrow down the exact cause of the authentication deadlock.
