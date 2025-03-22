// Central export file for all AI tools

// Import tool definitions from specific domains
import { flightSearchTool } from './flight';
import { hotelSearchTool } from './hotel';
import { manageItineraryTool } from './itinerary';
import { mockWeatherTool } from './mock-weather';

// Export individual tools
export {
  flightSearchTool,
  hotelSearchTool,
  manageItineraryTool,
  mockWeatherTool
};

// Export a map of all available tools
export const availableTools = {
  search_flights: flightSearchTool,
  search_hotels: hotelSearchTool,
  manage_itinerary: manageItineraryTool,
  get_weather: mockWeatherTool
};
