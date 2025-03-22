# AI Tool Library

## Overview

The Tool Library provides the AI assistant with a growing set of capabilities through function calling. Each tool follows a consistent pattern for definition, execution, and UI representation, allowing for standardized implementation and extension.

## Tool Structure

Each tool in our library consists of:

```typescript
interface ToolDefinition {
  definition: OpenAITool;    // OpenAI tool schema definition
  executor: ToolExecutor;    // Function to execute the tool
  component: React.FC<any>;  // React component to render results
  retryConfig: RetryConfig;  // Configuration for retry behavior
}
```

## Flight Tools

### Flight Search

```typescript
// src/lib/ai/tools/flight-tools.ts
import { OpenAITool } from '../../../types/chat';
import { ToolDefinition, ToolRegistry } from '../tool-registry';
import { DuffelClient } from '../clients/duffel-client';
import { FlightSearchCard } from '../../../components/tools/FlightSearchCard';

// Tool definition for OpenAI
const flightSearchTool: OpenAITool = {
  type: "function",
  name: "search_flights",
  description: "Search for flights between locations with Duffel API",
  parameters: {
    type: "object",
    properties: {
      origin: { type: "string", description: "Origin airport code" },
      destination: { type: "string", description: "Destination airport code" },
      departureDate: { type: "string", description: "Departure date (YYYY-MM-DD)" },
      returnDate: { type: "string", description: "Return date (YYYY-MM-DD)" },
      passengerCount: { type: "integer", default: 1 },
      cabinClass: { 
        type: "string", 
        enum: ["economy", "premium_economy", "business", "first"],
        default: "economy"
      }
    },
    required: ["origin", "destination", "departureDate"]
  },
  strict: true
};

// Tool executor function
const flightSearchExecutor = async (args: any) => {
  const duffel = new DuffelClient();
  
  try {
    // Create an offer request
    const offerRequest = await duffel.offerRequests.create({
      slices: [
        {
          origin: args.origin,
          destination: args.destination,
          departure_date: args.departureDate
        },
        ...(args.returnDate ? [{
          origin: args.destination,
          destination: args.origin,
          departure_date: args.returnDate
        }] : [])
      ],
      passengers: Array(args.passengerCount || 1).fill({
        type: 'adult'
      }),
      cabin_class: args.cabinClass || 'economy'
    });
    
    // Get offers
    const offers = await duffel.offers.list({
      offer_request_id: offerRequest.data.id,
      limit: 10
    });
    
    // Format results for display
    return {
      success: true,
      offers: offers.data.map(offer => ({
        id: offer.id,
        price: {
          amount: offer.total_amount,
          currency: offer.total_currency
        },
        airline: {
          name: offer.owner.name,
          logoUrl: offer.owner.logo_symbol_url
        },
        segments: offer.slices.map(slice => ({
          departureAirport: slice.origin.iata_code,
          departureCity: slice.origin.city_name,
          departureTime: slice.departing_at,
          arrivalAirport: slice.destination.iata_code,
          arrivalCity: slice.destination.city_name,
          arrivalTime: slice.arriving_at,
          duration: slice.duration,
          stops: slice.segments.length - 1
        }))
      })),
      searchParams: args,
      metadata: {
        currency: offers.data[0]?.total_currency || 'USD',
        totalResults: offers.meta.total
      }
    };
  } catch (error) {
    console.error('Flight search error:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: error.status || 'UNKNOWN_ERROR'
      },
      searchParams: args
    };
  }
};

// Register all flight tools
export function registerFlightTools(registry: ToolRegistry) {
  registry.registerTool('search_flights', {
    definition: flightSearchTool,
    executor: flightSearchExecutor,
    component: FlightSearchCard,
    retryConfig: {
      maxRetries: 1,
      retryDelay: 1000,
      shouldRetry: (error) => error.status !== 400 // Don't retry invalid inputs
    }
  });
  
  // Additional flight tools can be registered here
}
```

