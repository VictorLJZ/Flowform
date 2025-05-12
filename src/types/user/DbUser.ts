/**
 * Database-level user types
 * 
 * These types represent user data as it exists in the database.
 * They use snake_case naming to match the database schema.
 */

/**
 * Database profiles table schema 
 */
export interface DbProfile {
  id: string; // UUID, references auth.users.id
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}
