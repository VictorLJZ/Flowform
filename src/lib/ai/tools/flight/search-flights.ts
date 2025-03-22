import { Tool, ToolDefinition } from '../../../../types/tools';
import { withRetry } from '../../error/retry';

// Flight search tool definition
export const flightSearchToolDefinition: ToolDefinition = {
  type: 'function',
  name: 'search_flights',
  description: 'Search for flights between airports on specific dates',
  parameters: {
    type: 'object',
    properties: {
      origin: {
        type: 'string',
        description: 'Origin airport IATA code (e.g., LAX, JFK)'
      },
      destination: {
        type: 'string',
        description: 'Destination airport IATA code (e.g., LHR, CDG)'
      },
      departureDate: {
        type: 'string',
        description: 'Departure date in YYYY-MM-DD format'
      },
      returnDate: {
        type: 'string',
        description: 'Return date in YYYY-MM-DD format (optional for one-way flights)',
      },
      cabinClass: {
        type: 'string',
        enum: ['economy', 'premium_economy', 'business', 'first'],
        description: 'Preferred cabin class'
      },
      adults: {
        type: 'integer',
        description: 'Number of adult passengers'
      }
    },
    required: ['origin', 'destination', 'departureDate', 'returnDate', 'cabinClass', 'adults'],
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

// Flight search executor implementation
async function searchFlights(args: {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
  adults: number;
}) {
  try {
    // Validate input
    const { origin, destination, departureDate, returnDate, cabinClass, adults } = args;
    
    if (!origin || !destination || !departureDate || !adults) {
      throw new Error('Missing required parameters');
    }
    
    // TODO: Implement actual Duffel API call
    // For now, return mock data
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response
    return {
      success: true,
      searchParams: args,
      results: [
        {
          id: 'off_123456',
          price: {
            amount: 349.99,
            currency: 'USD'
          },
          slices: [
            {
              origin: {
                iata_code: origin,
                name: `${origin} International Airport`
              },
              destination: {
                iata_code: destination,
                name: `${destination} International Airport`
              },
              departure_time: `${departureDate}T08:30:00`,
              arrival_time: `${departureDate}T14:45:00`,
              duration: '06:15',
              segments: [
                {
                  aircraft: {
                    name: 'Boeing 787'
                  },
                  airline: {
                    name: 'United Airlines',
                    iata_code: 'UA'
                  },
                  flight_number: 'UA123',
                  origin: origin,
                  destination: destination,
                  duration: '06:15'
                }
              ]
            },
            // Return slice if return date provided
            ...(returnDate ? [{
              origin: {
                iata_code: destination,
                name: `${destination} International Airport`
              },
              destination: {
                iata_code: origin,
                name: `${origin} International Airport`
              },
              departure_time: `${returnDate}T16:30:00`,
              arrival_time: `${returnDate}T22:45:00`,
              duration: '06:15',
              segments: [
                {
                  aircraft: {
                    name: 'Boeing 787'
                  },
                  airline: {
                    name: 'United Airlines',
                    iata_code: 'UA'
                  },
                  flight_number: 'UA456',
                  origin: destination,
                  destination: origin,
                  duration: '06:15'
                }
              ]
            }] : [])
          ],
          cabin_class: cabinClass || 'economy',
          passengers: {
            adults: adults,
            children: 0,
            infants: 0
          }
        },
        // Add more mock results
        {
          id: 'off_789012',
          price: {
            amount: 499.99,
            currency: 'USD'
          },
          slices: [
            {
              origin: {
                iata_code: origin,
                name: `${origin} International Airport`
              },
              destination: {
                iata_code: destination,
                name: `${destination} International Airport`
              },
              departure_time: `${departureDate}T10:15:00`,
              arrival_time: `${departureDate}T16:30:00`,
              duration: '06:15',
              segments: [
                {
                  aircraft: {
                    name: 'Airbus A350'
                  },
                  airline: {
                    name: 'Delta Air Lines',
                    iata_code: 'DL'
                  },
                  flight_number: 'DL456',
                  origin: origin,
                  destination: destination,
                  duration: '06:15'
                }
              ]
            },
            // Return slice if return date provided
            ...(returnDate ? [{
              origin: {
                iata_code: destination,
                name: `${destination} International Airport`
              },
              destination: {
                iata_code: origin,
                name: `${origin} International Airport`
              },
              departure_time: `${returnDate}T18:15:00`,
              arrival_time: `${returnDate}T00:30:00`,
              duration: '06:15',
              segments: [
                {
                  aircraft: {
                    name: 'Airbus A350'
                  },
                  airline: {
                    name: 'Delta Air Lines',
                    iata_code: 'DL'
                  },
                  flight_number: 'DL789',
                  origin: destination,
                  destination: origin,
                  duration: '06:15'
                }
              ]
            }] : [])
          ],
          cabin_class: cabinClass || 'economy',
          passengers: {
            adults: adults,
            children: 0,
            infants: 0
          }
        }
      ]
    };
  } catch (error) {
    console.error('Error searching flights:', error);
    throw error;
  }
}

// Create the complete tool with retry handling
export const flightSearchTool: Tool = {
  definition: flightSearchToolDefinition,
  executor: async (args) => {
    return withRetry(() => searchFlights(args), flightSearchToolDefinition.retryConfig);
  },
  retryConfig: flightSearchToolDefinition.retryConfig
};