## Hotel Tools

### Hotel Search

```typescript
// src/lib/ai/tools/hotel-tools.ts
import { OpenAITool } from '../../../types/chat';
import { ToolDefinition, ToolRegistry } from '../tool-registry';
import { HotelSearchCard } from '../../../components/tools/HotelSearchCard';

// Tool definition for OpenAI
const hotelSearchTool: OpenAITool = {
  type: "function",
  name: "search_hotels",
  description: "Search for hotels in a specific location",
  parameters: {
    type: "object",
    properties: {
      location: { type: "string", description: "City or area to search for hotels" },
      checkIn: { type: "string", description: "Check-in date (YYYY-MM-DD)" },
      checkOut: { type: "string", description: "Check-out date (YYYY-MM-DD)" },
      guests: { type: "integer", default: 2 },
      rooms: { type: "integer", default: 1 },
      priceRange: {
        type: "object",
        properties: {
          min: { type: "number" },
          max: { type: "number" }
        }
      },
      amenities: {
        type: "array",
        items: {
          type: "string",
          enum: ["pool", "spa", "gym", "restaurant", "free_wifi", "parking"]
        }
      }
    },
    required: ["location", "checkIn", "checkOut"]
  },
  strict: true
};

// Tool executor function
const hotelSearchExecutor = async (args: any) => {
  // Hotel search implementation would go here
  // For now, returning mock data
  return {
    success: true,
    hotels: [
      // Mock hotel data
    ],
    searchParams: args
  };
};

// Register all hotel tools
export function registerHotelTools(registry: ToolRegistry) {
  registry.registerTool('search_hotels', {
    definition: hotelSearchTool,
    executor: hotelSearchExecutor,
    component: HotelSearchCard,
    retryConfig: {
      maxRetries: 1,
      retryDelay: 1000,
      shouldRetry: (error) => true // Retry all hotel search errors
    }
  });
  
  // Additional hotel tools can be registered here
}
```

## Itinerary Tools

### Manage Itinerary

```typescript
// src/lib/ai/tools/itinerary-tools.ts
import { OpenAITool } from '../../../types/chat';
import { ToolDefinition, ToolRegistry } from '../tool-registry';
import { useSessionChatStore } from '../../../store/session-chat-store';
import { BlockTravelCard } from '../../../components/tools/BlockTravelCard';
import { AddHotelCard } from '../../../components/tools/AddHotelCard';

// Tool for blocking travel time in an itinerary
const blockTravelTimeTool: OpenAITool = {
  type: "function",
  name: "block_travel_time",
  description: "Block time in the itinerary for travel without specifying exact flights",
  parameters: {
    type: "object",
    properties: {
      origin: { type: "string" },
      destination: { type: "string" },
      date: { type: "string", description: "Date (YYYY-MM-DD)" },
      startTime: { type: "string", description: "Approximate departure time (HH:MM)" },
      endTime: { type: "string", description: "Approximate arrival time (HH:MM)" },
      notes: { type: "string" }
    },
    required: ["origin", "destination", "date", "startTime", "endTime"]
  },
  strict: true
};

// Tool for adding a hotel to an itinerary
const addHotelToItineraryTool: OpenAITool = {
  type: "function",
  name: "add_hotel_to_itinerary",
  description: "Add a hotel stay to the trip itinerary",
  parameters: {
    type: "object",
    properties: {
      hotelName: { type: "string" },
      location: { type: "string" },
      checkIn: { type: "string", description: "Check-in date (YYYY-MM-DD)" },
      checkOut: { type: "string", description: "Check-out date (YYYY-MM-DD)" },
      roomType: { type: "string" },
      price: { type: "number" },
      confirmationNumber: { type: "string" }
    },
    required: ["hotelName", "location", "checkIn", "checkOut"]
  },
  strict: true
};

// Executor for block_travel_time
const blockTravelTimeExecutor = async (args: any) => {
  const store = useSessionChatStore.getState();
  const sessionId = store.currentSessionId;
  
  if (!sessionId) {
    return {
      success: false,
      error: {
        message: "No active session",
        code: "NO_SESSION"
      }
    };
  }
  
  try {
    // Create a unique ID for this itinerary item
    const itemId = generateUniqueId();
    
    // Format the travel block
    const travelBlock = {
      id: itemId,
      type: 'travel',
      origin: args.origin,
      destination: args.destination,
      date: args.date,
      startTime: args.startTime,
      endTime: args.endTime,
      notes: args.notes,
      createdAt: new Date().toISOString()
    };
    
    // Update Zustand state (optimistic update)
    store.updateItinerary(sessionId, itinerary => ({
      ...itinerary,
      items: [...(itinerary?.items || []), travelBlock]
    }));
    
    // Sync to Supabase
    await store.syncItineraryToSupabase(sessionId);
    
    return {
      success: true,
      item: travelBlock
    };
  } catch (error) {
    console.error('Block travel time error:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: 'ITINERARY_UPDATE_ERROR'
      }
    };
  }
};

// Register all itinerary tools
export function registerItineraryTools(registry: ToolRegistry) {
  registry.registerTool('block_travel_time', {
    definition: blockTravelTimeTool,
    executor: blockTravelTimeExecutor,
    component: BlockTravelCard,
    retryConfig: {
      maxRetries: 1,
      retryDelay: 500,
      shouldRetry: (error) => true
    }
  });
  
  // Register other itinerary tools
  // ...
}
```

