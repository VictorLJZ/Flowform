"use client"

import { StateCreator } from 'zustand'
import type { FormBuilderState } from '@/types/store-types'
import type { UIAlertsSlice } from '@/types/form-store-slices-types-alerts'

export const createUIAlertsSlice: StateCreator<
  FormBuilderState,
  [],
  [],
  UIAlertsSlice
> = (set, get) => ({
  // Alert state
  showOrphanedNodeAlert: false,
  orphanedNodeDetails: null,
  
  // Alert actions
  setShowOrphanedNodeAlert: (show: boolean) => set({ 
    showOrphanedNodeAlert: show,
    // Clear details when closing the alert
    orphanedNodeDetails: show ? get().orphanedNodeDetails : null
  }),
  
  setOrphanedNodeDetails: (details) => set({ 
    orphanedNodeDetails: details 
  })
})
