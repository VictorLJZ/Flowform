# Workflow State Management Refactoring Checklist

## Overview
This document outlines the step-by-step plan to simplify and improve the state management in the Form Builder workflow components.

## Goals
- Create a single source of truth for workflow state
- Minimize local component state usage
- Implement unidirectional data flow
- Use the database schema properly (workflow_edges table)
- Improve performance and reduce unnecessary rerenders

## Files to Modify

### Zustand Store Files
- [x] Enhance `/src/stores/slices/formWorkflow.ts` 
  - [x] Add UI state (selection, connecting mode)
  - [x] Add node position tracking
  - [x] Improve connection management
  
- [x] Update `/src/stores/slices/formPersistence.ts`
  - [x] Use workflow_edges table directly
  - [x] Store node positions in form settings
  - [x] Implement proper load/save operations
  
### Hook Files
- [x] Simplify `/src/hooks/workflow/use-workflow-data.ts`
  - [x] Remove redundant state tracking
  - [x] Focus on data transformation only
  
### Component Files
- [x] Clean up `/src/app/dashboard/forms/builder/[formId]/components/workflow/workflow-canvas.tsx`
  - [x] Remove local state
  - [x] Use store state directly
  - [x] Simplify event handlers
  
- [x] Refactor `/src/app/dashboard/forms/builder/[formId]/components/workflow/workflow-sidebar.tsx`
  - [x] Remove local state
  - [x] Use store for selected element
  
- [x] Update `/src/app/dashboard/forms/builder/[formId]/components/workflow/workflow-connection-sidebar.tsx`
  - [x] Remove two-stage update pattern
  - [x] Use connections directly from store
  
- [x] Simplify `/src/app/dashboard/forms/builder/[formId]/components/workflow/workflow-block-sidebar.tsx`
  - [x] Remove redundant state
  
- [x] Refactor `/src/app/dashboard/forms/builder/[formId]/components/workflow/workflow-handlers.ts`
  - [x] Use store directly for state changes
  
### Files to Delete
- [x] `/src/app/dashboard/forms/builder/[formId]/components/workflow/workflow-styles.ts`
  - [x] Replace with Tailwind classes in components

## Implementation Approach
1. First enhance the Zustand store slices
2. Update the persistence logic
3. Refactor the hooks
4. Update components one by one
5. Test thoroughly

## Expected Benefits
- Cleaner, more maintainable codebase
- Better performance with fewer rerenders
- Proper database schema usage
- More predictable data flow
- Easier to extend with new features
