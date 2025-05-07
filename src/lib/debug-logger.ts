/**
 * Debug Logger Utility
 * 
 * All logging functionality has been disabled
 */

type LogCategory = 'TAB-FOCUS' | 'WORKSPACE' | 'STORAGE' | 'AUTH' | 'NETWORK' | 'STATE';

// Disabled debug logging
export const debugLog = (category: LogCategory, message: string, data?: unknown) => {
  // No-op: all logging functionality has been disabled
};

// No-op helper functions maintaining the original API signatures
export const tabFocusLog = (message: string, data?: unknown) => {};
export const workspaceLog = (message: string, data?: unknown) => {};
export const storageLog = (message: string, data?: unknown) => {};
export const authLog = (message: string, data?: unknown) => {};
export const networkLog = (message: string, data?: unknown) => {};
export const stateLog = (message: string, data?: unknown) => {};
