import { Tool, ToolDefinition } from '../../../../types/tools';
import { withRetry } from '../../error/retry';
import { supabase } from '../../../../lib/supabase';

// Itinerary management tool definition
export const manageItineraryToolDefinition: ToolDefinition = {
  type: 'function',
  name: 'manage_itinerary',
  description: 'Create, retrieve, update, or delete items in a travel itinerary',
  parameters: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['create', 'get', 'update', 'delete'],
        description: 'The action to perform on the itinerary'
      },
      userId: {
        type: 'string',
        description: 'The ID of the user who owns the itinerary'
      },
      itineraryId: {
        type: 'string',
        description: 'The ID of the itinerary (required for get, update, delete)'
      },
      itineraryName: {
        type: 'string',
        description: 'The name of the itinerary (required for create)'
      },
      tripDates: {
        type: 'object',
        properties: {
          startDate: {
            type: 'string',
            description: 'Start date in YYYY-MM-DD format'
          },
          endDate: {
            type: 'string',
            description: 'End date in YYYY-MM-DD format'
          }
        },
        required: ['startDate', 'endDate'],
        additionalProperties: false,
        description: 'Date range for the trip (required for create)'
      },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID of the itinerary item (required for update, delete)'
            },
            type: {
              type: 'string',
              enum: ['flight', 'hotel', 'activity', 'transportation', 'note'],
              description: 'Type of itinerary item'
            },
            title: {
              type: 'string',
              description: 'Title of the itinerary item'
            },
            description: {
              type: 'string',
              description: 'Description of the itinerary item'
            },
            startDateTime: {
              type: 'string',
              description: 'Start date and time in ISO 8601 format'
            },
            endDateTime: {
              type: 'string',
              description: 'End date and time in ISO 8601 format'
            },
            location: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                address: { type: 'string' },
                coordinates: {
                  type: 'object',
                  properties: {
                    latitude: { type: 'number' },
                    longitude: { type: 'number' }
                  },
                  required: ['latitude', 'longitude'],
                  additionalProperties: false
                }
              },
              required: ['name', 'address', 'coordinates'],
              additionalProperties: false,
              description: 'Location information for the itinerary item'
            },
            details: {
              type: 'object',
              properties: {
                // Include some common properties for different types
                confirmationCode: { type: 'string' },
                price: { type: 'number' },
                provider: { type: 'string' },
                notes: { type: 'string' }
              },
              required: ['confirmationCode', 'price', 'provider', 'notes'],
              additionalProperties: false,
              description: 'Additional details specific to the item type'
            }
          },
          required: ['id', 'type', 'title', 'description', 'startDateTime', 'endDateTime', 'location', 'details'],
          additionalProperties: false
        },
        description: 'Itinerary items to create or update'
      }
    },
    required: ['action', 'userId', 'itineraryId', 'itineraryName', 'tripDates', 'items'],
    additionalProperties: false
  },
  strict: true,
  retryConfig: {
    maxRetries: 2,
    initialDelay: 300,
    shouldRetry: (error) => {
      return error.status !== 400; // Don't retry user input errors
    }
  }
};

// Itinerary management executor implementation
async function manageItinerary(args: {
  action: 'create' | 'get' | 'update' | 'delete';
  userId: string;
  itineraryId?: string;
  itineraryName?: string;
  tripDates?: {
    startDate: string;
    endDate: string;
  };
  items?: Array<{
    id?: string;
    type: 'flight' | 'hotel' | 'activity' | 'transportation' | 'note';
    title: string;
    description?: string;
    startDateTime?: string;
    endDateTime?: string;
    location?: {
      name?: string;
      address?: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    details?: Record<string, any>;
  }>;
}) {
  try {
    const { action, userId } = args;
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    switch (action) {
      case 'create':
        return await createItinerary(args);
        
      case 'get':
        return await getItinerary(args);
        
      case 'update':
        return await updateItinerary(args);
        
      case 'delete':
        return await deleteItinerary(args);
        
      default:
        throw new Error(`Invalid action: ${action}`);
    }
  } catch (error) {
    console.error('Error managing itinerary:', error);
    throw error;
  }
}

// Create a new itinerary
async function createItinerary(args: any) {
  const { userId, itineraryName, tripDates, items } = args;
  
  if (!itineraryName || !tripDates) {
    throw new Error('Itinerary name and trip dates are required for creation');
  }
  
  // Create the itinerary record
  const { data: itinerary, error: itineraryError } = await supabase
    .from('itineraries')
    .insert({
      user_id: userId,
      name: itineraryName,
      start_date: tripDates.startDate,
      end_date: tripDates.endDate,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (itineraryError) {
    throw itineraryError;
  }
  
  // Create itinerary items if provided
  if (items && items.length > 0) {
    const itemsToInsert = items.map((item: {
      type: string;
      title: string;
      description: string;
      startDateTime: string;
      endDateTime: string;
      location: string;
      details?: any;
    }) => ({
      itinerary_id: itinerary.id,
      type: item.type,
      title: item.title,
      description: item.description,
      start_date_time: item.startDateTime,
      end_date_time: item.endDateTime,
      location: item.location,
      details: item.details,
      created_at: new Date().toISOString()
    }));
    
    const { error: itemsError } = await supabase
      .from('itinerary_items')
      .insert(itemsToInsert);
      
    if (itemsError) {
      throw itemsError;
    }
  }
  
  // Return the created itinerary
  return {
    success: true,
    itinerary: {
      id: itinerary.id,
      name: itinerary.name,
      tripDates: {
        startDate: itinerary.start_date,
        endDate: itinerary.end_date
      },
      createdAt: itinerary.created_at
    }
  };
}

// Get an existing itinerary
async function getItinerary(args: any) {
  const { userId, itineraryId } = args;
  
  if (!itineraryId) {
    throw new Error('Itinerary ID is required for retrieval');
  }
  
  // Get the itinerary
  const { data: itinerary, error: itineraryError } = await supabase
    .from('itineraries')
    .select('*')
    .eq('id', itineraryId)
    .eq('user_id', userId)
    .single();
    
  if (itineraryError) {
    throw itineraryError;
  }
  
  // Get itinerary items
  const { data: items, error: itemsError } = await supabase
    .from('itinerary_items')
    .select('*')
    .eq('itinerary_id', itineraryId)
    .order('start_date_time', { ascending: true });
    
  if (itemsError) {
    throw itemsError;
  }
  
  // Format the response
  return {
    success: true,
    itinerary: {
      id: itinerary.id,
      name: itinerary.name,
      tripDates: {
        startDate: itinerary.start_date,
        endDate: itinerary.end_date
      },
      createdAt: itinerary.created_at,
      updatedAt: itinerary.updated_at,
      items: items.map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        startDateTime: item.start_date_time,
        endDateTime: item.end_date_time,
        location: item.location,
        details: item.details
      }))
    }
  };
}

