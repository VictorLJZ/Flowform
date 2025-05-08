import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the base URL for API requests based on the current environment
 * - In browser: returns empty string (for relative URLs)
 * - In Node.js: returns the absolute URL using environment variables
 */
export function getBaseUrl(): string {
  // Check if we're running in a browser environment
  if (typeof window !== 'undefined') {
    // Browser environment - use relative URLs
    return ''
  }
  
  // Server environment - construct absolute URL
  // First try environment variables (for production)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
  
  if (siteUrl) {
    // Make sure we don't add the protocol if it's already included
    return siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`
  }
  
  // Fallback for local development
  return 'http://localhost:3000'
}
