# FlowForm Analytics Implementation Checklist

This checklist outlines the step-by-step process to implement the event-driven analytics system for FlowForm, organized into phases for easier implementation.

## Phase 1: Analytics Service Layer

- [x] Create core analytics service
  - [x] ~~Create file: `/src/services/analytics/trackEvents.ts`~~ Created individual files in tracking directory instead
  - [x] Implement `trackFormView()` function - Updated existing file
  - [x] Implement `trackBlockView()` function - Created in `/src/services/analytics/tracking/trackBlockView.ts`
  - [x] Implement `trackBlockInteraction()` function - Created in `/src/services/analytics/tracking/trackBlockInteraction.ts`
  - [x] Implement `trackFormCompletion()` function - Created in `/src/services/analytics/tracking/trackFormCompletion.ts`
  - [x] Implement `trackDynamicBlockAnalytics()` function - Added bonus function for AI blocks

- [x] Create visitor identification system
  - [x] Create file: `/src/lib/analytics/visitorId.ts`
  - [x] Implement function to generate/retrieve anonymous visitor IDs
  - [x] Add browser storage integration for persistent IDs

- [x] Create event queuing mechanism
  - [x] Create file: `/src/lib/analytics/eventQueue.ts`
  - [x] Implement batching for multiple events
  - [x] Add retry mechanism for network failures

## Phase 2: API Endpoints for Analytics

- [x] Create API routes to receive tracking events
  - [x] Create file: `/src/app/api/analytics/track/form-view/route.ts`
  - [x] Create file: `/src/app/api/analytics/track/block-interaction/route.ts`
  - [x] Create file: `/src/app/api/analytics/track/form-completion/route.ts`
  - [x] Create file: `/src/app/api/analytics/track/batch/route.ts` (Added for batch processing)

- [x] Implement database operations in API routes
  - [x] Add Supabase insert operations for `form_views` table
  - [x] Add Supabase insert operations for `form_interactions` table
  - [x] Add operations to update response status on completion
  - [x] Add support for batch event processing

## Phase 3: React Hooks for Analytics

- [x] Create custom React hooks for analytics
  - [x] Create file: `/src/hooks/useAnalytics.ts` - Unified analytics hook
  - [x] Implement `useFormViewTracking(formId)` hook - Created in `/src/hooks/analytics/useFormViewTracking.ts`
  - [x] Implement `useBlockViewTracking(blockId, formId)` hook - Created in `/src/hooks/analytics/useBlockViewTracking.ts`
  - [x] Implement `useBlockInteractionTracking(blockId, formId)` hook - Created in `/src/hooks/analytics/useBlockInteractionTracking.ts`
  - [x] Implement `useFormCompletionTracking(formId, responseId)` hook - Created in `/src/hooks/analytics/useFormCompletionTracking.ts`

- [x] Create utilities for timing and measurement
  - [x] Add functions to measure time spent on blocks - Created in `/src/hooks/analytics/useTimingMeasurement.ts`
  - [x] Add barrel exports file in `/src/hooks/analytics/index.ts` for easy imports

## Phase 4: Integration with Form Components

- [x] Update Public Form Viewer
  - [x] Edit file: `/src/app/f/[formId]/page.tsx`
  - [x] Add `useFormViewTracking` hook in the initial useEffect
  - [x] Add block view tracking in the `renderBlock` function
  - [x] Add interaction tracking in the `handleAnswer` function
  - [x] Add form completion tracking when form is submitted

- [x] Update individual block components in `/src/components/form/blocks/`
  - [x] Edit `TextInputBlock.tsx` to track text input interactions
  - [x] Edit `MultipleChoiceBlock.tsx` to track selection interactions
  - [x] Edit `CheckboxGroupBlock.tsx` to track checkbox interactions
  - [x] Edit `AIConversationBlock.tsx` to track AI conversation interactions
  - [x] Edit `EmailBlock.tsx` to track email input interactions
  - [x] Add timing and validity metrics to all block interactions

- [x] Enhance form session handling
  - [x] Update `createNewSession` function to track session starts
  - [x] Track partial completions in navigation functions
  - [x] Add abandonment tracking for users who leave the form

## Phase 5: Aggregated Metrics & Background Processing

- [ ] Create database functions for aggregation
  - [ ] Create SQL function for daily aggregation of `form_metrics`
  - [ ] Create SQL function for daily aggregation of `block_metrics`
  - [ ] Create SQL function for funnel analysis across form blocks

- [ ] Implement scheduled jobs with Supabase Edge Functions
  - [ ] Create function to run daily metrics calculations
  - [ ] Create function to identify abandoned forms
  - [ ] Create function to generate weekly reports
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
