# Block Types Migration Checklist

This document provides a detailed plan for completely migrating from the legacy block-types.ts file to our new three-layer type system. Each file is listed with:

1. **Current imports**: Which legacy types are being imported
2. **Replacement types**: Which new types from the three-layer system should be used instead
3. **Layer context**: Whether the file is primarily dealing with Database (DB), API, or UI layer

## Type Mapping Reference

### Legacy Types → New Types

| Legacy Type | New Type by Layer |
|-------------|-------------------|
| `BlockType` | DB Layer: `DbBlockType` in `@/types/block/DbBlock` <br> API Layer: `ApiBlockType` in `@/types/block/ApiBlock` <br> UI Layer: Use API type |
| `BlockDefinition` | UI Layer: `UiBlockDefinition` in `@/types/block/UiBlock` |
| `FormBlock` | DB Layer: `DbBlock` in `@/types/block/DbBlock` <br> API Layer: `ApiBlock` in `@/types/block/ApiBlock` <br> UI Layer: `UiBlock` in `@/types/block/UiBlock` |

## Migration Tasks

### Types Directory

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/types/workflow-condition-types.ts`
  - Current: `import { FormBlock } from '@/types/block-types'`
  - Replace with: `import { ApiBlock } from '@/types/block/ApiBlock'`
  - Context: API Layer (type definitions)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/types/workflow-types.ts`
  - Current: `import type { FormBlock } from './block-types'`
  - Replace with: `import type { ApiBlock } from './block/ApiBlock'`
  - Context: API Layer (type definitions)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/types/form-store-slices-types.ts`
  - Current: `import type { FormBlock } from './block-types'`
  - Replace with: `import type { UiBlock } from './block/UiBlock'`
  - Context: UI Layer (store slice types)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/types/postgresql-types.ts`
  - Current: `import { BlockType } from './block-types'`
  - Replace with: `import { DbBlockType } from './block/DbBlock'`
  - Context: DB Layer (database-specific types)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/types/supabase-types.ts`
  - Current: `import type { BlockType } from './block-types'`
  - Replace with: `import type { DbBlockType } from './block/DbBlock'`
  - Context: DB Layer (database definitions)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/types/store-types.ts`
  - Current: `import type { FormBlock } from './block-types'`
  - Replace with: `import type { UiBlock } from './block/UiBlock'`
  - Context: UI Layer (store state types)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/types/block/UiBlock.ts`
  - Current: `import type { FormBlock } from '../block-types'`
  - Replace with: Self-references, remove import
  - Context: UI Layer (already in new system)

### App Directory

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/app/dashboard/form/[formId]/builder/page.tsx`
  - Current: `import { FormBlock } from '@/types/block-types'`
  - Replace with: `import { UiBlock } from '@/types/block/UiBlock'`
  - Context: UI Layer (component page)

### Stores Directory

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/stores/slices/formBlocks.ts`
  - Current: `import type { FormBlock } from '@/types/block-types'`
  - Replace with: `import type { UiBlock } from '@/types/block/UiBlock'`
  - Context: UI Layer (store state)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/stores/slices/formPersistence.ts`
  - Current: `import type { BlockType, FormBlock } from '@/types/block-types'`
  - Replace with: `import type { ApiBlockType } from '@/types/block/ApiBlock'; import type { UiBlock } from '@/types/block/UiBlock'`
  - Context: UI Layer (store state)

### Utils Directory

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/utils/blockTypeMapping.ts`
  - Current: `import { BlockType } from '@/types/block-types'`
  - Replace with: `import { ApiBlockType } from '@/types/block/ApiBlock'`
  - Context: API Layer (utilities)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/utils/workflow/condition-utils.ts`
  - Current: `import { FormBlock } from '@/types/block-types'`
  - Replace with: `import { UiBlock } from '@/types/block/UiBlock'`
  - Context: UI Layer (workflow utilities)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/utils/workflow/detectCycles.ts`
  - Current: `import { FormBlock } from '@/types/block-types'`
  - Replace with: `import { UiBlock } from '@/types/block/UiBlock'`
  - Context: UI Layer (workflow utilities)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/utils/workflow/autoConnectBlocks.ts`
  - Current: `import { FormBlock } from '@/types/block-types'`
  - Replace with: `import { UiBlock } from '@/types/block/UiBlock'`
  - Context: UI Layer (workflow utilities)