// Update an existing itinerary
async function updateItinerary(args: any) {
  const { userId, itineraryId, itineraryName, tripDates, items } = args;
  
  if (!itineraryId) {
    throw new Error('Itinerary ID is required for update');
  }
  
  // Update the itinerary record if needed
  if (itineraryName || tripDates) {
    const updates: any = {
      updated_at: new Date().toISOString()
    };
    
    if (itineraryName) updates.name = itineraryName;
    if (tripDates?.startDate) updates.start_date = tripDates.startDate;
    if (tripDates?.endDate) updates.end_date = tripDates.endDate;
    
    const { error: updateError } = await supabase
      .from('itineraries')
      .update(updates)
      .eq('id', itineraryId)
      .eq('user_id', userId);
      
    if (updateError) {
      throw updateError;
    }
  }
  
  // Update or add items if provided
  if (items && items.length > 0) {
    for (const item of items as any[]) {
      if (item.id) {
        // Update existing item
        const { error: updateItemError } = await supabase
          .from('itinerary_items')
          .update({
            type: item.type,
            title: item.title,
            description: item.description,
            start_date_time: item.startDateTime,
            end_date_time: item.endDateTime,
            location: item.location,
            details: item.details,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id)
          .eq('itinerary_id', itineraryId);
          
        if (updateItemError) {
          throw updateItemError;
        }
      } else {
        // Add new item
        const { error: insertItemError } = await supabase
          .from('itinerary_items')
          .insert({
            itinerary_id: itineraryId,
            type: item.type,
            title: item.title,
            description: item.description,
            start_date_time: item.startDateTime,
            end_date_time: item.endDateTime,
            location: item.location,
            details: item.details,
            created_at: new Date().toISOString()
          });
          
        if (insertItemError) {
          throw insertItemError;
        }
      }
    }
  }
  
  return {
    success: true,
    message: 'Itinerary updated successfully'
  };
}

// Delete an itinerary or specific items
async function deleteItinerary(args: any) {
  const { userId, itineraryId, items } = args;
  
  if (!itineraryId) {
    throw new Error('Itinerary ID is required for deletion');
  }
  
  if (items && items.length > 0) {
    // Delete specific items
    const itemIds = items
      .filter((item: any) => item.id)
      .map((item: any) => item.id);
      
    if (itemIds.length > 0) {
      const { error: deleteItemsError } = await supabase
        .from('itinerary_items')
        .delete()
        .in('id', itemIds)
        .eq('itinerary_id', itineraryId);
        
      if (deleteItemsError) {
        throw deleteItemsError;
      }
    }
    
    return {
      success: true,
      message: `${itemIds.length} itinerary items deleted`
    };
  } else {
    // Delete the entire itinerary
    // First delete all items
    const { error: deleteItemsError } = await supabase
      .from('itinerary_items')
      .delete()
      .eq('itinerary_id', itineraryId);
      
    if (deleteItemsError) {
      throw deleteItemsError;
    }
    
    // Then delete the itinerary
    const { error: deleteItineraryError } = await supabase
      .from('itineraries')
      .delete()
      .eq('id', itineraryId)
      .eq('user_id', userId);
      
    if (deleteItineraryError) {
      throw deleteItineraryError;
    }
    
    return {
      success: true,
      message: 'Itinerary deleted successfully'
    };
  }
}

// Create the complete tool with retry handling
export const manageItineraryTool: Tool = {
  definition: manageItineraryToolDefinition,
  executor: async (args) => {
    return withRetry(() => manageItinerary(args), manageItineraryToolDefinition.retryConfig);
  },
  retryConfig: manageItineraryToolDefinition.retryConfig
};
