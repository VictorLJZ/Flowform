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
  fetchDashboardData: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: { totalForms: 0, totalResponses: 0 },
  recentActivity: [],
  recentForms: [],
  isLoading: false,
  error: null,
  fetchDashboardData: async () => {
    try {
      set({ isLoading: true, error: null })
      
      // TEMPORARY: Use placeholder data instead of fetching from API
      // This avoids hitting non-existent endpoints
      
      setTimeout(() => {
        set({
          stats: {
            totalForms: 3,
            totalResponses: 12
          },
          recentActivity: [
            {
              id: '1',
              form_id: 'form1',
              form_title: 'Customer Feedback Form',
              created_at: new Date().toISOString(),
              completed: true
            },
            {
              id: '2',
              form_id: 'form2',
              form_title: 'Product Survey',
              created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              completed: true
            }
          ],
          recentForms: [
            {
              id: 'form1',
              title: 'Customer Feedback Form',
              description: 'Collect customer feedback',
              status: 'published' as const,
              workspace_id: 'workspace1',
              created_by: 'user1',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              published_at: new Date().toISOString(),
              max_questions: 5,
              starter_question: 'How was your experience?',
              temperature: 0.7
            },
            {
              id: 'form2',
              title: 'Product Survey',
              description: 'Get feedback on our products',
              status: 'published' as const,
              workspace_id: 'workspace1',
              created_by: 'user1',
              created_at: new Date(Date.now() - 86400000).toISOString(),
              updated_at: new Date(Date.now() - 86400000).toISOString(),
              published_at: new Date(Date.now() - 86400000).toISOString(),
              max_questions: 5,
              starter_question: 'What do you think of our product?',
              temperature: 0.7
            }
          ],
          isLoading: false
        });
      }, 500); // Add slight delay to simulate loading
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      set({ error: error instanceof Error ? error.message : 'Unknown error occurred', isLoading: false })
    }
  }
}))
