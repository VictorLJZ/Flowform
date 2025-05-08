# Workflow System Decoupling: Product Requirements Document

## 1. Overview

**Project Name:** Workflow System Decoupling  
**Author:** FlowForm Team  
**Date:** May 7, 2025  
**Status:** Draft  

### 1.1 Background

FlowForm currently has an inconsistent workflow implementation where the form builder uses a sophisticated visual workflow editor with connections and conditions, but the form viewer ignores these and uses a simple linear progression based on block order. This disconnect creates a confusing user experience where workflow changes in the builder don't affect the published form's behavior.

### 1.2 Project Goals

1. Decouple the block system from the workflow system
2. Implement a connection evaluation system in the form viewer
3. Maintain the visual workflow editor's functionality
4. Ensure backward compatibility for existing forms
5. Match Typeform's "two independent systems" model

### 1.3 Success Metrics

1. Builder and viewer workflows are in sync (what you build is what you get)
2. Block operations (add, remove, reorder) don't automatically affect workflow
3. Forms without explicit connections still work properly with default linear flow
4. Conditional logic works correctly in published forms
5. Existing forms maintain their functionality after the update

## 2. Current Architecture

### 2.1 Builder Mode

- **Zustand Store Slices:**
  - `FormBlocksSlice`: Manages block data and operations
  - `FormWorkflowSlice`: Manages connections between blocks
  - `FormPersistenceSlice`: Handles saving/loading form data

- **Builder Components:**
  - `WorkflowCanvas`: Uses ReactFlow to create visual workflow
  - `WorkflowNode`: Represents blocks in the flow
  - `WorkflowEdge`: Represents connections with conditions
  - Sidebar components for editing connections and conditions

- **Current Tight Coupling:**
  - Adding blocks automatically creates connections
  - Removing blocks creates bypass connections
  - Block order (`order_index`) tied to default linear connections

### 2.2 Viewer Mode

- **Navigation System:**
  - `useFormNavigation`: Simple index-based navigation
  - `goToNext()`: Increments the current index
  - `goToPrevious()`: Decrements the current index

- **Missing Components:**
  - No connection evaluation system
  - No condition assessment
  - No mapping between workflow and navigation

## 3. Proposed Changes

### 3.1 Independent Systems Architecture

1. **Block System:**
   - Manages block data, CRUD operations, and ordering
   - No awareness of connections or workflow

2. **Workflow System:**
   - Manages connections and conditions
   - Observes block changes but doesn't directly modify blocks
   - Provides navigation services based on conditions

3. **Connection Point:**
   - New `useWorkflowNavigation` hook that replaces `useFormNavigation`
   - Evaluates conditions and determines the next/previous block

### 3.2 Technical Requirements

1. **Block-Workflow Separation:**
   - Remove automatic connection creation in block operations
   - Maintain connections when blocks are reordered
   - Remove bypass connection logic

2. **Workflow Evaluation Engine:**
   - Create a service to evaluate conditions against answers
   - Implement logic to determine the next block based on conditions
   - Handle fallback paths and default linear progression

3. **Form Viewer Updates:**
   - Replace index-based navigation with ID-based navigation
   - Implement condition evaluation in navigation system
   - Update UI components to work with non-linear progression

## 4. Implementation Approach

### 4.1 Technical Architecture

```
┌───────────────────┐           ┌───────────────────┐
│                   │           │                   │
│   Block System    │           │  Workflow System  │
│                   │           │                   │
└─────────┬─────────┘           └─────────┬─────────┘
          │                               │
          │                               │
          │        ┌──────────────────────┘
          │        │
          ▼        ▼
┌───────────────────────────┐
│                           │
│  Workflow Navigation      │
│  Service                  │
│                           │
└──────────────┬────────────┘
               │
               ▼
┌───────────────────────────┐
│                           │
│  Form Viewer              │
│                           │
└───────────────────────────┘
```

### 4.2 Implementation Phases

1. **Phase 1: Decoupling**
   - Remove automatic connection management from block operations
   - Create clean interfaces between systems

2. **Phase 2: Navigation Service**
   - Implement the workflow evaluation service
   - Create the enhanced navigation hook

3. **Phase 3: Form Viewer Integration**
   - Update the form viewer to use the new navigation service
   - Implement progress tracking for non-linear flows

4. **Phase 4: Testing & Backward Compatibility**
   - Ensure existing forms maintain functionality
   - Test with various connection/condition scenarios

## 5. Detailed Requirements

### 5.1 Core Features

1. **Form Builder:**
   - Visual workflow editor remains unchanged
   - Block operations don't automatically modify connections
   - Provide guidance for users on setting up connections

2. **Form Navigation:**
   - Navigation based on connection evaluation
   - Linear fallback when no connections exist
   - Handle circular references and orphaned blocks

3. **Condition Evaluation:**
   - Support all current condition types and operators
   - Evaluate conditions based on current answers
   - Handle multiple conditions per connection

