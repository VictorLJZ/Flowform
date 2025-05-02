# FlowForm Analytics Implementation Checklist

This checklist outlines the step-by-step process to implement the event-driven analytics system for FlowForm, organized into phases for easier implementation.

## Phase 1: Analytics Service Layer

- [ ] Create core analytics service
  - [ ] Create file: `/src/services/analytics/trackEvents.ts`
  - [ ] Implement `trackFormView()` function
  - [ ] Implement `trackBlockView()` function 
  - [ ] Implement `trackBlockInteraction()` function
  - [ ] Implement `trackFormCompletion()` function

- [ ] Create visitor identification system
  - [ ] Create file: `/src/lib/analytics/visitorId.ts`
  - [ ] Implement function to generate/retrieve anonymous visitor IDs
  - [ ] Add browser storage integration for persistent IDs

- [ ] Create event queuing mechanism
  - [ ] Create file: `/src/lib/analytics/eventQueue.ts`
  - [ ] Implement batching for multiple events
  - [ ] Add retry mechanism for network failures

## Phase 2: API Endpoints for Analytics

- [ ] Create API routes to receive tracking events
  - [ ] Create file: `/src/app/api/analytics/track/form-view/route.ts`
  - [ ] Create file: `/src/app/api/analytics/track/block-interaction/route.ts`
  - [ ] Create file: `/src/app/api/analytics/track/form-completion/route.ts`

- [ ] Implement database operations in API routes
  - [ ] Add Supabase insert operations for `form_views` table
  - [ ] Add Supabase insert operations for `form_interactions` table
  - [ ] Add operations to update response status on completion

## Phase 3: React Hooks for Analytics

- [ ] Create custom React hooks for analytics
  - [ ] Create file: `/src/hooks/useAnalytics.ts`
  - [ ] Implement `useFormViewTracking(formId)` hook
  - [ ] Implement `useBlockViewTracking(blockId, formId)` hook
  - [ ] Implement `useBlockInteractionTracking(blockId, formId)` hook
  - [ ] Implement `useFormCompletionTracking(formId, responseId)` hook

- [ ] Create utilities for timing and measurement
  - [ ] Add functions to measure time spent on blocks
  - [ ] Add functions to track scroll depth in form

## Phase 4: Integration with Form Components

- [ ] Update form container component
  - [ ] Edit file: `/src/components/form/form-container.tsx` (or similar)
  - [ ] Integrate form view tracking
  - [ ] Integrate completion tracking

- [ ] Update block components
  - [ ] Edit static block components to track visibility and interactions
  - [ ] Edit dynamic conversation blocks to track interactions
  - [ ] Add timing metrics to block interactions

- [ ] Update form submission handling
  - [ ] Add analytics events when forms are submitted
  - [ ] Track partial completions vs full completions

## Phase 5: Aggregated Metrics & Background Processing

- [ ] Create database functions for aggregation
  - [ ] Create SQL function to update `form_metrics` table
  - [ ] Create SQL function to update `block_metrics` table

- [ ] Implement scheduled jobs (if using Supabase Edge Functions)
  - [ ] Create function to run daily metrics calculations
  - [ ] Create function to clean up old raw event data

- [ ] Create dashboard components to display metrics
  - [ ] Update or create components to visualize form analytics
  - [ ] Update or create components to visualize block performance

## Phase 6: Advanced Analytics Features

- [ ] Implement AI-specific analytics for conversation blocks
  - [ ] Add sentiment analysis integration
  - [ ] Add topic extraction from responses

- [ ] Add funnel analysis capabilities
  - [ ] Track conversion through form steps
  - [ ] Identify drop-off points

- [ ] Implement A/B testing capabilities
  - [ ] Add version comparisons
  - [ ] Track performance differences between form versions

## Testing & Validation

- [ ] Create test cases for analytics functionality
  - [ ] Test visitor ID persistence
  - [ ] Test event tracking accuracy
  - [ ] Test metrics calculations

- [ ] Validate analytics implementation
  - [ ] Verify all events are being captured correctly
  - [ ] Ensure no performance issues from tracking code
  - [ ] Confirm metrics match raw event data

---

## File Modification Summary

### New Files to Create:
- `/src/services/analytics/trackEvents.ts`
- `/src/lib/analytics/visitorId.ts`
- `/src/lib/analytics/eventQueue.ts`
- `/src/hooks/useAnalytics.ts`
- `/src/app/api/analytics/track/form-view/route.ts`
- `/src/app/api/analytics/track/block-interaction/route.ts`
- `/src/app/api/analytics/track/form-completion/route.ts`

### Existing Files to Modify:
- Form container component
- Block rendering components
- Form submission handlers
- Database functions/procedures

---

**Note**: This checklist follows the event-driven approach outlined in the AnalyticsSetup.md document and aligns with the existing database schema in FlowForm. Implementation can be done incrementally, with each phase building on the previous one.
