"use client"

import { useEffect } from 'react'
import { tabFocusLog, networkLog } from '@/lib/debug-logger'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useAuthStore } from '@/stores/authStore'
import { useFormStore } from '@/stores/formStore'
import { reconnectClient } from '@/lib/supabase/client'
import { verifyAuthDirect, fetchWorkspacesDirect, fetchFormsDirect } from '@/lib/auth/direct-auth'

/**
 * TabFocusMonitor component
 * 
 * Monitors tab focus/blur events to detect tab switching and reconnect Supabase
 * to prevent infinite loading states when returning to the app
 */
export function TabFocusMonitor() {
  // Use refs to safely access latest store state in event handlers
  const getWorkspaceStore = () => useWorkspaceStore.getState()
  
  useEffect(() => {
    let lastActive = Date.now()
    let reconnectCount = 0
    
    // Minimum time away (in ms) before we force a reconnection
    // This prevents unnecessary reconnections for very brief tab switches
    const MIN_TIME_AWAY_MS = 1000 // 1 second

    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible'
      const now = Date.now()
      
      if (isVisible) {
        // Tab gained focus
        const timeAway = now - lastActive
        
        // Only reconnect if we've been away for at least the minimum time
        if (timeAway >= MIN_TIME_AWAY_MS) {
          tabFocusLog(`Tab gained focus after ${timeAway}ms away - reconnecting Supabase`)
          
          // Get current store states (safely outside the closures)
          const workspaceState = getWorkspaceStore()
          
          tabFocusLog('Workspace state before reconnection', {
            isLoading: workspaceState.isLoading,
            currentWorkspaceId: workspaceState.currentWorkspace?.id,
            workspaceCount: workspaceState.workspaces.length,
            timeAwayMs: timeAway,
            timestamp: new Date().toISOString()
          })
          
          // CRITICAL: Force reconnect the Supabase client to prevent orphaned queries
          try {
            reconnectCount++
            networkLog(`Tab focus reconnection #${reconnectCount}`, {
              timestamp: new Date().toISOString(),
              timeAwayMs: timeAway
            })
            
            // This is the critical call that refreshes the Supabase connection
            reconnectClient()
            
            networkLog('Supabase client reconnected successfully', {
              timestamp: new Date().toISOString(),
              reconnectCount
            })
            
            // CRITICAL: After successfully reconnecting Supabase,
            // we need to properly sequence auth verification BEFORE data fetching
            setTimeout(async () => {
              try {
                tabFocusLog('🔄 Sequencing auth verification after reconnection')
                
                // STEP 1: Use direct HTTP for auth verification instead of WebSockets
                tabFocusLog('🔄 Starting direct HTTP auth verification after reconnection')
                
                // Direct HTTP verification - less prone to WebSocket issues after tab switching
                const authResult = await verifyAuthDirect()
                
                if (authResult.error || !authResult.user) {
                  tabFocusLog('⚠️ Direct auth verification failed, will not proceed with data fetch')
                  return // Exit early without data fetching
                }
                
                // Auth verification was successful, update the auth store
                tabFocusLog('🔄 Direct auth verification successful')
                const authStore = useAuthStore.getState()
                authStore.setUser({
                  id: authResult.user.id,
                  email: authResult.user.email || '',
                  user_metadata: authResult.user.user_metadata || {},
                  app_metadata: authResult.user.app_metadata || {}
                })
                
                // Short wait for state updates to propagate
                await new Promise(resolve => setTimeout(resolve, 100))
                
                // STEP 2: Use direct HTTP for workspace data fetching
                const userId = authResult.user.id
                if (userId) {
                  tabFocusLog('🔄 Fetching workspaces via direct HTTP')
                  const workspaceResult = await fetchWorkspacesDirect(userId)
                  
                  if (workspaceResult.data && Array.isArray(workspaceResult.data)) {
                    // Update workspace store - manually set current workspace instead of using setWorkspaces
                    const workspaceStore = useWorkspaceStore.getState()
                    
                    // Convert the API response to the format the store expects, ensuring all required fields
                    const workspaces = workspaceResult.data.map((member: {
  workspace_id: string;
  role?: string;
  workspaces: {
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    created_by?: string;
    owner_id?: string;
    logo_url?: string;
    settings?: Record<string, unknown>;
  };
}) => ({
                      id: member.workspace_id,
                      name: member.workspaces.name,
                      description: member.workspaces.description,
                      created_at: member.workspaces.created_at,
                      updated_at: member.workspaces.updated_at,
                      created_by: (member.workspaces.created_by || member.workspaces.owner_id) || '', // Ensure created_by is never undefined
                      logo_url: member.workspaces.logo_url || null,
                      settings: member.workspaces.settings || null,
                      // Store role separately as it's not part of the Workspace interface
                      role: member.role
                    }))
                    
                    // Since there's no direct setWorkspaces method, we'll use the state setter
                    // and maintain the currentWorkspace if possible
                    const currentId = workspaceStore.currentWorkspace?.id
                    const currentExists = currentId && workspaces.some(w => w.id === currentId)
                    const newCurrentWorkspace = currentExists 
                      ? workspaces.find(w => w.id === currentId) || workspaces[0] || null
                      : workspaces[0] || null
                      
                    // Apply updates directly - Zustand state updates need to use set() from the store
                    useWorkspaceStore.setState({ 
                      workspaces, 
                      currentWorkspace: newCurrentWorkspace,
                      isLoading: false 
                    })
                  }
                }
                
                // STEP 3: Use direct HTTP for forms data fetching
                tabFocusLog('🔄 Fetching forms via direct HTTP')
                const formsResult = await fetchFormsDirect()
                
                if (formsResult.data && Array.isArray(formsResult.data)) {
                  // Since there's no direct setForms method, we'll update the store manually
                  // No need to store the reference to formStore
                  useFormStore.setState({ forms: formsResult.data, lastFetchTime: Date.now() })
                }
                
                // Also trigger the regular refetchAll to ensure any additional logic is executed
                const formStore = useFormStore.getState()
                formStore.refetchAll()
                
                // Add other stores' refetch methods here as needed
                // e.g., workspaceStore.refetchAll() if implemented
                
                tabFocusLog('🔄 Global data refetch initiated successfully')
              } catch (error) {
                console.error('Error in tab focus reconnection sequence:', error)
              }
            }, 300) // Small delay to ensure Supabase connection is fully established
          } catch (error) {
            console.error('Error reconnecting Supabase client:', error)
          }
        } else {
          tabFocusLog(`Tab gained focus after only ${timeAway}ms - skipping reconnection`)
        }
      } else {
        // Tab lost focus - record the time
        tabFocusLog(`Tab lost focus after ${now - lastActive}ms of activity`)
        lastActive = now
      }
    }

    const handleWindowFocus = () => tabFocusLog('Window focused')
    const handleWindowBlur = () => tabFocusLog('Window blurred')
    
    // Log initial state
    tabFocusLog('🔄 TabFocusMonitor initialized', {
      isVisible: document.visibilityState === 'visible',
      hasFocus: document.hasFocus(),
      timestamp: new Date().toISOString()
    })
    
    // Add event listeners for visibility and focus events
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleWindowFocus)
    window.addEventListener('blur', handleWindowBlur)
    
    // Cleanup event listeners when component unmounts
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleWindowFocus)
      window.removeEventListener('blur', handleWindowBlur)
    }
  }, [])
  
  // This is a utility component that doesn't render anything
  return null
}