### 5.2 Edge Cases to Address

1. **Orphaned Blocks:** Blocks with no incoming connections
2. **Isolated Subgraphs:** Groups of blocks disconnected from the main flow
3. **Circular References:** Loops in the connection graph
4. **Multiple Valid Paths:** When multiple connections from one block have valid conditions
5. **All Conditions Invalid:** When no conditions evaluate to true for outgoing connections

## 6. Implementation Checklist

See the accompanying implementation checklist (below) for detailed tasks.

---

# Workflow Decoupling Implementation Checklist

## Phase 1: Analysis & Preparation
- [x] Review and document all current coupling points between blocks and workflow
- [x] Identify all UI components that need updating
- [ ] Create tests for existing behavior to ensure nothing breaks
- [ ] Set up a sandbox environment for testing changes

### Key Findings
- **Automatic Connection Creation**: `formBlocks.ts:addBlock()` automatically creates connections when blocks are added
- **Bypass Connection Logic**: `formBlocks.ts:removeBlock()` creates bypass connections when blocks are removed
- **Default Linear Connections**: `formPersistence.ts:loadForm()` creates default linear connections if none exist
- **Existing Workflow Navigation Hook**: `useWorkflowNavigation.ts` already implements condition evaluation and navigation
- **Index-Based Navigation**: Form viewer currently uses `useFormNavigation` with simple index-based navigation

## Phase 2: Core System Decoupling

### Block System Changes

#### Files to Modify
- [x] `/src/stores/slices/formBlocks.ts`:
  - ✅ Remove automatic connection creation from `addBlock` method
  - ✅ Remove bypass connection logic from `removeBlock` method
  - ✅ Update `reorderBlocks` to maintain connection independence
- [x] `/src/types/form-store-slices-types.ts`:
  - ✅ Update `FormWorkflowSlice` interface for the new observation methods
  - ✅ Added clean interfaces between systems

### Workflow System Changes

#### Files to Modify
- [x] `/src/stores/slices/formWorkflow.ts`:
  - ✅ Update workflow slice to observe block changes
  - ✅ Add methods to handle orphaned connections
  - ✅ Enhance the connection validation logic
  - ✅ Add method to validate connections
- [x] `/src/stores/slices/formPersistence.ts`:
  - ✅ Remove default connection creation logic from `loadForm`
  - ✅ Fix loading to prevent automatic connection creation logic
- [x] `/src/app/dashboard/forms/builder/[formId]/components/workflow/workflow-handlers.ts`:
  - ✅ Update connection handler logic to not automatically reorder blocks
  - ✅ Fix edge double-click handler to validate connections instead of reordering blocks

## Phase 3: Navigation Service Implementation

### Navigation System Updates

#### Files to Modify
- [x] Create `/src/hooks/form/useFormWorkflowNavigation.ts`:
  - ✅ Implement new navigation hook that uses workflow connections

- [x] `/src/app/f/[formId]/page.tsx`:
  - ✅ Update navigation logic to use workflow connections instead of indices
  - ✅ Integrate with workflow-based navigation system

### UI Enhancements

#### Files to Modify
- [x] Create `/src/app/dashboard/forms/builder/[formId]/components/workflow/WorkflowOrderSyncButton.tsx`:
  - ✅ Add a UI button to manually synchronize block order with workflow
- [ ] Add visual indicators for connection paths
- [ ] Update the workflow editor UI to reflect the decoupled system

## Implementation Summary

We have successfully decoupled the workflow system from the form block system with the following key changes:

1. **Block System Decoupling**:
   - Removed automatic connection creation when adding blocks
   - Removed bypass connection logic when removing blocks
   - Updated block reordering to maintain connection independence

2. **Workflow System Enhancements**:
   - Added methods to observe block changes instead of directly modifying blocks
   - Implemented connection validation to ensure connections point to valid blocks
   - Removed default linear connection creation during form loading

3. **Navigation Service**:
   - Created a new form workflow navigation hook that evaluates conditions
   - Updated the form viewer to use workflow-based navigation
   - Added support for non-linear form traversal based on user responses

4. **UI Improvements**:
   - Added a manual sync button to allow users to reorder blocks based on workflow connections when desired

These changes ensure that the workflow system now operates independently from the block management system while maintaining the desired functionality. The form viewer now evaluates conditions and uses the workflow connections to determine the next block to show, enabling complex non-linear form flows.

### Create Workflow Navigation Service

#### Files to Modify or Use
- [x] `/src/hooks/form/useWorkflowNavigation.ts` (already exists):
  - Review existing implementation which includes:
    - Graph traversal logic for workflow connections
    - Condition evaluation for determining valid paths
    - Next/previous block determination based on answers
  - Update as needed to support our requirements

- [x] Condition evaluation logic:
  - ✅ Reused existing condition evaluation in useWorkflowNavigation
  - ✅ Supports all operators (equals, not_equals, contains, etc.)
  - ✅ Handles type conversions for different field types

