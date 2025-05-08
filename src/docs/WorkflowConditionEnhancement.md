# Workflow Condition Enhancement Plan

## Overview

This document outlines the plan to enhance FlowForm's workflow condition system to support multiple conditions per connection while maintaining the current sidebar UI approach. The enhancements will bring our condition system closer to Typeform's intuitive rule-based approach.

## Current vs. Target State

**Current State:**
- Single condition per connection (one field, operator, value)
- No support for multiple conditions or rules
- No explicit "default" or "fallback" paths

**Target State:**
- Multiple conditions per connection (AND logic)
- "Always proceed" option made more explicit
- "All other cases" fallback path capability
- Ability to add/remove conditions

## Implementation Checklist

### 1. Data Model Updates

- [ ] **Update Types** (`/src/types/workflow-types.ts`)
  - [ ] Modify `Connection` type to support multiple conditions
  ```typescript
  export interface Connection {
    id: string;
    sourceId: string;
    targetId: string;
    conditionType: 'always' | 'conditional' | 'fallback';
    conditions: ConditionRule[];
    order: number;
  }
  ```
  - [ ] Update `ConditionRule` to support group ID for AND/OR logic
  ```typescript
  export interface ConditionRule {
    id: string; // To identify individual conditions
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: string | number | boolean;
  }
  ```

- [ ] **Update Supabase Types** (`/src/types/supabase-types.ts`)
  - [ ] Modify `WorkflowEdge` database type to match new Connection structure

### 2. Database Schema Updates

- [ ] **Supabase Migration**
  - [ ] Create a migration script to update the `workflow_edges` table schema
  - [ ] Add `condition_type` column (TEXT)
  - [ ] Change `condition` column to `conditions` (JSONB array)

### 3. Store & Service Updates

- [ ] **Update FormBuilder Store** (`/src/stores/slices/workflowSlice.ts`)
  - [ ] Update `addConnection` function to support condition type and multiple conditions
  - [ ] Update `updateConnection` function to handle condition arrays
  - [ ] Add new methods for adding/removing individual conditions
  - [ ] Update connection persistence methods

- [ ] **Update Form Services** (`/src/services/form/getFormWithBlocks.ts`)
  - [ ] Modify how connections are retrieved and formatted from the database
  - [ ] Ensure backward compatibility during transition

### 4. UI Components Updates

- [ ] **Condition Card Component** (`/src/app/dashboard/forms/builder/[formId]/components/workflow/condition-card.tsx`)
  - [ ] Redesign to match Typeform's UI with condition type selector
  - [ ] Add support for multiple conditions with AND logic
  - [ ] Implement "Add condition" button
  - [ ] Implement condition deletion capability

- [ ] **Create Condition Type Selector** (`/src/app/dashboard/forms/builder/[formId]/components/workflow/condition-type-selector.tsx`)
  - [ ] Create a new component for "Always proceed" vs "If... Then" vs "All other cases" selection
  - [ ] Style to match Typeform's UI

- [ ] **Update Condition Fields/Operators/Values** (existing components)
  - [ ] Modify to work with the new data model
  - [ ] Support individual condition editing

- [ ] **Connection Overview Component** (`/src/app/dashboard/forms/builder/[formId]/components/workflow/connection-overview.tsx`)
  - [ ] Update to display multiple conditions correctly
  - [ ] Add visual indication of condition type

- [ ] **Update Workflow Edge Component** (`/src/app/dashboard/forms/builder/[formId]/components/workflow/workflow-edge.tsx`)
  - [ ] Update to visually differentiate between condition types
  - [ ] Update hover labels to show multiple conditions

### 5. Workflow Logic Updates

- [ ] **Connection Evaluation Logic** (`/src/utils/workflow/condition-utils.ts`)
  - [ ] Update `getConditionSummary` function to support multiple conditions
  - [ ] Create helpers for evaluating multiple conditions with AND logic

- [ ] **Form Runner Changes** (If applicable)
  - [ ] Update navigation logic to evaluate multiple conditions
  - [ ] Handle "All other cases" fallback paths

### 6. Migration & Compatibility

- [ ] **Migration Script**
  - [ ] Create a script to migrate existing connections to the new format
  - [ ] Convert single conditions to condition arrays
  - [ ] Set appropriate condition types

- [ ] **Backward Compatibility Layer**
  - [ ] Ensure API endpoints can handle both formats during transition
  - [ ] Add fallback logic for reading legacy connection formats

## Implementation Phases

### Phase 1: Data Model & API
- Update types, schema, and backend services
- Create migration scripts
- Update store actions

### Phase 2: UI Components
- Implement condition type selector
- Update condition card to handle multiple conditions
- Add "Add condition" functionality

### Phase 3: Logic & Evaluation
- Update condition evaluation logic
- Implement multiple condition rendering
- Update form navigation logic

### Phase 4: Testing & Refinement
- Test with different condition combinations
- Refine UI based on user feedback
- Ensure migration works correctly

## Backward Compatibility Considerations

- All existing connections should be migrated to `conditionType: 'conditional'` if they have a condition, or `conditionType: 'always'` if they don't
- Single conditions should be converted to an array with one item
- The condition evaluation logic must support both formats during transition

## UI/UX Guidelines

- Maintain the sidebar approach for connection editing
- Ensure the "Add condition" button is intuitive and prominent
- Match Typeform's clear labeling of "If" and "Then" sections
- Provide visual feedback for condition types in workflow view

## Technical Risks & Mitigation

- **Data Loss**: Ensure thorough testing of migration scripts and add backup procedures
- **Performance**: Monitor React rendering performance with multiple conditions
- **Complexity**: Create clear documentation for the enhanced condition system
