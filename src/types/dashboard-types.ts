// src/types/dashboard-types.ts
// Centralized type definitions for dashboard functionality

/**
 * Statistics data for dashboard display
 */
export interface DashboardStats {
  totalForms: number;
  totalResponses: number;
}

/**
 * Recent form activity information
 */
export interface RecentActivity {
  id: string;
  form_id: string;
  form_title: string;
  created_at: string;
  completed: boolean;
}

/**
 * Represents a form with its dynamic configuration
 */
export interface DashboardFormData {
  form_id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'published' | 'archived';
  workspace_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  // Dynamic block configuration properties
  dynamicConfig?: {
    max_questions: number;
    starter_type: "question", content: string;
    temperature: number;
  };
}

/**
 * Complete data structure for dashboard display
 */
export interface DashboardData {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  recentForms: DashboardFormData[];
}