## User Preference Tools

These tools allow the AI to access and update user preferences:

```typescript
// src/lib/ai/tools/user-preference-tools.ts
import { OpenAITool } from '../../../types/chat';
import { ToolDefinition, ToolRegistry } from '../tool-registry';
import { useSessionChatStore } from '../../../store/session-chat-store';
import { supabase } from '../../../lib/supabase';

// Tool to get user preferences
const getUserPreferencesTool: OpenAITool = {
  type: "function",
  name: "get_user_preferences",
  description: "Get the current user's travel preferences",
  parameters: {
    type: "object",
    properties: {
      categories: {
        type: "array",
        items: {
          type: "string",
          enum: ["airlines", "hotels", "activities", "budget", "accessibility", "all"]
        },
        default: ["all"]
      }
    }
  },
  strict: true
};

// Tool to update user preferences
const updateUserPreferencesTool: OpenAITool = {
  type: "function",
  name: "update_user_preferences",
  description: "Update the current user's travel preferences",
  parameters: {
    type: "object",
    properties: {
      preferredAirlines: {
        type: "array",
        items: { type: "string" }
      },
      preferredCabinClass: {
        type: "string",
        enum: ["economy", "premium_economy", "business", "first"]
      },
      preferredHotelChains: {
        type: "array",
        items: { type: "string" }
      },
      dietaryRestrictions: {
        type: "array",
        items: { type: "string" }
      },
      accessibilityNeeds: {
        type: "array",
        items: { type: "string" }
      },
      budgetPreferences: {
        type: "object",
        properties: {
          flights: { type: "string", enum: ["economy", "moderate", "premium", "luxury"] },
          accommodations: { type: "string", enum: ["budget", "moderate", "upscale", "luxury"] },
          activities: { type: "string", enum: ["free", "budget", "moderate", "premium"] }
        }
      },
      travelInterests: {
        type: "array",
        items: { type: "string" }
      }
    }
  },
  strict: true
};

// Executor for get_user_preferences
const getUserPreferencesExecutor = async (args: any) => {
  const store = useSessionChatStore.getState();
  const userId = store.currentUser?.id;
  
  if (!userId) {
    return {
      success: false,
      error: {
        message: "No authenticated user",
        code: "NO_USER"
      }
    };
  }
  
  try {
    // Fetch user preferences from Supabase
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) throw error;
    
    // Filter preferences by requested categories
    const showAll = args.categories.includes('all');
    const preferences = data?.travel_preferences || {};
    
    const filteredPreferences = showAll ? preferences : Object.fromEntries(
      Object.entries(preferences).filter(([key]) => {
        if (args.categories.includes('airlines') && ['preferredAirlines', 'preferredCabinClass'].includes(key)) return true;
        if (args.categories.includes('hotels') && ['preferredHotelChains'].includes(key)) return true;
        if (args.categories.includes('activities') && ['travelInterests'].includes(key)) return true;
        if (args.categories.includes('budget') && ['budgetPreferences'].includes(key)) return true;
        if (args.categories.includes('accessibility') && ['accessibilityNeeds', 'dietaryRestrictions'].includes(key)) return true;
        return false;
      })
    );
    
    return {
      success: true,
      preferences: filteredPreferences
    };
  } catch (error) {
    console.error('Get user preferences error:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: 'PREFERENCE_FETCH_ERROR'
      }
    };
  }
};

// Register all user preference tools
export function registerUserPreferenceTools(registry: ToolRegistry) {
  registry.registerTool('get_user_preferences', {
    definition: getUserPreferencesTool,
    executor: getUserPreferencesExecutor,
    component: null, // No UI needed for this tool
    retryConfig: {
      maxRetries: 1,
      retryDelay: 500,
      shouldRetry: (error) => true
    }
  });
  
  // Register other preference tools
  // ...
}
```

