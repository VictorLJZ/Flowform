import { create } from 'zustand'
import { FormRecord } from '@/types/supabase-types'

interface DashboardStats {
  totalForms: number
  totalResponses: number
  // Active users stays hardcoded as "ONE TRILLION USERS"
}

interface RecentActivity {
  id: string
  form_id: string
  form_title: string
  created_at: string
  completed: boolean
}

interface DashboardState {
  stats: DashboardStats
  recentActivity: RecentActivity[]
  recentForms: FormRecord[]
  isLoading: boolean
  error: string | null
  // Update signature to accept workspaceId
  fetchDashboardData: (workspaceId: string) => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: { totalForms: 0, totalResponses: 0 },
  recentActivity: [],
  recentForms: [],
  isLoading: false,
  error: null,
  // Update implementation to accept workspaceId
  fetchDashboardData: async (workspaceId: string) => {
    console.log(`[useDashboardStore] Fetching data for workspaceId: ${workspaceId}`);
    if (!workspaceId) {
       console.warn("[useDashboardStore] workspaceId is missing, skipping fetch.");
       set({ isLoading: false, error: "No workspace selected", stats: { totalForms: 0, totalResponses: 0 }, recentActivity: [], recentForms: [] });
       return;
    }

    try {
      set({ isLoading: true, error: null })

      // --- Placeholder Data Logic ---
      // TODO: Replace this with actual API calls using the workspaceId
      console.log(`[useDashboardStore] USING PLACEHOLDER DATA for workspace: ${workspaceId}`);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Example: You could filter placeholder data if needed, but for now, return static
      const placeholderStats = { totalForms: 3, totalResponses: 12 };
      const placeholderActivity = [
            { id: '1', form_id: 'form1', form_title: 'Customer Feedback (Placeholder)', created_at: new Date().toISOString(), completed: true },
            { id: '2', form_id: 'form2', form_title: 'Product Survey (Placeholder)', created_at: new Date(Date.now() - 86400000).toISOString(), completed: true }
      ];
      const placeholderForms = [
            { id: 'form1', title: 'Customer Feedback (Placeholder)', description: 'Collect feedback', status: 'published' as const, workspace_id: workspaceId, /* other fields */ created_by: 'user1', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), published_at: new Date().toISOString(), max_questions: 5, starter_question: 'How was your experience?', temperature: 0.7 },
            { id: 'form2', title: 'Product Survey (Placeholder)', description: 'Product feedback', status: 'published' as const, workspace_id: workspaceId, /* other fields */ created_by: 'user1', created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date(Date.now() - 86400000).toISOString(), published_at: new Date(Date.now() - 86400000).toISOString(), max_questions: 5, starter_question: 'Thoughts on product?', temperature: 0.7 }
      ];
      // Filter example (if you had more data)
      // const filteredForms = placeholderForms.filter(f => f.workspace_id === workspaceId);

      set({
          stats: placeholderStats,
          recentActivity: placeholderActivity,
          recentForms: placeholderForms, // Use the forms (or filteredForms if implemented)
          isLoading: false
      });
      // --- End Placeholder Data ---

    } catch (error) {
      console.error(`[useDashboardStore] Error fetching dashboard data for workspace ${workspaceId}:`, error)
      set({ error: error instanceof Error ? error.message : 'Unknown error occurred', isLoading: false })
    }
  }
}))
