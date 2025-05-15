// src/services/dashboard/fetchers.ts

import { DashboardStats, RecentActivity, DashboardFormData, DashboardData } from '@/types/dashboard-types';

/**
 * Fetches dashboard data (stats, recent activity, recent forms) for a given workspace.
 * TODO: Replace placeholder logic with actual Supabase queries.
 *
 * @param workspaceId - The ID of the workspace to fetch data for.
 * @returns A promise that resolves with the dashboard data.
 */
export const fetchDashboardData = async (workspaceId: string): Promise<DashboardData> => {
  console.log(`[fetchDashboardData] Fetching data for workspaceId: ${workspaceId}`);
  if (!workspaceId) {
    console.warn("[fetchDashboardData] workspaceId is missing.");
    // SWR handles errors, so we throw one here for consistency
    throw new Error("No workspace selected");
  }

  // --- Placeholder Data Logic ---
  // TODO: Replace this with actual API calls using the workspaceId
  console.log(`[fetchDashboardData] USING PLACEHOLDER DATA for workspace: ${workspaceId}`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const placeholderStats: DashboardStats = { totalForms: 3, totalResponses: 12 };
  const placeholderActivity: RecentActivity[] = [
    { id: '1', form_id: 'form1', form_title: 'Customer Feedback (Placeholder)', created_at: new Date().toISOString(), completed: true },
    { id: '2', form_id: 'form2', form_title: 'Product Survey (Placeholder)', created_at: new Date(Date.now() - 86400000).toISOString(), completed: true }
  ];
  // Forms with dynamic configuration
  const placeholderForms: DashboardFormData[] = [
    { 
      form_id: 'form1', 
      title: 'Customer Feedback (Placeholder)', 
      description: 'Collect feedback', 
      status: 'published' as const, 
      workspace_id: workspaceId, 
      created_by: 'user1', 
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString(), 
      published_at: new Date().toISOString(), 
      dynamicConfig: {
        max_questions: 5, 
        starter_type: "question", content: 'How was your experience?', 
        temperature: 0.7
      }
    },
    { 
      form_id: 'form2', 
      title: 'Product Survey (Placeholder)', 
      description: 'Product feedback', 
      status: 'published' as const, 
      workspace_id: workspaceId, 
      created_by: 'user1', 
      created_at: new Date(Date.now() - 86400000).toISOString(), 
      updated_at: new Date(Date.now() - 86400000).toISOString(), 
      published_at: new Date(Date.now() - 86400000).toISOString(), 
      dynamicConfig: {
        max_questions: 5, 
        starter_type: "question", content: 'Thoughts on product?', 
        temperature: 0.7
      }
    }
  ];

  // In a real scenario, you'd fetch and potentially filter based on workspaceId here.
  // For the placeholder, we assume the data is already 'correct' for the given workspaceId.

  return {
    stats: placeholderStats,
    recentActivity: placeholderActivity,
    recentForms: placeholderForms,
  };
  // --- End Placeholder Data ---
};
