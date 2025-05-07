# Form Graph Refactoring Plan

This document outlines our approach to refactoring the form builder to use a graph-based architecture for better integration between form blocks and workflow connections.

## Current Issues

- [x] Block order (`order_index`) and connection order aren't consistently synchronized
- [x] Form saving happens in two separate operations (blocks, then connections)
- [x] No unified validation of form structure
- [x] Lack of transaction support can lead to partial saves
- [x] Inconsistent naming (`order` vs `order_index`)

## Implementation Checklist

### Phase 1: Create Graph Model

- [x] Create `/src/lib/graph/FormGraph.ts`
  - [x] Define `FormNode` and `FormEdge` classes
  - [x] Implement graph operations (add/remove/connect nodes)
  - [x] Add serialization/deserialization methods
  - [x] Add validation methods

### Phase 2: Create Graph Service

- [x] Create `/src/services/form/FormGraphService.ts`
  - [x] Implement loading form as graph from database
  - [x] Implement saving graph to database
  - [x] Ensure compatibility with existing database schema

### Phase 3: Create Unified Store Slice

- [x] Create `/src/stores/slices/formGraph.ts`
  - [x] Replace separate blocks and workflow slices
  - [x] Implement graph operations (add/remove/connect nodes)
  - [x] Ensure backward compatibility with existing code
- [x] Update `formBuilderStore.ts` to include the graph slice

### Phase 4: Integration Strategy 

- [x] Revise the integration approach
  - [x] Initially use the graph slice alongside the existing slices rather than replacing them
  - [x] Use a facade pattern to maintain backward compatibility
  - [x] Introduce safe type guards and null checks to prevent TypeScript errors

### Phase 5: Update UI Components

- [ ] Update workflow canvas
  - [ ] Modify node rendering to use graph data
  - [ ] Update edge rendering to use graph connections
- [ ] Update form navigation
  - [ ] Modify `useWorkflowNavigation` to use graph traversal

### Phase 6: Testing and Validation

- [ ] Test form builder functionality
- [ ] Test form viewer functionality
- [ ] Validate data persistence

## Revised Integration Approach

After encountering numerous TypeScript errors and integration challenges, we're revising our approach to implement the graph-based architecture in phases:

1. **Dual State Management (Current)**: Keep both the original slices (`formBlocks`, `formWorkflow`) and the new `formGraph` slice active simultaneously. The `formGraph` slice will be available but not fully integrated.

2. **Gradual Component Migration**: Update components one by one to use the graph slice, with fallbacks to the original slices when needed.

3. **Full Replacement (Future)**: Once all components have been updated and tested, fully replace the original slices with the graph slice.

This phased approach will minimize disruption to the existing codebase while allowing for incremental testing and validation.
- [ ] Remove redundant code
- [ ] Update tests
- [ ] Document the new architecture

## Implementation Strategy

1. **Work incrementally** - Add new components without removing old ones
2. **Test frequently** - Ensure the form builder and viewer keep working
3. **Fix immediate issues first** - Address order_index problems and saving errors
4. **Maintain backwards compatibility** - Keep existing APIs working

## Database Compatibility

No database schema changes are required. The graph model will serialize to and deserialize from:

- `forms` table - Form metadata
- `form_blocks` table - Nodes in the graph
- `workflow_edges` table - Edges in the graph
