/**
 * Visitor ID management for analytics tracking
 * Handles generating and retrieving anonymous visitor IDs
 */

import { v4 as uuidv4 } from 'uuid';

const VISITOR_ID_KEY = 'flowform_visitor_id';

/**
 * Get current visitor ID from storage or generate a new one
 * 
 * @returns The visitor ID
 */
export function getVisitorId(): string {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    return 'server-side';
  }

  // Try to get existing ID from localStorage
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  
  // If no ID exists, generate a new one and store it
  if (!visitorId) {
    visitorId = uuidv4();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  
  return visitorId;
}

/**
 * Determine if this is a unique visit based on session storage
 * 
 * @param formId - The ID of the form being viewed
 * @returns boolean indicating if this is the first view of this form in this session
 */
export function isUniqueFormVisit(formId: string): boolean {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    return false;
  }

  const storageKey = `flowform_viewed_${formId}`;
  const hasViewed = sessionStorage.getItem(storageKey);
  
  if (!hasViewed) {
    // Mark this form as viewed for this session
    sessionStorage.setItem(storageKey, 'true');
    return true;
  }
  
  return false;
}
