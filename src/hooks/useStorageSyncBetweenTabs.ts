import { useEffect } from 'react';

/**
 * Hook for synchronizing state between browser tabs
 * 
 * This hook enables cross-tab communication for any state by:
 * 1. Listening for storage events from other tabs
 * 2. Parsing the storage value
 * 3. Calling the provided callback with the new state
 */
export function useStorageSyncBetweenTabs<T>(
  storageKey: string,
  onUpdate: (newState: T) => void
) {
  useEffect(() => {
    // Handler for the storage event (fired in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      // Only process events for our specific key
      if (e.key === storageKey && e.newValue) {
        try {
          // Parse the new value (stored as JSON string)
          const newState = JSON.parse(e.newValue) as T;
          console.log(`[useStorageSyncBetweenTabs] Received update from another tab for key "${storageKey}"`, newState);
          
          // Update local state with the value from the other tab
          onUpdate(newState);
        } catch (error) {
          console.error(`[useStorageSyncBetweenTabs] Error parsing storage value for "${storageKey}":`, error);
        }
      }
    };
    
    // Add event listener for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [storageKey, onUpdate]);
}
