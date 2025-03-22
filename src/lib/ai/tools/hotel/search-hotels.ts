import { Tool, ToolDefinition } from '../../../../types/tools';
import { withRetry } from '../../error/retry';

// Hotel search tool definition
export const hotelSearchToolDefinition: ToolDefinition = {
  type: 'function',
  name: 'search_hotels',
  description: 'Search for hotels in a specific location for given dates',
  parameters: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'Location name or coordinates (e.g., "New York" or "40.7128,-74.0060")'
      },
      checkIn: {
        type: 'string',
        description: 'Check-in date in YYYY-MM-DD format'
      },
      checkOut: {
        type: 'string',
        description: 'Check-out date in YYYY-MM-DD format'
      },
      guests: {
        type: 'integer',
        description: 'Number of guests'
      },
      rooms: {
        type: 'integer',
        description: 'Number of rooms'
      },
      minPrice: {
        type: 'number',
        description: 'Minimum price per night (optional)'
      },
      maxPrice: {
        type: 'number',
        description: 'Maximum price per night (optional)'
      },
      amenities: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['pool', 'spa', 'gym', 'restaurant', 'wifi', 'parking', 'pet_friendly']
        },
        description: 'Desired amenities (optional)'
      }
    },
    required: ['location', 'checkIn', 'checkOut', 'guests', 'rooms', 'minPrice', 'maxPrice', 'amenities'],
    additionalProperties: false
  },
  strict: true,
  retryConfig: {
    maxRetries: 2,
    initialDelay: 500,
    shouldRetry: (error) => {
      return error.status !== 400; // Don't retry user input errors
    }
  }
};

// Hotel search executor implementation
async function searchHotels(args: {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
}) {
  try {
    // Validate input
    const { location, checkIn, checkOut, guests } = args;
    
    if (!location || !checkIn || !checkOut || !guests) {
      throw new Error('Missing required parameters');
    }
    
    // TODO: Implement actual hotel API call
    // For now, return mock data
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response
    return {
      success: true,
      searchParams: args,
      results: [
        {
          id: 'hotel_123456',
          name: 'Grand Hotel',
          location: {
            address: '123 Main Street',
            city: location.split(',')[0],
            country: 'United States',
            coordinates: {
              latitude: 40.7128,
              longitude: -74.0060
            }
          },
          price: {
            amount: 199.99,
            currency: 'USD',
            period: 'per_night'
          },
          rating: 4.5,
          reviews: 1245,
          images: [
            'https://example.com/hotel1_1.jpg',
            'https://example.com/hotel1_2.jpg'
          ],
          description: 'A luxurious hotel in the heart of the city with modern amenities and exceptional service.',
          amenities: ['pool', 'spa', 'gym', 'restaurant', 'wifi', 'parking'],
          rooms_available: 5,
          check_in: checkIn,
          check_out: checkOut
        },
        {
          id: 'hotel_789012',
          name: 'Boutique Inn',
          location: {
            address: '456 Park Avenue',
            city: location.split(',')[0],
            country: 'United States',
            coordinates: {
              latitude: 40.7214,
              longitude: -74.0052
            }
          },
          price: {
            amount: 149.99,
            currency: 'USD',
            period: 'per_night'
          },
          rating: 4.2,
          reviews: 856,
          images: [
            'https://example.com/hotel2_1.jpg',
            'https://example.com/hotel2_2.jpg'
          ],
          description: 'A charming boutique hotel with unique character and personalized service.',
          amenities: ['wifi', 'restaurant', 'parking', 'pet_friendly'],
          rooms_available: 3,
          check_in: checkIn,
          check_out: checkOut
        },
        {
          id: 'hotel_345678',
          name: 'Luxury Resort & Spa',
          location: {
            address: '789 Beach Drive',
            city: location.split(',')[0],
            country: 'United States',
            coordinates: {
              latitude: 40.7305,
              longitude: -74.0123
            }
          },
          price: {
            amount: 349.99,
            currency: 'USD',
            period: 'per_night'
          },
          rating: 4.8,
          reviews: 2034,
          images: [
            'https://example.com/hotel3_1.jpg',
            'https://example.com/hotel3_2.jpg'
          ],
          description: 'An exclusive luxury resort featuring world-class spa facilities and fine dining options.',
          amenities: ['pool', 'spa', 'gym', 'restaurant', 'wifi', 'parking', 'pet_friendly'],
          rooms_available: 2,
          check_in: checkIn,
          check_out: checkOut
        }
      ]
    };
  } catch (error) {
    console.error('Error searching hotels:', error);
    throw error;
  }
}

// Create the complete tool with retry handling
export const hotelSearchTool: Tool = {
  definition: hotelSearchToolDefinition,
  executor: async (args) => {
    return withRetry(() => searchHotels(args), hotelSearchToolDefinition.retryConfig);
  },
  retryConfig: hotelSearchToolDefinition.retryConfig
};
