/**
 * Shared utility functions for workspace services
 * 
 * This file provides utility functions used by both server and client services.
 */

import crypto from 'crypto';

/**
 * Generate a secure random token for invitations
 * 
 * @returns A random token string
 */
export function generateInvitationToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

/**
 * Check if an invitation is expired based on its expiration date
 * 
 * @param expiresAt - ISO date string of expiration
 * @returns true if expired, false otherwise
 */
export function isInvitationExpired(expiresAt: string): boolean {
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  
  return expiryDate < now;
}

/**
 * Calculate expiration date from current date
 * 
 * @param days - Number of days from now until expiration
 * @returns ISO date string of the expiration date
 */
export function calculateExpirationDate(days: number = 7): string {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(now.getDate() + days);
  
  return expiresAt.toISOString();
}

/**
 * Role hierarchy for permission checks
 * Higher number means higher permission level
 */
export const ROLE_WEIGHTS = {
  'viewer': 1,
  'editor': 2,
  'admin': 3,
  'owner': 4
};
