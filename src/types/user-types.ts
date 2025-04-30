import { Profile } from './supabase-types';

/**
 * Input type for updating a user profile
 */
export type ProfileUpdateInput = Partial<Pick<Profile, 
  'full_name' | 
  'avatar_url'
> & {
  bio?: string;
  settings?: Record<string, unknown>;
}>;
