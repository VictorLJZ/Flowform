import { create } from 'zustand'
import { FormRecord } from '@/types/supabase-types'

interface DashboardStats {
  totalForms: number
  totalResponses: number
  // Active users stays hardcoded as "ONE TRILLION USERS"
}

interface RecentActivity {
  id: string
  formId: string
  form: string
  responses: number
  date: string
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
      
      // Fetch stats
      const statsResponse = await fetch('/api/dashboard/stats')
      if (!statsResponse.ok) throw new Error('Failed to fetch dashboard stats')
      const stats = await statsResponse.json()
      
      // Fetch recent activity
      const activityResponse = await fetch('/api/dashboard/recent-activity')
      if (!activityResponse.ok) throw new Error('Failed to fetch recent activity')
      const activity = await activityResponse.json()
      
      // Fetch recent forms
      const formsResponse = await fetch('/api/dashboard/recent-forms')
      if (!formsResponse.ok) throw new Error('Failed to fetch recent forms')
      const forms = await formsResponse.json()
      
      set({
        stats: stats,
        recentActivity: activity.recentActivity || [],
        recentForms: forms.recentForms || [],
        isLoading: false
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      set({ error: error instanceof Error ? error.message : 'Unknown error occurred', isLoading: false })
    }
  }
}))