## Maps and Location Tools

```typescript
// src/lib/ai/tools/location-tools.ts
import { OpenAITool } from '../../../types/chat';
import { ToolDefinition, ToolRegistry } from '../tool-registry';
import { MapDisplayCard } from '../../../components/tools/MapDisplayCard';

// Tool to display a map
const displayMapTool: OpenAITool = {
  type: "function",
  name: "display_map",
  description: "Display a map of a location or route",
  parameters: {
    type: "object",
    properties: {
      location: { type: "string" },
      zoom: { type: "integer", default: 12 },
      mapType: { 
        type: "string", 
        enum: ["roadmap", "satellite", "hybrid", "terrain"],
        default: "roadmap"
      },
      markers: {
        type: "array",
        items: {
          type: "object",
          properties: {
            position: { type: "string" },
            label: { type: "string" }
          },
          required: ["position"]
        }
      },
      route: {
        type: "object",
        properties: {
          origin: { type: "string" },
          destination: { type: "string" },
          waypoints: {
            type: "array",
            items: { type: "string" }
          },
          travelMode: {
            type: "string",
            enum: ["driving", "walking", "bicycling", "transit"],
            default: "driving"
          }
        },
        required: ["origin", "destination"]
      }
    },
    required: ["location"]
  },
  strict: true
};

// Executor for display_map
const displayMapExecutor = async (args: any) => {
  try {
    // Format data for map display
    return {
      success: true,
      mapData: {
        center: args.location,
        zoom: args.zoom || 12,
        mapType: args.mapType || "roadmap",
        markers: args.markers || [],
        route: args.route || null
      }
    };
  } catch (error) {
    console.error('Display map error:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: 'MAP_DISPLAY_ERROR'
      }
    };
  }
};

// Register all location tools
export function registerLocationTools(registry: ToolRegistry) {
  registry.registerTool('display_map', {
    definition: displayMapTool,
    executor: displayMapExecutor,
    component: MapDisplayCard,
    retryConfig: {
      maxRetries: 1,
      retryDelay: 500,
      shouldRetry: (error) => true
    }
  });
  
  // Register other location tools
  // ...
}
```

## Tool Execution Helpers

