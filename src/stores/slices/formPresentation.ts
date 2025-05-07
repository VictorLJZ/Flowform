"use client"

import { StateCreator } from 'zustand'
import type { FormPresentationSlice } from '@/types/form-store-slices-types'
import type { FormBuilderState } from '@/types/store-types'
import type { SlideLayout } from '@/types/layout-types'
import type { BlockPresentation, FormTheme } from '@/types/theme-types'
import { defaultBlockPresentation, defaultFormTheme } from '@/types/theme-types'

export const createFormPresentationSlice: StateCreator<
  FormBuilderState,
  [],
  [],
  FormPresentationSlice
> = (set, get) => ({
  // State
  defaultBlockPresentation,
  
  // Actions  
  updateBlockLayout: (blockId: string, layoutConfig: Partial<SlideLayout>) => {
    const { blocks } = get()
    const blockToUpdate = blocks.find(block => block.id === blockId)
    
    if (!blockToUpdate) {
      console.error(`Block not found with ID: ${blockId}`)
      return
    }
    
    // Get current settings
    const currentSettings = blockToUpdate.settings || {}
    
    // Extract current layout or use empty object
    const currentLayout = (currentSettings.layout || {}) as Record<string, unknown>
    
    // Create updated layout by merging current with new config
    const updatedLayout = { ...currentLayout, ...layoutConfig }
    
    // Update block settings with new layout
    set((state) => ({
      blocks: state.blocks.map(block => 
        block.id === blockId 
          ? { 
              ...block, 
              settings: { 
                ...block.settings, 
                layout: updatedLayout 
              } 
            } 
          : block
      )
    }))
  },
  
  getBlockPresentation: (blockId: string) => {
    const { blocks, defaultBlockPresentation } = get()
    const block = blocks.find(block => block.id === blockId)
    
    if (!block) return defaultBlockPresentation
    
    // Try to get presentation from block settings
    const presentation = block.settings?.presentation as BlockPresentation | undefined
    
    return presentation || defaultBlockPresentation
  },
  
  setBlockPresentation: (blockId: string, presentation: Partial<BlockPresentation>) => {
    const { blocks } = get()
    const block = blocks.find(block => block.id === blockId)
    
    if (!block) {
      console.error(`Block not found with ID: ${blockId}`)
      return
    }
    
    // Get current presentation or use default
    const currentPresentation = block.settings?.presentation as BlockPresentation || { ...defaultBlockPresentation }
    
    // Create updated presentation
    const updatedPresentation = { ...currentPresentation, ...presentation }
    
    // Update block settings with new presentation
    set((state) => ({
      blocks: state.blocks.map(block => 
        block.id === blockId 
          ? { 
              ...block, 
              settings: { 
                ...block.settings, 
                presentation: updatedPresentation 
              } 
            } 
          : block
      )
    }))
  },
  
  setFormTheme: (theme: Partial<FormTheme>) => {
    // Ensure we're creating a properly typed FormTheme object
    set((state) => {
      // Get current theme or use default theme to ensure type safety
      const currentTheme = state.formData.theme || defaultFormTheme;
      
      // Create the merged theme with proper type handling
      const updatedTheme: FormTheme = {
        colors: {
          primary: (theme.colors?.primary || currentTheme.colors.primary),
          background: (theme.colors?.background || currentTheme.colors.background),
          text: (theme.colors?.text || currentTheme.colors.text),
          accent: (theme.colors?.accent || currentTheme.colors.accent),
          success: (theme.colors?.success || currentTheme.colors.success),
          error: (theme.colors?.error || currentTheme.colors.error),
          border: (theme.colors?.border || currentTheme.colors.border)
        },
        typography: {
          fontFamily: (theme.typography?.fontFamily || currentTheme.typography.fontFamily),
          headingSize: (theme.typography?.headingSize || currentTheme.typography.headingSize),
          bodySize: (theme.typography?.bodySize || currentTheme.typography.bodySize),
          lineHeight: (theme.typography?.lineHeight || currentTheme.typography.lineHeight)
        },
        layout: {
          spacing: (theme.layout?.spacing || currentTheme.layout.spacing),
          containerWidth: (theme.layout?.containerWidth || currentTheme.layout.containerWidth),
          borderRadius: (theme.layout?.borderRadius || currentTheme.layout.borderRadius),
          borderWidth: (theme.layout?.borderWidth || currentTheme.layout.borderWidth),
          shadowDepth: (theme.layout?.shadowDepth || currentTheme.layout.shadowDepth)
        }
      };
      
      // Return the state update with properly typed theme
      return {
        formData: {
          ...state.formData,
          theme: updatedTheme
        }
      };
    });
  }
})
