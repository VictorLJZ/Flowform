import { Tool, ToolDefinition } from '@/types/tools';
import { registerTool } from '../core/tool-registry';

/**
 * Mock weather tool definition
 */
const mockWeatherDefinition: ToolDefinition = {
  type: 'function',
  name: 'get_weather',
  description: 'Get current weather information for a location',
  parameters: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'City name or location to get weather for'
      },
      units: {
        type: 'string',
        enum: ['celsius', 'fahrenheit'],
        description: 'Temperature units (default: celsius)'
      }
    },
    required: ['location', 'units'],
    additionalProperties: false
  },
  strict: true
};

/**
 * Mock weather tool executor
 */
const mockWeatherExecutor = async (args: any) => {
  console.log('✅ MOCK-WEATHER TOOL CALLED:', { args });
  console.time('mock-weather-execution');
  
  // Extract parameters
  const { location, units = 'celsius' } = args;
  
  console.log(`📍 MOCK-WEATHER: Getting weather for ${location} in ${units}`);
  
  // Mock temperature values based on location
  // In a real implementation, this would call a weather API
  const mockData: Record<string, any> = {
    'New York': { temp: 22, conditions: 'Partly Cloudy' },
    'London': { temp: 15, conditions: 'Rainy' },
    'Tokyo': { temp: 28, conditions: 'Sunny' },
    'Paris': { temp: 18, conditions: 'Clear' },
    'Sydney': { temp: 30, conditions: 'Hot' }
  };
  
  // Default weather for unknown locations
  const weatherData = mockData[location] || { 
    temp: Math.floor(Math.random() * 30) + 5, 
    conditions: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 4)] 
  };
  
  // Convert temperature if needed
  if (units === 'fahrenheit') {
    weatherData.temp = Math.round((weatherData.temp * 9/5) + 32);
  }
  
  // Add a small delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Format the response
  const result = {
    location,
    temperature: {
      value: weatherData.temp,
      unit: units === 'celsius' ? '°C' : '°F'
    },
    conditions: weatherData.conditions,
    humidity: Math.floor(Math.random() * 60) + 30,
    timestamp: new Date().toISOString()
  };
  
  console.log('🌤️ MOCK-WEATHER RESULT:', result);
  console.timeEnd('mock-weather-execution');
  
  return result;
};

/**
 * Complete mock weather tool
 */
export const mockWeatherTool: Tool = {
  definition: mockWeatherDefinition,
  executor: mockWeatherExecutor
};

// Register the tool
registerTool(
  mockWeatherDefinition.name,
  mockWeatherDefinition,
  mockWeatherExecutor
);
