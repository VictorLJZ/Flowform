"use client"

import { useEffect } from 'react'
import { storageLog } from '@/lib/debug-logger'

/**
 * StorageMonitor component
 * 
 * Monitors localStorage changes to debug cross-tab synchronization issues
 */
export function StorageMonitor() {
  useEffect(() => {
    // Log initial state
    try {
      const workspaceStorage = localStorage.getItem('workspace-storage')
      storageLog('Initial workspace storage state:', workspaceStorage ? JSON.parse(workspaceStorage) : null)
    } catch (err) {
      storageLog('Error reading initial localStorage:', err)
    }
    
    // Listen for storage events (fired when localStorage changes in OTHER tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'workspace-storage' || e.key === null) {
        storageLog('Storage changed in another tab', {
          key: e.key,
          newValue: e.newValue ? JSON.parse(e.newValue) : null,
          oldValue: e.oldValue ? JSON.parse(e.oldValue) : null,
        })
      }
    }
    
    // Monitor storage events (which fire when changes happen in OTHER tabs)
    window.addEventListener('storage', handleStorageChange)

    // Create a MutationObserver to monitor when DOM changes after tab focus
    const observer = new MutationObserver((mutations) => {
      storageLog('DOM mutations after storage/tab change:', { 
        mutations: mutations.length,
        timestamp: new Date().toISOString()
      })
    })

    // Start observing the document with the configured parameters
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      characterData: true
    })
    
    storageLog('StorageMonitor initialized')
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      observer.disconnect()
    }
  }, [])
  
  // This is a utility component that doesn't render anything
  return null
}
