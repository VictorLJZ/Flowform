"use client"

import { StateCreator } from 'zustand'
import type { FormCoreSlice } from '@/types/form-store-slices-types'
import type { FormBuilderState } from '@/types/store-types'
import type { CustomFormData } from '@/types/form-builder-types'
import { defaultFormTheme } from '@/types/theme-types'

// Initial empty form data
export const defaultFormData: CustomFormData = {
  form_id: '',
  title: 'Untitled Form',
  description: '',
  settings: {
    showProgressBar: true,
    requireSignIn: false,
    theme: 'default',
    primaryColor: '#0284c7',
    fontFamily: 'inter'
  },
  theme: defaultFormTheme
}

export const createFormCoreSlice: StateCreator<
  FormBuilderState,
  [],
  [],
  FormCoreSlice
> = (set) => ({
  // State
  formData: { ...defaultFormData },
  isLoading: false,
  isSaving: false,
  mode: 'builder',
  
  // Actions
  setFormData: (data: Partial<CustomFormData>) => set((state) => ({
    formData: { ...state.formData, ...data }
  })),
  
  setMode: (mode: 'builder' | 'viewer') => set({ mode })
})
