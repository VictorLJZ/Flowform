// Location Search Service for Google Maps API integration
// Handles searching, fetching details, and thumbnail retrieval for locations

import { LocationData } from "@/types/session";

// Cache for location results to minimize API calls
interface LocationCache {
  suggestions: Record<string, LocationSuggestion[]>;
  details: Record<string, LocationData>;
  thumbnails: Record<string, string | null>;
}

// Search suggestion result interface
export interface LocationSuggestion {
  placeId: string;
  name: string;
  mainText: string;
  secondaryText: string;
}

// Initialize cache
const cache: LocationCache = {
  suggestions: {},
  details: {},
  thumbnails: {},
};

/**
 * Search for locations using Google Maps Places Autocomplete API
 * @param query Search query string
 * @returns Array of location suggestions
 */
export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  // Return empty array for empty queries
  if (!query.trim()) return [];
  
  // Check cache first
  const cacheKey = query.toLowerCase().trim();
  if (cache.suggestions[cacheKey]) {
    return cache.suggestions[cacheKey];
  }
  
  try {
    // Using fetch with Google Maps Places API endpoint
    const response = await fetch(
      `/api/maps/autocomplete?input=${encodeURIComponent(query)}`,
      { method: "GET" }
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform API response to our interface format
    const suggestions: LocationSuggestion[] = (data.predictions || []).map((prediction: any) => ({
      placeId: prediction.place_id,
      name: prediction.structured_formatting.main_text,
      mainText: prediction.structured_formatting.main_text,
      secondaryText: prediction.structured_formatting.secondary_text || "",
    }));
    
    // Cache the results
    cache.suggestions[cacheKey] = suggestions;
    
    return suggestions;
  } catch (error) {
    console.error("Error searching locations:", error);
    return [];
  }
}

/**
 * Get detailed information about a location using its Place ID
 * @param placeId Google Maps Place ID
 * @returns LocationData object with all necessary details
 */
export async function getLocationDetails(placeId: string): Promise<LocationData> {
  // Check cache first
  if (cache.details[placeId]) {
    return cache.details[placeId];
  }
  
  try {
    // Using fetch with Google Maps Place Details API endpoint
    const response = await fetch(
      `/api/maps/details?place_id=${encodeURIComponent(placeId)}`,
      { method: "GET" }
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const result = data.result;
    
    if (!result) {
      throw new Error("No details found for place ID");
    }
    
    // Get thumbnail if available
    const photoUrl = await getPlaceThumbnail(placeId);
    
    // Create LocationData object
    const locationData: LocationData = {
      placeId,
      name: result.name,
      type: getLocationType(result.types),
      fullName: result.formatted_address,
      photoUrl,
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
    };
    
    // Cache the results
    cache.details[placeId] = locationData;
    
    return locationData;
  } catch (error) {
    console.error("Error getting location details:", error);
    // Return fallback data if fetch fails
    return {
      placeId,
      name: "Location unavailable",
      type: "unknown",
      fullName: "",
      photoUrl: null,
      coordinates: { lat: 0, lng: 0 },
    };
  }
}

/**
 * Get a thumbnail image URL for a place
 * @param placeId Google Maps Place ID
 * @returns URL to the place's thumbnail image, or null if not available
 */
export async function getPlaceThumbnail(placeId: string): Promise<string | null> {
  // Check cache first
  if (placeId in cache.thumbnails) {
    return cache.thumbnails[placeId];
  }
  
  try {
    // Using fetch with Google Maps Place Photos API endpoint
    const response = await fetch(
      `/api/maps/photo?place_id=${encodeURIComponent(placeId)}`,
      { method: "GET" }
    );
    
    if (!response.ok) {
      // If no photo is available, just return null (this is not an error)
      if (response.status === 404) {
        cache.thumbnails[placeId] = null;
        return null;
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const photoUrl = data.url || null;
    
    // Cache the result
    cache.thumbnails[placeId] = photoUrl;
    
    return photoUrl;
  } catch (error) {
    console.error("Error getting place thumbnail:", error);
    cache.thumbnails[placeId] = null;
    return null;
  }
}

/**
 * Helper function to determine location type from Google Maps type arrays
 * @param types Array of Google Maps place types
 * @returns Simplified location type
 */
function getLocationType(types: string[]): string {
  if (!types || !Array.isArray(types) || types.length === 0) {
    return "location";
  }
  
  if (types.includes("airport")) return "airport";
  if (types.includes("locality") || types.includes("political")) return "city";
  if (types.includes("country")) return "country";
  if (types.includes("point_of_interest")) return "point_of_interest";
  if (types.includes("establishment")) return "establishment";
  
  return "location";
}

/**
 * Clear the location cache or a specific entry
 * @param type Cache type to clear
 * @param key Optional specific key to clear
 */
export function clearLocationCache(
  type: keyof LocationCache = "suggestions",
  key?: string
): void {
  if (key) {
    // Clear specific cache entry
    if (cache[type] && key in cache[type]) {
      delete cache[type][key];
    }
  } else {
    // Clear entire cache type
    cache[type] = {};
  }
}
