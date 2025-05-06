import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { trackFormViewClient } from '@/services/analytics/client';
import { getVisitorId, isUniqueFormVisit } from '@/lib/analytics/visitorId';

// Types to represent view tracking data
type ViewedForm = {
  formId: string;
  lastViewedAt: number;
  viewCount: number;
};

interface ViewTrackingState {
  viewedForms: Record<string, ViewedForm>;
  trackView: (formId: string, metadata?: Record<string, unknown>) => Promise<boolean>;
  hasViewedRecently: (formId: string, cooldownMinutes?: number) => boolean;
  getFormViewCount: (formId: string) => number;
}

/**
 * Store for tracking form views with deduplication
 * 
 * Uses Zustand with persist middleware to maintain view history across sessions
 * and prevent duplicate tracking within configurable cooldown period
 */
export const useViewTrackingStore = create<ViewTrackingState>()(
  persist(
    (set, get) => ({
      viewedForms: {},
      
      /**
       * Track a form view with deduplication logic
       * 
       * @param formId - ID of the form to track
       * @param metadata - Optional metadata for the view
       * @returns Promise resolving to true if view was tracked, false if deduplicated
       */
      trackView: async (formId: string, metadata: Record<string, unknown> = {}) => {
        const { viewedForms } = get();
        const now = Date.now();
        const cooldownMs = 30 * 60 * 1000; // 30 minutes
        const existingView = viewedForms[formId];
        
        // Determine if this is the first view this session
        const isFirstView = !existingView;
        const isUniqueView = isFirstView || now - existingView.lastViewedAt > cooldownMs;
        
        // Only track if not viewed recently
        if (isUniqueView) {
          try {
            // CRITICAL FIX: Update local store BEFORE making the API call
            // This prevents race conditions where multiple calls happen before state updates
            set((state) => ({
              viewedForms: {
                ...state.viewedForms,
                [formId]: {
                  formId,
                  lastViewedAt: now,
                  viewCount: existingView ? existingView.viewCount + 1 : 1
                }
              }
            }));
            
            // Get visitor ID for tracking
            const visitorId = getVisitorId();
            
            // Check session storage for first visit in this session
            const isSessionUnique = isUniqueFormVisit(formId);
            
            // Enhanced metadata
            const enrichedMetadata = {
              ...metadata,
              is_unique: isSessionUnique,
              visitor_id: visitorId,
            };
            
            // Track via API after the state is already updated
            console.log('[ViewTracking] Tracking form view:', formId);
            await trackFormViewClient(formId, enrichedMetadata);
            
            return true;
          } catch (error) {
            console.error('[ViewTracking] Failed to track view:', error);
            return false;
          }
        } else {
          console.log('[ViewTracking] Skipping duplicate view for form:', formId);
          return false;
        }
      },
      
      /**
       * Check if a form has been viewed recently within the cooldown period
       * 
       * @param formId - ID of the form to check
       * @param cooldownMinutes - Optional custom cooldown minutes (default: 30)
       * @returns True if form was viewed within cooldown period
       */
      hasViewedRecently: (formId: string, cooldownMinutes = 30) => {
        const { viewedForms } = get();
        const existingView = viewedForms[formId];
        
        if (!existingView) return false;
        
        const cooldownMs = cooldownMinutes * 60 * 1000;
        return Date.now() - existingView.lastViewedAt < cooldownMs;
      },
      
      /**
       * Get the number of times a form has been viewed
       * 
       * @param formId - ID of the form to check
       * @returns The number of times the form has been viewed
       */
      getFormViewCount: (formId: string) => {
        const { viewedForms } = get();
        return viewedForms[formId]?.viewCount || 0;
      }
    }),
    {
      name: 'flowform-view-tracking',
      partialize: (state) => ({ viewedForms: state.viewedForms }),
      // Version control for future schema changes
      version: 1
    }
  )
);
