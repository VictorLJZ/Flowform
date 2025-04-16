/**
 * Debug Logger Utility
 * 
 * Centralized logging for debugging with categorization and timestamps
 */

type LogCategory = 'TAB-FOCUS' | 'WORKSPACE' | 'STORAGE' | 'AUTH' | 'NETWORK' | 'STATE';

const debugEnabled = process.env.NODE_ENV === 'development';

export const debugLog = (category: LogCategory, message: string, data?: unknown) => {
  if (!debugEnabled) return;
  
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}][${category}]`;
  
  if (data) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
};

export const tabFocusLog = (message: string, data?: unknown) => debugLog('TAB-FOCUS', message, data);
export const workspaceLog = (message: string, data?: unknown) => debugLog('WORKSPACE', message, data);
export const storageLog = (message: string, data?: unknown) => debugLog('STORAGE', message, data);
export const authLog = (message: string, data?: unknown) => debugLog('AUTH', message, data);
export const networkLog = (message: string, data?: unknown) => debugLog('NETWORK', message, data);
export const stateLog = (message: string, data?: unknown) => debugLog('STATE', message, data);
