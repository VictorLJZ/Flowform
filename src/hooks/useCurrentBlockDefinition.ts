"use client"

import { getBlockDefinition } from '@/registry/blockRegistry'
import { useFormBuilderStore } from '@/stores/formBuilderStore'

/**
 * Hook to get block definition for the current block
 */
export const useCurrentBlockDefinition = () => {
  const { getCurrentBlock } = useFormBuilderStore()
  const currentBlock = getCurrentBlock()
  
  if (!currentBlock) return null
  
  try {
    return getBlockDefinition(currentBlock.subtype)
  } catch (error) {
    console.error('Error getting block definition:', error)
    return null
  }
}
