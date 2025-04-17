// src/services/dashboard/fetchers.ts

// Define the types for the data returned by the fetcher
export interface DashboardStats {
  totalForms: number;
  totalResponses: number;
}

export interface RecentActivity {
  id: string;
  form_id: string;
  form_title: string;
  created_at: string;
  completed: boolean;
}

// Assuming FormRecord is already defined elsewhere, if not, define it here
// import { FormRecord } from '@/types/supabase-types';
// For simplicity, let's use a minimal version if FormRecord isn't easily available
export interface SimpleFormRecord {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  workspace_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  max_questions: number;
  starter_question: string;
  temperature: number;
}


export interface DashboardData {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  recentForms: SimpleFormRecord[]; // Use SimpleFormRecord or import FormRecord
}

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
  // Using SimpleFormRecord for now
  const placeholderForms: SimpleFormRecord[] = [
    { id: 'form1', title: 'Customer Feedback (Placeholder)', description: 'Collect feedback', status: 'published' as const, workspace_id: workspaceId, created_by: 'user1', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), published_at: new Date().toISOString(), max_questions: 5, starter_question: 'How was your experience?', temperature: 0.7 },
    { id: 'form2', title: 'Product Survey (Placeholder)', description: 'Product feedback', status: 'published' as const, workspace_id: workspaceId, created_by: 'user1', created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date(Date.now() - 86400000).toISOString(), published_at: new Date(Date.now() - 86400000).toISOString(), max_questions: 5, starter_question: 'Thoughts on product?', temperature: 0.7 }
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
