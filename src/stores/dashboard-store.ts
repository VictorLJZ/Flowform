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
      
      // Fetch stats
      const statsResponse = await fetch('/api/dashboard/stats')
      if (!statsResponse.ok) throw new Error('Failed to fetch dashboard stats')
      const statsData = await statsResponse.json()
      
      // Fetch recent activity
      const activityResponse = await fetch('/api/dashboard/recent-activity')
      if (!activityResponse.ok) throw new Error('Failed to fetch recent activity')
      const activityData = await activityResponse.json()
      
      // Fetch recent forms
      const formsResponse = await fetch('/api/dashboard/recent-forms')
      if (!formsResponse.ok) throw new Error('Failed to fetch recent forms')
      const formsData = await formsResponse.json()
      
      set({
        stats: {
          totalForms: statsData.forms || 0,
          totalResponses: statsData.responses || 0
        },
        recentActivity: activityData.activity || [],
        recentForms: formsData.forms || [],
        isLoading: false
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      set({ error: error instanceof Error ? error.message : 'Unknown error occurred', isLoading: false })
    }
  }
}))
