/**
 * API to Database User/Profile Transformations
 * 
 * This file provides utility functions for transforming user-related types
 * from API layer to Database (Db) layer:
 * - Converts camelCase API fields to snake_case DB fields
 * - Prepares data for database operations
 */

import { DbProfile } from '@/types/user';
import { ApiProfileUpdateInput } from '@/types/user';

/**
 * Transform API profile update input to DB format for update operation
 * 
 * @param input - API profile update input
 * @returns Database-ready partial profile for update
 */
export function profileUpdateInputToDb(input: ApiProfileUpdateInput): Partial<DbProfile> {
  return {
    // Convert undefined to null for DB layer consistency
    full_name: input.fullName !== undefined ? input.fullName : null,
    avatar_url: input.avatarUrl !== undefined ? input.avatarUrl : null,
    updated_at: new Date().toISOString() // Always update the timestamp
  };
}