```typescript
// src/lib/ai/tool-helpers.ts
import { toolRegistry, ToolDefinition } from './tool-registry';

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  shouldRetry?: (error: any) => boolean;
}

// Execute a tool with retry logic
export async function executeToolWithRetry(
  toolName: string,
  args: any,
  options?: RetryOptions
): Promise<any> {
  const tool = toolRegistry.getTool(toolName);
  
  if (!tool) {
    throw new Error(`Tool not found: ${toolName}`);
  }
  
  const retryConfig = {
    maxRetries: options?.maxRetries ?? tool.retryConfig.maxRetries,
    retryDelay: options?.retryDelay ?? tool.retryConfig.retryDelay,
    shouldRetry: options?.shouldRetry ?? tool.retryConfig.shouldRetry
  };
  
  let attempts = 0;
  let lastError: any;
  
  while (attempts <= retryConfig.maxRetries) {
    try {
      attempts++;
      return await tool.executor(args);
    } catch (error) {
      lastError = error;
      console.warn(`Tool execution failed (attempt ${attempts}/${retryConfig.maxRetries + 1}):`, error);
      
      // Don't retry if shouldRetry returns false
      if (!retryConfig.shouldRetry(error)) {
        throw error;
      }
      
      // Don't wait after the last attempt
      if (attempts <= retryConfig.maxRetries) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryConfig.retryDelay));
      }
    }
  }
  
  // All attempts failed
  throw lastError;
}

// Execute multiple tools in parallel when possible
export async function executeToolsInParallel(
  toolCalls: Array<{ name: string, args: any }>
): Promise<Array<{ result: any, error?: any }>> {
  return Promise.all(
    toolCalls.map(async ({ name, args }) => {
      try {
        const result = await executeToolWithRetry(name, args);
        return { result };
      } catch (error) {
        return { result: null, error };
      }
    })
  );
}
```

## Tools Registry Initialization

```typescript
// src/lib/ai/initialize.ts
import { toolRegistry } from './tool-registry';
import { registerFlightTools } from './tools/flight-tools';
import { registerHotelTools } from './tools/hotel-tools';
import { registerItineraryTools } from './tools/itinerary-tools';
import { registerUserPreferenceTools } from './tools/user-preference-tools';
import { registerLocationTools } from './tools/location-tools';

export function initializeAI() {
  // Register all tool categories
  registerFlightTools(toolRegistry);
  registerHotelTools(toolRegistry);
  registerItineraryTools(toolRegistry);
  registerUserPreferenceTools(toolRegistry);
  registerLocationTools(toolRegistry);
  
  console.log(`AI initialized with ${Object.keys(toolRegistry.getAllDefinitions()).length} tools`);
  
  return {
    toolRegistry
  };
}
```

## Extending the Tool Library

To add new tools to the library:

1. Create a new tool definition file in `src/lib/ai/tools/`
2. Define the OpenAI tool schema
3. Implement the executor function
4. Create a React component for visualization
5. Register the tool with the registry

Example of adding a new tool category:

```typescript
// src/lib/ai/tools/weather-tools.ts
import { OpenAITool } from '../../../types/chat';
import { ToolDefinition, ToolRegistry } from '../tool-registry';
import { WeatherDisplayCard } from '../../../components/tools/WeatherDisplayCard';

const getWeatherTool: OpenAITool = {
  type: "function",
  name: "get_weather",
  description: "Get weather forecast for a location",
  parameters: {
    type: "object",
    properties: {
      location: { type: "string" },
      date: { type: "string", description: "Date (YYYY-MM-DD)" }
    },
    required: ["location"]
  },
  strict: true
};

const getWeatherExecutor = async (args: any) => {
  // Weather API implementation
};

export function registerWeatherTools(registry: ToolRegistry) {
  registry.registerTool('get_weather', {
    definition: getWeatherTool,
    executor: getWeatherExecutor,
    component: WeatherDisplayCard,
    retryConfig: {
      maxRetries: 1,
      retryDelay: 1000,
      shouldRetry: (error) => true
    }
  });
}

// Add to initialization
// In initialize.ts:
// import { registerWeatherTools } from './tools/weather-tools';
// registerWeatherTools(toolRegistry);
```
