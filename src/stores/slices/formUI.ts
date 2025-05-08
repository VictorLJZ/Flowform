"use client"

import { StateCreator } from 'zustand'
import type { FormUISlice } from '@/types/form-store-slices-types'
import type { FormBuilderState } from '@/types/store-types'

export const createFormUISlice: StateCreator<
  FormBuilderState,
  [],
  [],
  FormUISlice
> = (set) => ({
  // State
  sidebarOpen: true,
  blockSelectorOpen: false,
  viewportMode: 'desktop', // Default to desktop mode
  
  // Actions
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  
  setBlockSelectorOpen: (open: boolean) => set({ blockSelectorOpen: open }),
  
  setViewportMode: (mode: 'desktop' | 'mobile') => set({ viewportMode: mode })
})
