import { create } from 'zustand'
import type { AnalyticsState } from '@/types/store-types'

// State related to data fetching (responses, currentResponse, isLoading, error)
// has been moved to SWR hooks (useFormResponses, useFormResponse).
// This store might still be useful for UI state or actions not directly tied to fetching,
// like the export functionality.

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  isExporting: false,
  exportError: null,

  exportResponses: async (formId, format) => {
    // This will be implemented in future iterations
    set({ isExporting: true, exportError: null })

    try {
      // Here we would implement the export functionality
      // This might involve fetching data using the fetcher directly
      // Or ideally, the component calling this action provides the already fetched data
      console.log(`Exporting responses for form ${formId} in ${format} format - Placeholder`)      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1000)); 

      set({ isExporting: false })
    } catch (error: unknown) {
      set({
        exportError: error instanceof Error ? error.message : 'Error exporting responses',
        isExporting: false
      })
    }
  }
}))
