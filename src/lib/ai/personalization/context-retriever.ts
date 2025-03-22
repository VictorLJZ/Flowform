import { createClient } from '../../supabase/client';
import { TravelPreferences } from '../../../types/preferences';

export interface UserContext {
  preferences: TravelPreferences;
  recentSearches: Array<{
    type: 'flight' | 'hotel';
    parameters: any;
    timestamp: string;
  }>;
  pastTrips: Array<{
    destination: string;
    dates: {
      start: string;
      end: string;
    };
    type: string;
  }>;
}

/**
 * Retrieve user context for personalization
 */
export async function getUserContext(userId: string): Promise<UserContext | null> {
  if (!userId) return null;
  
  try {
    const supabase = createClient();
    // Get user preferences
    const { data: preferencesData, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('travel_preferences')
      .eq('user_id', userId)
      .single();
      
    if (preferencesError) throw preferencesError;
    
    // Get recent searches (last 5)
    const { data: searchesData, error: searchesError } = await supabase
      .from('user_searches')
      .select('type, parameters, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (searchesError) throw searchesError;
    
    // Get past trips
    const { data: tripsData, error: tripsError } = await supabase
      .from('user_trips')
      .select('destination, start_date, end_date, trip_type')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });
      
    if (tripsError) throw tripsError;
    
    return {
      preferences: preferencesData?.travel_preferences || {},
      recentSearches: searchesData?.map((search: { type: 'flight' | 'hotel'; parameters: any; created_at: string }) => ({
        type: search.type,
        parameters: search.parameters,
        timestamp: search.created_at
      })) || [],
      pastTrips: tripsData?.map((trip: { destination: string; start_date: string; end_date: string; trip_type: string }) => ({
        destination: trip.destination,
        dates: {
          start: trip.start_date,
          end: trip.end_date
        },
        type: trip.trip_type
      })) || []
    };
  } catch (error) {
    console.error('Error retrieving user context:', error);
    return null;
  }
}

/**
 * Format user context for inclusion in AI prompts
 */
export function formatUserContextForAI(context: UserContext): string {
  if (!context) return '';
  
  let formattedContext = '## User Preferences\n\n';
  
  // Format travel preferences
  if (context.preferences) {
    formattedContext += 'Travel Preferences:\n';
    
    if (context.preferences.preferredAirlines?.length) {
      formattedContext += `- Preferred Airlines: ${context.preferences.preferredAirlines.join(', ')}\n`;
    }
    
    if (context.preferences.preferredCabinClass) {
      formattedContext += `- Preferred Cabin Class: ${context.preferences.preferredCabinClass}\n`;
    }
    
    if (context.preferences.budgetPreferences) {
      formattedContext += '- Budget Preferences:\n';
      Object.entries(context.preferences.budgetPreferences).forEach(([key, value]) => {
        formattedContext += `  - ${key}: ${value}\n`;
      });
    }
    
    if (context.preferences.travelInterests?.length) {
      formattedContext += `- Travel Interests: ${context.preferences.travelInterests.join(', ')}\n`;
    }
    
    formattedContext += '\n';
  }
  
  // Format recent searches
  if (context.recentSearches?.length) {
    formattedContext += '## Recent Searches\n\n';
    
    context.recentSearches.forEach(search => {
      const date = new Date(search.timestamp).toLocaleDateString();
      
      if (search.type === 'flight') {
        formattedContext += `- Flight (${date}): ${search.parameters.origin} to ${search.parameters.destination}\n`;
      } else if (search.type === 'hotel') {
        formattedContext += `- Hotel (${date}): ${search.parameters.location} from ${search.parameters.checkIn} to ${search.parameters.checkOut}\n`;
      }
    });
    
    formattedContext += '\n';
  }
  
  // Format past trips
  if (context.pastTrips?.length) {
    formattedContext += '## Past Trips\n\n';
    
    context.pastTrips.forEach(trip => {
      formattedContext += `- ${trip.destination} (${trip.type}): ${trip.dates.start} to ${trip.dates.end}\n`;
    });
  }
  
  return formattedContext;
}
