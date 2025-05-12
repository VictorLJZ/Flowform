/**
 * Database to API User/Profile Transformations
 * 
 * This file provides utility functions for transforming user-related types
 * from Database (Db) layer to API layer:
 * - Converts snake_case DB fields to camelCase API fields
 * - Maintains the same semantic structure
 */

import { DbProfile } from '@/types/user';
import { ApiProfile } from '@/types/user';

/**
 * Transform a DB profile to API format
 * 
 * @param dbProfile - Database profile object
 * @returns API-formatted profile
 */
export function dbToApiProfile(dbProfile: DbProfile): ApiProfile {
  return {
    id: dbProfile.id,
    email: dbProfile.email,
    // Convert nulls to undefined for TypeScript convention
    fullName: dbProfile.full_name === null ? undefined : dbProfile.full_name,
    avatarUrl: dbProfile.avatar_url === null ? undefined : dbProfile.avatar_url,
    createdAt: dbProfile.created_at,
    updatedAt: dbProfile.updated_at
  };
}

/**
 * Transform an array of DB profiles to API format
 * 
 * @param dbProfiles - Array of database profile objects
 * @returns Array of API-formatted profiles
 */
export function dbToApiProfiles(dbProfiles: DbProfile[]): ApiProfile[] {
  return dbProfiles.map(dbToApiProfile);
}
