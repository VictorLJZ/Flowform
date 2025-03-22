"use client"

/**
 * StoreHydrator Component
 * 
 * This component was previously used for client-side hydration of Zustand stores.
 * Our current simplified form store uses Zustand's built-in persist middleware,
 * which handles hydration automatically, so we don't need manual hydration code.
 * 
 * We're keeping this component as a placeholder in case we need to add
 * custom hydration logic in the future.
 */
export function StoreHydrator() {
  // No manual hydration needed - Zustand's persist middleware handles it
  return null
}
