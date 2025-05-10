"use client"

import { create } from 'zustand'
import type { FormBuilderState } from '@/types/store-types'

// Import slices
import { createFormCoreSlice } from './slices/formCore'
import { createFormBlocksSlice } from './slices/formBlocks'
import { createFormPresentationSlice } from './slices/formPresentation'
import { createFormUISlice } from './slices/formUI'
import { createFormWorkflowSlice } from './slices/formWorkflow'
import { createFormPersistenceSlice } from './slices/formPersistence'
import { createFormMediaSlice } from './slices/formMedia'
import { createUIAlertsSlice } from './slices/uiAlerts'

// Create the combined store
export const useFormBuilderStore = create<FormBuilderState>()(
  (...a) => ({
    ...createFormCoreSlice(...a),
    ...createFormBlocksSlice(...a),
    ...createFormPresentationSlice(...a),
    ...createFormUISlice(...a),
    ...createFormWorkflowSlice(...a),
    ...createFormPersistenceSlice(...a),
    ...createFormMediaSlice(...a),
    ...createUIAlertsSlice(...a),
  })
)

// Export the hook for block definitions
export { useCurrentBlockDefinition } from './hooks/useCurrentBlockDefinition'
