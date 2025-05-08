/**
 * Debug Logger Utility
 * 
 * All logging functionality has been disabled
 */

type LogCategory = 'TAB-FOCUS' | 'WORKSPACE' | 'STORAGE' | 'AUTH' | 'NETWORK' | 'STATE';

// Disabled debug logging
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const debugLog = (_category: LogCategory, _message: string, _data?: unknown) => {
  // No-op: all logging functionality has been disabled
};

// No-op helper functions maintaining the original API signatures
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const tabFocusLog = (_message: string, _data?: unknown) => {};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const workspaceLog = (_message: string, _data?: unknown) => {};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const storageLog = (_message: string, _data?: unknown) => {};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const authLog = (_message: string, _data?: unknown) => {};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const networkLog = (_message: string, _data?: unknown) => {};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const stateLog = (_message: string, _data?: unknown) => {};