### Components Directory

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/components/form/settings/AIConversationSettings.tsx`
  - Current: `import { FormBlock } from "@/types/block-types"`
  - Replace with: `import { UiBlock } from "@/types/block/UiBlock"`
  - Context: UI Layer (component)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/components/form/viewer/BlockRenderer.tsx`
  - Current: `import { FormBlock } from '@/types/block-types'`
  - Replace with: `import { UiBlock } from '@/types/block/UiBlock'`
  - Context: UI Layer (component)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/components/form/builder/form-builder-sidebar.tsx`
  - Current: `import type { FormBlock, BlockDefinition } from '@/types/block-types'`
  - Replace with: `import type { UiBlock, UiBlockDefinition } from '@/types/block/UiBlock'`
  - Context: UI Layer (component)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/components/form/builder/form-builder-content.tsx`
  - Current: `import type { FormBlock } from '@/types/block-types'`
  - Replace with: `import type { UiBlock } from '@/types/block/UiBlock'`
  - Context: UI Layer (component)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/components/form/builder/form-builder-block-selector.tsx`
  - Current: `import type { BlockDefinition } from '@/types/block-types'`
  - Replace with: `import type { UiBlockDefinition } from '@/types/block/UiBlock'`
  - Context: UI Layer (component)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/components/dashboard/FormsView.tsx`
  - Current: `import type { BlockType } from "@/types/block-types"`
  - Replace with: `import type { ApiBlockType } from "@/types/block/ApiBlock"`
  - Context: UI Layer (component)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/components/workflow/builder/condition-card.tsx`
  - Current: `import { FormBlock } from '@/types/block-types'`
  - Replace with: `import { UiBlock } from '@/types/block/UiBlock'`
  - Context: UI Layer (component)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/components/workflow/builder/connection/ConnectionOverviewCard.tsx`
  - Current: `import { FormBlock } from '@/types/block-types'`
  - Replace with: `import { UiBlock } from '@/types/block/UiBlock'`
  - Context: UI Layer (component)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/components/workflow/builder/connection/RuleSettingsCard.tsx`
  - Current: `import { FormBlock } from '@/types/block-types'`
  - Replace with: `import { UiBlock } from '@/types/block/UiBlock'`
  - Context: UI Layer (component)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/components/workflow/builder/connection/DefaultTargetCard.tsx`
  - Current: `import { FormBlock } from '@/types/block-types'`
  - Replace with: `import { UiBlock } from '@/types/block/UiBlock'`
  - Context: UI Layer (component)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/components/workflow/builder/condition-fields.tsx`
  - Current: `import { FormBlock } from '@/types/block-types'`
  - Replace with: `import { UiBlock } from '@/types/block/UiBlock'`
  - Context: UI Layer (component)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/components/workflow/builder/connection-overview.tsx`
  - Current: `import { FormBlock } from '@/types/block-types'`
  - Replace with: `import { UiBlock } from '@/types/block/UiBlock'`
  - Context: UI Layer (component)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/components/workflow/builder/condition-value.tsx`
  - Current: `import { FormBlock } from '@/types/block-types'`
  - Replace with: `import { UiBlock } from '@/types/block/UiBlock'`
  - Context: UI Layer (component)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/components/workflow/builder/condition-operators.tsx`
  - Current: `import { FormBlock } from '@/types/block-types'`
  - Replace with: `import { UiBlock } from '@/types/block/UiBlock'`
  - Context: UI Layer (component)

### Hooks Directory

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/hooks/usePublishForm.ts`
  - Current: `import { FormBlock } from "@/types/block-types"`
  - Replace with: `import { UiBlock } from "@/types/block/UiBlock"`
  - Context: UI Layer (hook)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/hooks/form/useFormSubmission.ts`
  - Current: `import type { FormBlock } from '@/types/block-types'`
  - Replace with: `import type { UiBlock } from '@/types/block/UiBlock'`
  - Context: UI Layer (hook)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/hooks/form/useWorkflowNavigation.ts`
  - Current: `import { FormBlock } from '@/types/block-types'`
  - Replace with: `import { UiBlock } from '@/types/block/UiBlock'`
  - Context: UI Layer (hook)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/hooks/form/useFormWorkflowNavigation.ts`
  - Current: `import { FormBlock } from '@/types/block-types'`
  - Replace with: `import { UiBlock } from '@/types/block/UiBlock'`
  - Context: UI Layer (hook)

