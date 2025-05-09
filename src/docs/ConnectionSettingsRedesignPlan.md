# Connection Settings Redesign Plan

This document outlines the steps to redesign and implement the new connection settings UI and logic in the workflow builder.

## Phase 1: Schema & Data Types

- [ ] **Update `WorkflowEdgesSchema.md` Documentation**:
  - Add the new `source_question_block_id` field to the `conditions` objects within the `rules` JSONB structure example.
  - Clarify that `field` within a condition might refer to a property of the answer from `source_question_block_id`.
- [ ] **Define/Update TypeScript Types** (e.g., in `src/types/workflow-types.ts`):
  - Interface `Condition`:
    - Add `source_question_block_id?: string` (UUID of the block this condition refers to).
    - Ensure `operator` can accommodate all new operator types.
    - Ensure `value` can accommodate different types (string for text, specific values for multiple choice).
  - Review `Rule`, `ConditionGroup` interfaces to ensure they align.
- [ ] **Database Schema Update (Supabase)**:
  - Apply SQL `COMMENT` to the `rules` column in `workflow_edges` table to document the new expected JSON structure (see SQL section below).
  - *Note: No `ALTER TABLE` is strictly needed for the table structure itself as JSONB is flexible. The primary change is in the application's expected JSON structure within the `rules` column.*

## Phase 2: UI Development (`WorkflowConnectionSidebar.tsx`)

- [ ] **Initial UI Cleanup**:
  - Remove the old "Conditional/Always" toggle switch at the top.
- [ ] **Default Path / "Always go to" Display**:
  - Display: "`[Source Block Question Text]` always go to `[Target Block Dropdown]`".
  - `[Target Block Dropdown]` should list all other blocks and be bound to the connection's `defaultTargetId`.
  - Display "All other cases go to `[Target Block Dropdown]`" at the bottom, also bound to `defaultTargetId`.
- [ ] **"Add Rule" Button**: Implement functionality to add a new rule structure to the UI and state.
- [ ] **Rule UI Structure (for each rule)**:
  - [ ] **General Rule Elements**:
    - Display rule number or a visual separator.
    - Implement a "Delete Rule" button for each rule.
  - [ ] **"If" Section**:
    - [ ] Display source question: "If `[Dropdown of all form questions]`". This dropdown sets the `condition.source_question_block_id`.
    - [ ] Operator Dropdown: Populate based on the selected `source_question_block_id`'s type:
      - Text input: "is equal to", "is not equal to", "begins with", "ends with", "contains", "does not contain".
      - Multiple choice: "is", "is not".
    - [ ] Value Input: Populate based on the selected `source_question_block_id`'s type:
      - Text input: Standard text field.
      - Multiple choice: Dropdown listing the actual choices of the selected question.
    - [ ] **Condition Grouping (And/Or)**:
      - After the first condition in a rule, subsequent conditions should be preceded by an "And" / "Or" dropdown.
      - Implement "Add condition" button within a rule to add another line of: `[And/Or Dropdown]` -> `[Question Dropdown]` -> `[Operator Dropdown]` -> `[Value Input]`.
    - [ ] Implement a "Delete Condition" button for each condition line (except perhaps the first, which would delete the rule if it's the only one).
  - [ ] **"Then" Section**:
    - Display: "Then Go to `[Target Block Dropdown]`".
    - `[Target Block Dropdown]` should list all other blocks and be bound to the rule's `target_block_id`.
- [ ] **Multiple Rules**: Ensure the UI can dynamically render and manage a list of rules.

## Phase 3: State Management (Zustand - e.g., `formWorkflow.ts` slice)

- [ ] **Update Store State**: Modify the structure of `connections` in the store to align with the new TypeScript types for rules and conditions (including `source_question_block_id`).
- [ ] **Implement New Actions**:
  - `updateConnectionDefaultTarget(connectionId: string, defaultTargetBlockId: string | null)`
  - `addRuleToConnection(connectionId: string)`: Adds a new empty rule structure.
  - `deleteRuleFromConnection(connectionId: string, ruleId: string)`
  - `updateRuleTargetBlock(connectionId: string, ruleId: string, targetBlockId: string)`
  - `updateRuleConditionGroupOperator(connectionId: string, ruleId: string, logicalOperator: 'AND' | 'OR')`
  - `addConditionToRule(connectionId: string, ruleId: string)`: Adds a new empty condition to a rule's condition group.
  - `deleteConditionFromRule(connectionId: string, ruleId: string, conditionId: string)`
  - `updateConditionDetails(connectionId: string, ruleId: string, conditionId: string, updates: Partial<Condition>)`: For updating `source_question_block_id`, `operator`, `value`.
  - `updateInterConditionOperator(connectionId: string, ruleId: string, conditionIndex: number, logicalOperator: 'AND' | 'OR')`: If handling sequential AND/OR operators for conditions within a group.

## Phase 4: Backend/Save Logic

- [ ] **Serialization**: Ensure the `saveForm` action (or equivalent) correctly serializes the `connections` array with the new `rules` structure (including `source_question_block_id` in conditions) into the JSONB format expected by the backend.
- [ ] **Deserialization/Loading**: When loading a form, ensure the `rules` from the backend are correctly parsed into the new frontend state structure. Handle cases where `source_question_block_id` might be missing in older data (e.g., default to edge's `source_block_id`).

## Phase 5: Testing

- [ ] **UI Interaction Testing**: Test all UI elements for adding/editing/deleting rules and conditions.
- [ ] **State Management Testing**: Verify that store actions correctly update the state.
- [ ] **Data Persistence Testing**: Save a form with new complex rules, reload, and verify everything is restored correctly.
- [ ] **Edge Case Testing**: Empty rules, rules with no conditions, multiple conditions, etc.
- [ ] **Backward Compatibility**: Test loading forms that might have been saved with the older rule structure (if applicable, primarily ensuring no crashes and graceful handling).
