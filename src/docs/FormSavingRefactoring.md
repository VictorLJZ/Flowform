# Form Saving and Publishing Refactoring Plan

This document outlines a comprehensive plan to refactor the form saving and publishing mechanisms in FlowForm to eliminate redundancy, improve consistency, and fix the block deletion issue.

## Files Involved

### Service Layer
- ✅ `/src/services/form/publishFormWithFormBuilderStore.ts` - Primary publishing mechanism
- ✅ `/src/services/form/saveFormWithVersioning.ts` - Legacy wrapper to be removed
- ✅ `/src/services/form/saveFormWithBlocks.ts` - Core saving mechanism
- ✅ `/src/services/form/createFormVersion.ts` - Creates new form versions
- ✅ `/src/services/form/updateFormVersion.ts` - Updates existing form versions

### UI Components
- ✅ `/src/app/dashboard/forms/page.tsx` - Forms list page with publish implementation
- ✅ `/src/app/dashboard/forms/builder/[formId]/page.tsx` - Form builder page with different publish implementation

### State Management
- ✅ `/src/stores/formBuilderStore.ts` - Form builder state management

### Hooks
- 🆕 `/src/hooks/usePublishForm.ts` - New hook to centralize publishing logic

## Refactoring Checklist

### 1. Fix Immediate Issues
- [ ] Fix the empty blocks array in form builder publishing function
- [ ] Add safeguards in publishFormWithFormBuilderStore to prevent operating with empty blocks arrays

### 2. Create a Unified Publishing Hook
- [ ] Create new `usePublishForm` hook that:
  - [ ] Retrieves form data and blocks from the store or API
  - [ ] Validates blocks are not empty
  - [ ] Calls publishFormWithFormBuilderStore with proper data
  - [ ] Returns standardized result and loading/error states

### 3. Refactor Service Layer
- [ ] Remove saveFormWithVersioning.ts
- [ ] Update formBuilderStore to call saveFormWithBlocks directly
- [ ] Add proper logging in createFormVersion.ts for debugging
- [ ] Add safeguards in createFormVersion.ts to avoid marking all blocks as deleted
- [ ] Clean up any redundant functions in other service files

### 4. Update UI Components
- [ ] Modify forms list page to use the new publishing hook
- [ ] Modify form builder page to use the same publishing hook
- [ ] Ensure consistent behavior across all publishing scenarios

### 5. Clean Up Form Builder Store
- [ ] Simplify save and publish operations
- [ ] Ensure block IDs are properly preserved

### 6. Testing and Verification
- [ ] Verify form saving works without marking blocks as deleted
- [ ] Verify form publishing creates proper versions
- [ ] Verify analytics table correctly shows form questions

## Implementation Notes

- Focus on minimal changes to fix the immediate issues
- Preserve block IDs throughout the lifecycle of a form
- Ensure consistent handling of form versions
- Add proper error handling and validation
- Add logging for debugging purposes