- [x] Workflow traversal implementation:
  - ✅ Integrated graph traversal algorithms in useWorkflowNavigation
  - ✅ Support for multiple paths based on conditions
  - ✅ Added proper path handling in useFormWorkflowNavigation

#### Features Implemented
- [x] Block path determination:
  ```typescript
  // Implemented in useWorkflowNavigation and useFormWorkflowNavigation
  const { goToNext } = useFormWorkflowNavigation({ blocks, connections })
  // Determines next block based on answers and conditions
  ```
- [x] Path history tracking to support back navigation
  - ✅ Implemented in useWorkflowNavigation with navigationHistory state
- [x] Circular reference detection and handling
  - ✅ Handled through proper graph traversal in useWorkflowNavigation
- [x] Handling of orphaned blocks
  - ✅ Implemented in formWorkflow.ts with validateConnections method
- [x] Support for conditional branching based on answers
  - ✅ Implemented with evaluateCondition in useWorkflowNavigation

## Phase 4: Form Viewer Integration

### Update Form Viewer Components

#### Files to Modify
- [x] `/src/app/f/[formId]/page.tsx`:
  - Replace `useFormNavigation` with `useWorkflowNavigation`
  - Update navigation logic to use block IDs instead of indices
  - Modify progress tracking for non-linear flows

- [x] `/src/hooks/form/useFormWorkflowNavigation.ts`:
  - Implement new navigation hook that uses workflow connections instead of indices
  - Modify progress tracking for non-linear flows

- [ ] `/src/hooks/form/useFormNavigation.ts`:
  - Deprecate or refactor to use workflow navigation internally

- [ ] `/src/components/form/viewer/BlockRenderer.tsx`:
  - Update to work with ID-based navigation
  - Handle non-consecutive block rendering

- [ ] `/src/components/form/viewer/FormNavigationControls.tsx`:
  - Update navigation controls for workflow-based navigation
  - Add support for workflow-specific UI indicators

- [ ] `/src/components/form/viewer/ProgressBar.tsx`:
  - Redesign for non-linear flows
  - Calculate progress based on workflow graph

### Update Form Viewer UI
- [ ] Update progress indicators
- [ ] Update navigation controls
- [ ] Update analytics tracking

#### Files to Modify
- [ ] `/src/components/form/viewer/ProgressBar.tsx` - Update for non-linear flows
- [ ] `/src/hooks/analytics/useViewTracking.ts` - May need updates for tracking blocks viewed in non-linear flow
- [ ] `/src/hooks/form/useFormAbandonment.ts` - Update for non-linear flow tracking

## Phase 5: Testing & Validation

### Testing Scenarios
- [ ] Test linear forms (backward compatibility)
- [ ] Test forms with simple conditions
- [ ] Test forms with complex branching
- [ ] Test forms with circular references
- [ ] Test orphaned blocks handling

### Performance Testing
- [ ] Test large forms with many connections
- [ ] Test forms with complex condition evaluations
- [ ] Test navigation responsiveness

## Phase 6: Documentation & Rollout

### Documentation
- [ ] Update technical documentation
- [ ] Create user guide for workflow creation
- [ ] Document best practices for form design

### Rollout
- [ ] Create database migration if needed
- [ ] Plan phased rollout
- [ ] Monitor system after deployment

## Additional Files to Check

### Core Application Logic
- [ ] `/src/types/store-types.ts` - FormBuilderState interface may need updates
- [ ] `/src/types/form-builder-types.ts` - FormData interface may need updates

### Builder Components
- [ ] `/src/app/dashboard/forms/builder/[formId]/components/workflow/workflow-canvas.tsx`
- [ ] `/src/app/dashboard/forms/builder/[formId]/components/workflow/workflow-node.tsx`
- [ ] `/src/app/dashboard/forms/builder/[formId]/components/workflow/workflow-edge.tsx`
- [ ] `/src/app/dashboard/forms/builder/[formId]/components/workflow/workflow-sidebar.tsx`
- [ ] `/src/app/dashboard/forms/builder/[formId]/components/workflow/workflow-connection-sidebar.tsx`
- [ ] `/src/app/dashboard/forms/builder/[formId]/components/workflow/condition-card.tsx`

### Database & API
- [ ] `/src/services/form/getFormWithBlocksClient.ts` - May need updates for connection loading
- [ ] `/src/services/form/transformVersionedFormData.ts` - May need updates for workflow data
- [ ] `/src/services/form/saveFormWithBlocks.ts` - Check for connection handling

### Hooks & Utilities
- [ ] `/src/hooks/workflow/use-workflow-data.ts` - Workflow data hook
- [ ] `/src/utils/blockTypeMapping.ts` - May be used with condition evaluation
- [ ] `/src/utils/validateCondition.ts` - Create if it doesn't exist
