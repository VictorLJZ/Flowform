"use client"

import { StorageMonitor } from './storage-monitor'
import { AuthMonitor } from './auth-monitor'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { debugLog } from '@/lib/debug-logger'

/**
 * DebugProvider component
 * 
 * Centralizes all debugging utilities to monitor application behavior
 * Specifically targeting the workspace tab-switching issue
 */
export function DebugProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Log initial render and route changes
  useEffect(() => {
    debugLog('STATE', 'Page mounted/changed', { pathname })
    
    // Log browser performance metrics
    const navigationEntries = performance.getEntriesByType('navigation')
    if (navigationEntries.length > 0) {
      const navEntry = navigationEntries[0] as PerformanceNavigationTiming
      debugLog('STATE', 'Navigation performance', {
        type: navEntry.type,
        redirectCount: navEntry.redirectCount,
        domComplete: navEntry.domComplete,
        loadEventEnd: navEntry.loadEventEnd,
        duration: navEntry.duration
      })
    }

    // Performance observer to monitor long tasks
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) {  // Only log tasks longer than 50ms
          debugLog('STATE', 'Long task detected', { 
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name
          })
        }
      })
    })
    
    // Start observing long tasks
    try {
      observer.observe({ entryTypes: ['longtask'] })
    } catch {
      // Some browsers might not support this
      console.warn('PerformanceObserver for longtasks not supported')
    }
    
    return () => {
      try {
        observer.disconnect()
      } catch {
        // Ignore errors on cleanup
      }
    }
  }, [pathname])
  
  return (
    <>
      <StorageMonitor />
      <AuthMonitor />
      {children}
    </>
  )
}
