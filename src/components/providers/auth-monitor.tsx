"use client"

import { useEffect, useRef } from 'react'
import { authLog, tabFocusLog } from '@/lib/debug-logger'
import { createClient } from '@/lib/supabase/client'
import { Session } from '@supabase/supabase-js'

/**
 * AuthMonitor component
 * 
 * Monitors authentication state changes to help debug auth-related issues
 * Particularly focused on token refresh events that might occur during tab switching
 */
export function AuthMonitor() {
  // Track token refresh events and expiration times
  const tokenState = useRef({
    lastRefreshedAt: 0,
    lastExpiresAt: 0,
    refreshCount: 0,
    lastTokenCheckBeforeAction: 0
  })

  // Track when operations started vs auth state changes
  const opState = useRef({
    pendingOperations: [] as {id: string, name: string, startTime: number}[],
    isTabActive: true
  })

  useEffect(() => {
    const supabase = createClient()
    
    // Log detailed auth state
    const logAuthState = async (trigger: string) => {
      const { data } = await supabase.auth.getSession()
      const now = Date.now()
      const expiresAtMs = data.session?.expires_at ? data.session.expires_at * 1000 : 0
      const timeRemaining = expiresAtMs ? expiresAtMs - now : null
      const tokenExpiringThreshold = 30000 // 30 seconds
      
      const isTokenExpiringSoon = timeRemaining !== null && timeRemaining < tokenExpiringThreshold
      
      authLog('Auth session state', {
        trigger,
        hasSession: !!data.session,
        expiresAt: data.session?.expires_at ? new Date(expiresAtMs).toISOString() : null,
        timeRemaining: timeRemaining !== null ? Math.round(timeRemaining / 1000) + 's' : null,
        isExpiringSoon: isTokenExpiringSoon,
        tokenRefreshCount: tokenState.current.refreshCount,
        pendingOps: opState.current.pendingOperations.length,
        accessToken: data.session?.access_token ? data.session.access_token.substring(0, 12) + '...' : null
      })
      
      // Update token state ref
      if (data.session?.expires_at) {
        tokenState.current.lastExpiresAt = expiresAtMs
      }
      
      if (isTokenExpiringSoon) {
        authLog('⚠️ Token expiring soon', { 
          timeRemaining: timeRemaining !== null ? Math.round(timeRemaining / 1000) + 's' : null,
          expiresAt: new Date(expiresAtMs).toISOString()
        })
      }
      
      return data.session
    }
    
    logAuthState('initial')
    
    // Track tab visibility changes
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible'
      opState.current.isTabActive = isVisible
      
      if (isVisible) {
        // Tab is now visible, check auth state
        logAuthState('tab_visible')
        
        // Check for pending operations that might have been affected
        if (opState.current.pendingOperations.length > 0) {
          authLog('Tab activated with pending operations', {
            pendingOps: opState.current.pendingOperations,
            pendingCount: opState.current.pendingOperations.length
          })
        }
      } else {
        // Tab lost visibility
        logAuthState('tab_hidden')
      }
    }
    
    // Monitor workspace rename operations
    const monitorOperation = (name: string) => {
      const opId = Date.now().toString(36) + Math.random().toString(36).substr(2)
      const operation = { id: opId, name, startTime: Date.now() }
      opState.current.pendingOperations.push(operation)
      
      // Log auth state immediately before operation
      tokenState.current.lastTokenCheckBeforeAction = Date.now()
      logAuthState('before_' + name)
      
      return {
        complete: () => {
          const index = opState.current.pendingOperations.findIndex(op => op.id === opId)
          if (index >= 0) {
            opState.current.pendingOperations.splice(index, 1)
            const duration = Date.now() - operation.startTime
            authLog(`Operation ${name} completed`, { opId, durationMs: duration })
          }
        }
      }
    }
    
    // Expose the monitor operation function globally for debugging
    // @ts-ignore
    window.__monitorOperation = monitorOperation
    
    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const now = Date.now()
      
      authLog('Auth state changed', {
        event,
        userId: session?.user?.id,
        expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
        pendingOps: opState.current.pendingOperations.length,
        tabActive: opState.current.isTabActive,
        tokenHeader: session?.access_token ? session.access_token.substring(0, 12) + '...' : null
      })
      
      // If this is a token refresh, log detailed information
      if (event === 'TOKEN_REFRESHED') {
        tokenState.current.lastRefreshedAt = now
        tokenState.current.refreshCount++
        
        const timeSinceLastCheck = now - tokenState.current.lastTokenCheckBeforeAction
        
        authLog('🔄 Token refresh detected', {
          timestamp: new Date().toISOString(),
          userId: session?.user?.id,
          newExpiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
          refreshCount: tokenState.current.refreshCount,
          timeSinceLastActionCheck: Math.round(timeSinceLastCheck / 1000) + 's',
          pendingOps: opState.current.pendingOperations,
          pendingOpNames: opState.current.pendingOperations.map(op => op.name),
          tabActive: opState.current.isTabActive
        })
      }
    })
    
    // Initially log auth state
    logAuthState('initial')
    
    // Create a timer to periodically check token expiration
    const intervalId = setInterval(() => {
      logAuthState('interval')
    }, 15000) // Check every 15 seconds
    
    // Monitor tab visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Monitor authentication/token issues in network requests
    const originalFetch = window.fetch
    window.fetch = async function(input, init) {
      // Only monitor Supabase requests
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
      
      if (url && url.includes('supabase')) {
        const requestStartTime = Date.now()
        const accessToken = init?.headers && typeof init.headers === 'object' ? 
          // @ts-ignore - We know headers might contain Authorization
          init.headers['Authorization'] || init.headers['authorization'] : null
          
        if (accessToken) {
          authLog('Fetch request with auth token', {
            url: url.substring(0, 50) + '...',
            tokenPrefix: accessToken ? accessToken.substring(0, 15) + '...' : null,
            timestamp: new Date().toISOString(),
            pendingOps: opState.current.pendingOperations.length
          })
        }
        
        try {
          const response = await originalFetch.apply(this, [input, init])
          const requestDuration = Date.now() - requestStartTime
          
          if (!response.ok && (response.status === 401 || response.status === 403)) {
            authLog('⚠️ Auth error in fetch response', {
              url: url.substring(0, 50) + '...',
              status: response.status,
              durationMs: requestDuration,
              pendingOps: opState.current.pendingOperations.length,
              tabActive: opState.current.isTabActive
            })
            
            // Check auth state when unauthorized error occurs
            logAuthState('auth_error')
          }
          
          return response
        } catch (error) {
          authLog('❌ Fetch request error', { 
            url: url.substring(0, 50) + '...',
            error: String(error),
            pendingOps: opState.current.pendingOperations.length
          })
          throw error
        }
      }
      
      return originalFetch.apply(this, [input, init])
    }
    
    return () => {
      subscription.unsubscribe()
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.fetch = originalFetch
      // @ts-ignore
      delete window.__monitorOperation
    }
  }, [])
  
  // This is a utility component that doesn't render anything
  return null
}
