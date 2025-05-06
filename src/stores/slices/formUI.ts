"use client"

import { StateCreator } from 'zustand'
import type { FormUISlice } from '@/types/form-store-slices'
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
  
  // Actions
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  
  setBlockSelectorOpen: (open: boolean) => set({ blockSelectorOpen: open })
})
