/**
 * API to UI User/Profile Transformations
 * 
 * This file provides utility functions for transforming user-related types
 * from API layer to UI layer:
 * - Prepares data for display in UI components
 * - Adds UI-specific properties and formatting
 */

import { ApiProfile, UiProfile } from '@/types/user';

/**
 * Get initials from a name for avatar displays
 * 
 * @param name - Full name to extract initials from
 * @returns Up to 2 characters of initials
 */
function getInitials(name?: string): string {
  if (!name) return '?';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  // Get first letter of first and last parts
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Transform an API profile to UI-specific format with enhanced display properties
 * 
 * @param profile - API profile object
 * @returns UI-formatted profile
 */
export function apiToUiProfile(profile: ApiProfile): UiProfile {
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    avatarUrl: profile.avatarUrl,
    displayName: profile.fullName || profile.email,
    initials: getInitials(profile.fullName),
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt
  };
}

/**
 * Format a date for UI display
 * 
 * @param isoDate - ISO date string from the API
 * @param options - Display options
 * @returns Formatted date string for display
 */
export function formatUserDate(
  isoDate: string,
  options: { relative?: boolean; includeTime?: boolean } = {}
): string {
  const date = new Date(isoDate);
  
  if (options.relative) {
    // Simple relative time for demo
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }
  
  // Standard date display
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(options.includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
  });
  
  return formatter.format(date);
}
