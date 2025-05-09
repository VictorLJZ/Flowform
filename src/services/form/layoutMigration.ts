"use client"

import { SlideLayout, ViewportLayouts, getDefaultViewportLayouts } from '@/types/layout-types'
import { FormBlock } from '@/types/block-types'

/**
 * Migrate a block from the legacy single layout format to the new ViewportLayouts format
 * This function is idempotent - it won't modify blocks that already use ViewportLayouts
 * 
 * @param block The form block to migrate
 * @returns A new block object with migrated layouts
 */
export function migrateBlockLayout(block: FormBlock): FormBlock {
  if (!block.settings) {
    // If the block has no settings at all, add default viewport layouts
    return {
      ...block,
      settings: {
        viewportLayouts: getDefaultViewportLayouts()
      }
    }
  }
  
  // If the block already has viewport layouts, don't modify it
  if (block.settings.viewportLayouts) {
    return block
  }
  
  // If the block has the legacy layout, migrate it
  if (block.settings.layout) {
    const legacyLayout = block.settings.layout as SlideLayout
    
    // Create viewport layouts with legacy layout as both desktop and mobile layouts
    // The user can then customize each as needed
    const viewportLayouts: ViewportLayouts = {
      desktop: legacyLayout,
      mobile: legacyLayout
    }
    
    // Create new settings with the viewportLayouts property
    const newSettings = {
      ...block.settings,
      viewportLayouts,
      // Keep the legacy layout for backward compatibility
      // but eventually we could remove it
      layout: legacyLayout
    }
    
    return {
      ...block,
      settings: newSettings
    }
  }
  
  // If the block has settings but no layout, add default viewport layouts
  return {
    ...block,
    settings: {
      ...block.settings,
      viewportLayouts: getDefaultViewportLayouts()
    }
  }
}

/**
 * Migrate all blocks in a form to the new ViewportLayouts format
 * 
 * @param blocks Array of form blocks to migrate
 * @returns A new array of blocks with migrated layouts
 */
export function migrateAllBlockLayouts(blocks: FormBlock[]): FormBlock[] {
  return blocks.map(migrateBlockLayout)
}
