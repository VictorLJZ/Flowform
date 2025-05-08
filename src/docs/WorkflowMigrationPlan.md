# Workflow System Migration Plan

## Project Goals

You want to enhance the form logic system to be more like Typeform's approach:

1. **Default Path**: Maintain a default "always proceed" path for each connection
2. **Multiple Rules**: Support multiple distinct if/then rules per connection (currently limited to one rule)
3. **Complex Logic**: Allow both AND/OR logic within conditions (currently AND-only)
4. **Better UX**: Enable an interface similar to Typeform where users can:
   - Set a default "next" question
   - Add multiple rules with different targets
   - Group conditions with logical operators

## Database Changes

We've already updated the schema documentation with these changes:
- Renamed `target_block_id` to `default_target_id` to clarify its purpose
- Added `rules` JSONB field for storing complex rule structures
- Maintained legacy fields for backward compatibility

## Migration Checklist

### Database Changes

- [ ] Run SQL migration script to alter table structure
- [ ] Run SQL migration script to convert existing conditions to new format

### Type Definitions

- [ ] `/src/types/workflow-types.ts` - Update Connection interface with rules array
- [ ] `/src/types/workflow-condition-types.ts` - Add types for rule groups and logical operators

### Services

- [ ] `/src/services/form/saveWorkflowEdges.ts` - Update to handle rules JSONB field
- [ ] `/src/services/form/getFormWithBlocks.ts` - Update to map DB format to app model

### State Management

- [ ] `/src/stores/slices/formWorkflow.ts` - Update state management to handle multiple rules
- [ ] `/src/stores/slices/formPersistence.ts` - Update persistence logic for new data structure

### UI Components

- [ ] `/src/app/dashboard/forms/builder/[formId]/components/workflow/workflow-connection-sidebar.tsx` - Add UI for multiple rules
- [ ] `/src/app/dashboard/forms/builder/[formId]/components/workflow/condition-card.tsx` - Update to support rule groups
- [ ] `/src/app/dashboard/forms/builder/[formId]/components/workflow/condition-operators.tsx` - Add AND/OR selection
- [ ] `/src/app/dashboard/forms/builder/[formId]/components/workflow/workflow-edge.tsx` - Update edge visualization

### Utilities

- [ ] `/src/utils/workflow/condition-utils.ts` - Update validation and processing logic
- [ ] `/src/utils/workflow/autoConnectBlocks.ts` - Update auto-connection logic for new structure

### Testing/Verification

- [ ] Create test forms with multiple rules
- [ ] Verify backward compatibility with existing forms
- [ ] Test AND/OR logic combinations
- [ ] Verify form navigation works as expected with the new rules

## Implementation Strategy

1. Start with database migration and type updates
2. Update core services and state management
3. Implement UI changes
4. Add new utilities for rule evaluation
5. Test incrementally throughout the process

Following this plan will allow us to maintain compatibility with existing forms while adding the more robust Typeform-style conditional logic system you want.
