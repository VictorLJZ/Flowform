// Analytics Service - Client-Side Index File
// Re-exports only client-safe analytics functions for use in client components

// Analytics retrieval services (client-side)
export * from './getFormAnalyticsClient';
export * from './getBlockPerformanceClient';

// Analytics tracking services (client-side)
export * from './trackFormViewClient';
export * from './trackFormCompletionClient';
export * from './trackBlockViewClient';

// Dynamic block analytics is already client-safe
export * from './trackDynamicBlockAnalytics';
