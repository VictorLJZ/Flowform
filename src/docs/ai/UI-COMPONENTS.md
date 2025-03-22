# AI UI Components

## Overview

This document details the UI components used to visualize and interact with AI tool calls in the Sword Travel application. These components allow users to view tool results, modify search parameters, and rerun queries with new inputs.

## Component Architecture

Our UI components follow these design principles:

1. **Interactive**: Users can modify parameters and rerun searches
2. **Responsive**: Components adapt to different screen sizes
3. **Accessible**: All components meet WCAG 2.1 AA standards
4. **Consistent**: Components use a unified design language
5. **Performant**: Components render efficiently even with large datasets

We use React 19, TypeScript, Tailwind CSS v4, and ShadCN components for our implementation.

## Tool Card Container

The Tool Card Container is the base component for all tool visualizations:

```tsx
// src/components/tools/ToolCardContainer.tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

export interface ToolCardProps {
  title: string;
  description?: string;
  toolName: string;
  status: 'pending' | 'complete' | 'error';
  timestamp: string;
  children: React.ReactNode;
  onRerun?: () => Promise<void>;
  className?: string;
}

export const ToolCardContainer: React.FC<ToolCardProps> = ({
  title,
  description,
  toolName,
  status,
  timestamp,
  children,
  onRerun,
  className
}) => {
  return (
    <Card className={`w-full shadow-md ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <Badge variant={
          status === 'pending' ? 'secondary' : 
          status === 'complete' ? 'success' : 
          'destructive'
        }>
          {status === 'pending' ? 'Processing' : 
           status === 'complete' ? 'Complete' : 
           'Error'}
        </Badge>
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter className="flex justify-between pt-2 text-xs text-muted-foreground">
        <span>Tool: {toolName}</span>
        <span>{new Date(timestamp).toLocaleString()}</span>
        {onRerun && (
          <Button variant="outline" size="sm" onClick={onRerun} className="ml-auto">
            Rerun
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
```

## Flight Search Card

The Flight Search Card displays flight search results and allows users to modify search parameters:

```tsx
// src/components/tools/FlightSearchCard.tsx
import { useState } from "react";
import { ToolCardContainer, ToolCardProps } from "./ToolCardContainer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DatePicker } from "../ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { executeToolWithRetry } from "../../lib/ai/tool-helpers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { format } from "date-fns";

interface FlightSearchProps extends Omit<ToolCardProps, 'children'> {
  initialParams: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    passengerCount: number;
    cabinClass: string;
  };
  results?: any;
  onUpdate: (newParams: any) => Promise<void>;
}

export const FlightSearchCard: React.FC<FlightSearchProps> = ({
  initialParams,
  results,
  onUpdate,
  ...props
}) => {
  const [searchParams, setSearchParams] = useState(initialParams);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleParamChange = (field: string, value: any) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleRerun = async () => {
    setIsLoading(true);
    try {
      await onUpdate(searchParams);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ToolCardContainer
      {...props}
      onRerun={handleRerun}
    >
      <div className="space-y-4">
        {/* Search Parameters Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium">Origin</label>
            <Input 
              value={searchParams.origin}
              onChange={(e) => handleParamChange('origin', e.target.value)}
              placeholder="Airport code (e.g., JFK)"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Destination</label>
            <Input 
              value={searchParams.destination}
              onChange={(e) => handleParamChange('destination', e.target.value)}
              placeholder="Airport code (e.g., LAX)"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Departure Date</label>
            <DatePicker
              date={searchParams.departureDate ? new Date(searchParams.departureDate) : undefined}
              onSelect={(date) => handleParamChange('departureDate', format(date, 'yyyy-MM-dd'))}
              placeholder="Select departure date"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Return Date</label>
            <DatePicker
              date={searchParams.returnDate ? new Date(searchParams.returnDate) : undefined}
              onSelect={(date) => handleParamChange('returnDate', format(date, 'yyyy-MM-dd'))}
              placeholder="Select return date (optional)"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Passengers</label>
            <Select
              value={searchParams.passengerCount.toString()}
              onValueChange={(value) => handleParamChange('passengerCount', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Number of passengers" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'passenger' : 'passengers'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Cabin Class</label>
            <Select
              value={searchParams.cabinClass}
              onValueChange={(value) => handleParamChange('cabinClass', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cabin class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="economy">Economy</SelectItem>
                <SelectItem value="premium_economy">Premium Economy</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="first">First</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="col-span-full flex justify-end mt-2">
            <Button 
              onClick={handleRerun} 
              disabled={isLoading || props.status === 'pending'}
            >
              {isLoading ? 'Searching...' : 'Update Search'}
            </Button>
          </div>
        </div>
        
        {/* Results Display */}
        {props.status === 'pending' || isLoading ? (
          <div className="p-8 flex justify-center">
            <Spinner size="lg" />
            <span className="ml-2">Searching for flights...</span>
          </div>
        ) : props.status === 'error' ? (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            <p className="font-medium">Error searching for flights</p>
            <p className="text-sm">{results?.error?.message || 'Unknown error'}</p>
          </div>
        ) : results?.offers && results.offers.length > 0 ? (
          <div className="space-y-4">
            <Tabs defaultValue="best">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="best">Best</TabsTrigger>
                <TabsTrigger value="cheapest">Cheapest</TabsTrigger>
                <TabsTrigger value="fastest">Fastest</TabsTrigger>
              </TabsList>
              
              <TabsContent value="best" className="space-y-2">
                {results.offers.slice(0, 5).map((offer: any) => (
                  <FlightOfferCard key={offer.id} offer={offer} />
                ))}
              </TabsContent>
              
              <TabsContent value="cheapest" className="space-y-2">
                {results.offers
                  .slice()
                  .sort((a: any, b: any) => a.price.amount - b.price.amount)
                  .slice(0, 5)
                  .map((offer: any) => (
                    <FlightOfferCard key={offer.id} offer={offer} />
                  ))
                }
              </TabsContent>
              
              <TabsContent value="fastest" className="space-y-2">
                {results.offers
                  .slice()
                  .sort((a: any, b: any) => {
                    const aDuration = a.segments.reduce((sum: number, seg: any) => sum + seg.duration, 0);
                    const bDuration = b.segments.reduce((sum: number, seg: any) => sum + seg.duration, 0);
                    return aDuration - bDuration;
                  })
                  .slice(0, 5)
                  .map((offer: any) => (
                    <FlightOfferCard key={offer.id} offer={offer} />
                  ))
                }
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="p-4 bg-muted/20 rounded-lg text-center">
            <p>No flights found for your search criteria.</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search parameters.</p>
          </div>
        )}
      </div>
    </ToolCardContainer>
  );
};

// Flight offer card subcomponent
const FlightOfferCard: React.FC<{ offer: any }> = ({ offer }) => {
  return (
    <Card className="p-4 hover:bg-accent/10 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src={offer.airline.logoUrl} 
            alt={offer.airline.name} 
            className="w-10 h-10 object-contain"
          />
          <div className="ml-3">
            <p className="font-medium">{offer.airline.name}</p>
            <p className="text-xs text-muted-foreground">
              {offer.segments[0].stops === 0 ? 'Nonstop' : `${offer.segments[0].stops} stop${offer.segments[0].stops > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="font-bold">
            {new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: offer.price.currency 
            }).format(offer.price.amount)}
          </p>
          <p className="text-xs">per passenger</p>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div>
          <p className="text-lg font-semibold">{new Date(offer.segments[0].departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          <p className="text-xs">{offer.segments[0].departureAirport}</p>
        </div>
        
        <div className="flex flex-col items-center justify-center">
          <div className="w-full h-[1px] bg-muted relative">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-background px-2 text-xs">
              {formatDuration(offer.segments[0].duration)}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-lg font-semibold">{new Date(offer.segments[0].arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          <p className="text-xs">{offer.segments[0].arrivalAirport}</p>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button variant="outline" size="sm">Select</Button>
      </div>
    </Card>
  );
};

// Helper function to format duration
function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}
```

## Hotel Search Card

The Hotel Search Card allows users to search for and view hotel options:

```tsx
// src/components/tools/HotelSearchCard.tsx
import { useState } from "react";
import { ToolCardContainer, ToolCardProps } from "./ToolCardContainer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DatePicker } from "../ui/date-picker";
import { Slider } from "../ui/slider";
import { format } from "date-fns";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

interface HotelSearchProps extends Omit<ToolCardProps, 'children'> {
  initialParams: {
    location: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
    priceRange?: {
      min: number;
      max: number;
    };
    amenities?: string[];
  };
  results?: any;
  onUpdate: (newParams: any) => Promise<void>;
}

export const HotelSearchCard: React.FC<HotelSearchProps> = ({
  initialParams,
  results,
  onUpdate,
  ...props
}) => {
  const [searchParams, setSearchParams] = useState(initialParams);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleParamChange = (field: string, value: any) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleAmenityToggle = (amenity: string) => {
    setSearchParams(prev => {
      const currentAmenities = prev.amenities || [];
      const newAmenities = currentAmenities.includes(amenity)
        ? currentAmenities.filter(a => a !== amenity)
        : [...currentAmenities, amenity];
      
      return {
        ...prev,
        amenities: newAmenities
      };
    });
  };
  
  const handleRerun = async () => {
    setIsLoading(true);
    try {
      await onUpdate(searchParams);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Implementation includes search form and results display similar to FlightSearchCard
  
  return (
    <ToolCardContainer
      {...props}
      onRerun={handleRerun}
    >
      {/* Hotel search implementation */}
    </ToolCardContainer>
  );
};
```

## Block Travel Card

For blocking travel time in an itinerary:

```tsx
// src/components/tools/BlockTravelCard.tsx
import { useState } from "react";
import { ToolCardContainer, ToolCardProps } from "./ToolCardContainer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DatePicker } from "../ui/date-picker";
import { Textarea } from "../ui/textarea";
import { format } from "date-fns";
import { TimeInput } from "../ui/time-input";

interface BlockTravelProps extends Omit<ToolCardProps, 'children'> {
  initialParams: {
    origin: string;
    destination: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
  };
  result?: any;
  onUpdate: (newParams: any) => Promise<void>;
}

export const BlockTravelCard: React.FC<BlockTravelProps> = ({
  initialParams,
  result,
  onUpdate,
  ...props
}) => {
  const [blockParams, setBlockParams] = useState(initialParams);
  const [isLoading, setIsLoading] = useState(false);
  
  // Implementation includes form fields for blocking travel time
  
  return (
    <ToolCardContainer
      {...props}
      onRerun={handleRerun}
    >
      {/* Block travel implementation */}
    </ToolCardContainer>
  );
};
```

## Message Components Integration

To integrate tool cards into the chat message flow:

```tsx
// src/components/chat/ChatMessageItem.tsx
import { ChatMessage, ToolCall } from "../../types/chat";
import { Avatar } from "../ui/avatar";
import { Card } from "../ui/card";
import { UserIcon, RobotIcon } from "../ui/icons";
import { Markdown } from "../ui/markdown";
import { FlightSearchCard } from "../tools/FlightSearchCard";
import { HotelSearchCard } from "../tools/HotelSearchCard";
import { BlockTravelCard } from "../tools/BlockTravelCard";
import { executeToolWithRetry } from "../../lib/ai/tool-helpers";
import { useSessionChatStore } from "../../store/session-chat-store";

interface ChatMessageItemProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  isStreaming
}) => {
  const updateToolCall = useSessionChatStore(state => state.updateToolCall);
  
  // Handle tool rerun with new parameters
  const handleToolUpdate = async (toolCallId: string, newParams: any) => {
    try {
      // Update tool call status
      updateToolCall(message.id, toolCallId, {
        status: 'pending',
        arguments: JSON.stringify(newParams)
      });
      
      // Execute tool with new parameters
      const result = await executeToolWithRetry(
        toolCall.name,
        newParams
      );
      
      // Update tool call with result
      updateToolCall(message.id, toolCallId, {
        output: result,
        status: 'complete'
      });
      
      // Continue AI stream with new result
      // Implementation would communicate this back to the AI
      
    } catch (error) {
      console.error('Tool update error:', error);
      updateToolCall(message.id, toolCallId, {
        error: error.message,
        status: 'error'
      });
    }
  };
  
  // Render appropriate tool card component based on tool name
  const renderToolCall = (toolCall: ToolCall) => {
    const commonProps = {
      title: getToolTitle(toolCall.name),
      description: getToolDescription(toolCall.name, toolCall.arguments),
      toolName: toolCall.name,
      status: toolCall.status || 'pending',
      timestamp: message.timestamp
    };
    
    switch (toolCall.name) {
      case 'search_flights':
        return (
          <FlightSearchCard
            {...commonProps}
            initialParams={JSON.parse(toolCall.arguments)}
            results={toolCall.output}
            onUpdate={(newParams) => handleToolUpdate(toolCall.id, newParams)}
          />
        );
        
      case 'search_hotels':
        return (
          <HotelSearchCard
            {...commonProps}
            initialParams={JSON.parse(toolCall.arguments)}
            results={toolCall.output}
            onUpdate={(newParams) => handleToolUpdate(toolCall.id, newParams)}
          />
        );
        
      case 'block_travel_time':
        return (
          <BlockTravelCard
            {...commonProps}
            initialParams={JSON.parse(toolCall.arguments)}
            result={toolCall.output}
            onUpdate={(newParams) => handleToolUpdate(toolCall.id, newParams)}
          />
        );
        
      // Add cases for other tools
        
      default:
        return (
          <Card className="p-4">
            <p className="font-medium">Tool: {toolCall.name}</p>
            <pre className="mt-2 p-2 bg-muted/20 rounded text-sm overflow-auto">
              {JSON.stringify(toolCall.output || {}, null, 2)}
            </pre>
          </Card>
        );
    }
  };
  
  return (
    <div className={`flex gap-3 p-4 ${message.role === 'assistant' ? 'bg-muted/10' : ''}`}>
      {/* Avatar */}
      <Avatar className="h-8 w-8">
        {message.role === 'user' ? <UserIcon /> : <RobotIcon />}
      </Avatar>
      
      {/* Message content */}
      <div className="flex-1 space-y-4">
        {/* User name */}
        <p className="text-sm font-medium">
          {message.role === 'user' 
            ? (message.userDisplayName || 'You') 
            : 'Sword Travel Assistant'}
        </p>
        
        {/* Text content */}
        <Markdown content={message.content} />
        
        {/* Tool calls */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="space-y-4 mt-4">
            {message.toolCalls.map(toolCall => (
              <div key={toolCall.id} className="mt-2">
                {renderToolCall(toolCall)}
              </div>
            ))}
          </div>
        )}
        
        {/* Streaming indicator */}
        {isStreaming && (
          <div className="h-5 flex items-center">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
function getToolTitle(toolName: string): string {
  const titles: Record<string, string> = {
    'search_flights': 'Flight Search',
    'search_hotels': 'Hotel Search',
    'block_travel_time': 'Travel Time Block',
    // Add other tools
  };
  
  return titles[toolName] || toolName;
}

function getToolDescription(toolName: string, argsString: string): string {
  try {
    const args = JSON.parse(argsString);
    
    switch (toolName) {
      case 'search_flights':
        return `${args.origin} to ${args.destination} on ${args.departureDate}`;
      case 'search_hotels':
        return `Hotels in ${args.location} from ${args.checkIn} to ${args.checkOut}`;
      case 'block_travel_time':
        return `${args.origin} to ${args.destination} on ${args.date}`;
      default:
        return '';
    }
  } catch (e) {
    return '';
  }
}
```

## Accessibility Considerations

All interactive components implement these accessibility features:

1. **ARIA Roles**: Proper semantic roles for interactive elements
2. **Keyboard Navigation**: Full keyboard accessibility
3. **Screen Reader Support**: Descriptive labels and announcements
4. **Focus Management**: Visible focus indicators and logical tab order
5. **Color Contrast**: Meeting WCAG AA standards for all text
6. **Reduced Motion**: Respecting user preferences for animations

## Component Testing

Each component includes comprehensive testing:

```tsx
// src/components/tools/__tests__/FlightSearchCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FlightSearchCard } from '../FlightSearchCard';

describe('FlightSearchCard', () => {
  const mockOnUpdate = jest.fn();
  const defaultProps = {
    title: 'Flight Search',
    toolName: 'search_flights',
    status: 'complete' as const,
    timestamp: new Date().toISOString(),
    initialParams: {
      origin: 'JFK',
      destination: 'LAX',
      departureDate: '2025-04-15',
      returnDate: '2025-04-22',
      passengerCount: 1,
      cabinClass: 'economy'
    },
    results: {
      offers: [/* mock offers */]
    },
    onUpdate: mockOnUpdate
  };
  
  it('renders flight search form with initial parameters', () => {
    render(<FlightSearchCard {...defaultProps} />);
    
    expect(screen.getByDisplayValue('JFK')).toBeInTheDocument();
    expect(screen.getByDisplayValue('LAX')).toBeInTheDocument();
    // Check other form fields
  });
  
  it('allows updating search parameters', async () => {
    render(<FlightSearchCard {...defaultProps} />);
    
    // Change origin
    fireEvent.change(screen.getByDisplayValue('JFK'), {
      target: { value: 'SFO' }
    });
    
    // Click update button
    fireEvent.click(screen.getByText('Update Search'));
    
    // Check that onUpdate was called with updated params
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({
        origin: 'SFO',
        destination: 'LAX'
      }));
    });
  });
  
  // Additional tests
});
```