### Registry Directory

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/registry/blockRegistry.tsx`
  - Current: `import type { BlockDefinition, FormBlock } from '@/types/block-types'`
  - Replace with: `import type { UiBlockDefinition, UiBlock } from '@/types/block/UiBlock'`
  - Context: UI Layer (component registry)

### Services Directory

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/services/form/transformVersionedFormData.ts`
  - Current: `import { FormBlock, BlockType } from '@/types/block-types'`
  - Replace with: `import { ApiBlock, ApiBlockType } from '@/types/block/ApiBlock'`
  - Context: API Layer (service)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/services/form/updateFormVersion.ts`
  - Current: `import type { FormBlock as FrontendFormBlock } from '@/types/block-types'`
  - Replace with: `import type { UiBlock } from '@/types/block/UiBlock'`
  - Context: UI Layer (service)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/services/form/publishFormWithFormBuilderStore.ts`
  - Current: `import type { FormBlock, BlockType } from '@/types/block-types'`
  - Replace with: `import type { UiBlock } from '@/types/block/UiBlock'; import type { ApiBlockType } from '@/types/block/ApiBlock'`
  - Context: Mixed UI/API Layer (service)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/services/form/layoutMigration.ts`
  - Current: `import { FormBlock } from '@/types/block-types'`
  - Replace with: `import { ApiBlock } from '@/types/block/ApiBlock'`
  - Context: API Layer (service)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/services/form/loadFormMedia.ts`
  - Current: `import { FormBlock } from '@/types/block-types'`
  - Replace with: `import { ApiBlock } from '@/types/block/ApiBlock'`
  - Context: API Layer (service)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/services/form/createFormVersion.ts`
  - Current: `import type { FormBlock as FrontendFormBlock } from '@/types/block-types'`
  - Replace with: `import type { UiBlock } from '@/types/block/UiBlock'`
  - Context: UI Layer (service)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/services/form/saveFormWithBlocks.ts`
  - Current: `import type { FormBlock as FrontendFormBlock } from '@/types/block-types'`
  - Replace with: `import type { UiBlock } from '@/types/block/UiBlock'`
  - Context: UI Layer (service)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/services/form/blockMappers.ts`
  - Current: `import { FormBlock } from '@/types/block-types'`
  - Replace with: `import { ApiBlock } from '@/types/block/ApiBlock'`
  - Context: API Layer (service)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/services/form/updateFormBlock.ts`
  - Current: `import { BlockType, FormBlock } from '@/types/block-types'`
  - Replace with: `import { ApiBlockType, ApiBlock } from '@/types/block/ApiBlock'`
  - Context: API Layer (service)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/services/connection/validateConnections.ts`
  - Current: `import { FormBlock } from '@/types/block-types'`
  - Replace with: `import { ApiBlock } from '@/types/block/ApiBlock'`
  - Context: API Layer (service)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/services/viewer/loadFormComplete.ts`
  - Current: `import { FormBlock, BlockType } from '@/types/block-types'`
  - Replace with: `import { ApiBlock, ApiBlockType } from '@/types/block/ApiBlock'`
  - Context: API Layer (service)

- [ ] `/Users/jelep/Documents/GitHub/FlowForm/src/services/viewer/loadVersionedFormComplete.ts`
  - Current: `import { FormBlock } from '@/types/block-types'`
  - Replace with: `import { ApiBlock } from '@/types/block/ApiBlock'`
  - Context: API Layer (service)

## Final Step

- [ ] After all files are migrated, delete `/Users/jelep/Documents/GitHub/FlowForm/src/types/block-types.ts`

## Migration Strategy

1. Start migration from the bottom up:
   - First migrate the type definitions and basic utilities
   - Then migrate services that use these types
   - Finally migrate UI components and hooks

2. Use TypeScript to catch errors:
   - After each migration step, run TypeScript compilation to verify compatible types
   - Fix any type errors before proceeding

3. Test thoroughly:
   - After migration is complete, verify all functionality still works
   - Focus on testing form creation, editing, and submission workflows

4. Implementation Tips:
   - When migrating UI components, pay attention to prop typing changes
   - Update any functions that expect the old FormBlock type
   - Check for property access differences between the old and new types
   - Remember that UI types extend API types, which may require additional properties
