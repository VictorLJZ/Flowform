# Sword Travel Database Schema

This document outlines the database schema for the Sword Travel application, built on Supabase.

## Overview

The database schema is designed to support:
- Travel session management
- Collaborative features through real-time updates
- Chat history with vector embeddings for RAG
- Map integration with markers and POIs
- Itinerary management with calendar blocks

## Extensions

```sql
-- Vector support for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- PostGIS for spatial data (recommended for map features)
CREATE EXTENSION IF NOT EXISTS postgis;
```

## Tables

### travel_sessions

Main table for travel planning sessions.

```sql
CREATE TABLE travel_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  origin_data JSONB DEFAULT '{"name":"","type":"","placeId":"","fullName":"","photoUrl":null,"coordinates":{"lat":0,"lng":0}}',
  destination_data JSONB DEFAULT '{"name":"","type":"","placeId":"","fullName":"","photoUrl":null,"coordinates":{"lat":0,"lng":0}}',
  travelers_data JSONB DEFAULT '{"pets":0,"adults":1,"infants":0,"children":0}',
  dates_data JSONB DEFAULT '{"end":"","range":"0","start":""}', -- Dates stored in ISO 8601 format (YYYY-MM-DD)
  budget_data JSONB DEFAULT '{"level":"any"}'
);

CREATE INDEX idx_travel_sessions_owner_id ON travel_sessions(owner_id);
CREATE INDEX idx_travel_sessions_status ON travel_sessions(status);
```

### session_participants

Tracks users who have access to a session.

```sql
CREATE TABLE session_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES travel_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('owner', 'participant')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

CREATE INDEX idx_session_participants_session_id ON session_participants(session_id);
CREATE INDEX idx_session_participants_user_id ON session_participants(user_id);
```

### chat_messages

Stores chat messages with vector embeddings for RAG and support for structured AI responses.

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES travel_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_display_name TEXT,
  embedding vector(1536),  -- Dimension size for OpenAI embeddings
  tool_calls JSONB,        -- Structured storage for tool calls from OpenAI
  segments JSONB,          -- For storing message segments with metadata
  processing_metadata JSONB -- Additional metadata for processing
);

CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX idx_chat_messages_embedding ON chat_messages USING ivfflat (embedding vector_cosine_ops);
```

### map_markers

Locations for the map component with PostGIS geometry support.

```sql
CREATE TABLE map_markers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES travel_sessions(id) ON DELETE CASCADE,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  details JSONB,
  linked_to_event BOOLEAN DEFAULT FALSE,
  created_by_ai BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  geom GEOMETRY(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)) STORED
);

CREATE INDEX idx_map_markers_session_id ON map_markers(session_id);
CREATE INDEX idx_map_markers_geom ON map_markers USING GIST (geom);
```

### itineraries

Daily itinerary containers.

```sql
CREATE TABLE itineraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES travel_sessions(id) ON DELETE CASCADE,
  day_date DATE NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, day_date)
);

CREATE INDEX idx_itineraries_session_id ON itineraries(session_id);
```

### itinerary_blocks

Individual events on the itinerary.

```sql
CREATE TABLE itinerary_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  itinerary_id UUID NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES travel_sessions(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location_id UUID REFERENCES map_markers(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  details JSONB,
  created_by_ai BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_itinerary_blocks_itinerary_id ON itinerary_blocks(itinerary_id);
CREATE INDEX idx_itinerary_blocks_session_id ON itinerary_blocks(session_id);
CREATE INDEX idx_itinerary_blocks_start_time ON itinerary_blocks(start_time);
```

## Row Level Security (RLS) Policies

```sql
-- Allow users to view their own sessions
CREATE POLICY "Users can view their own sessions"
  ON travel_sessions
  FOR SELECT
  USING (owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM session_participants
    WHERE session_id = travel_sessions.id AND user_id = auth.uid()
  ));

-- Allow users to insert their own sessions
CREATE POLICY "Users can create their own sessions"
  ON travel_sessions
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Allow owners to update their own sessions
CREATE POLICY "Owners can update their own sessions"
  ON travel_sessions
  FOR UPDATE
  USING (owner_id = auth.uid());

-- Similar policies should be created for all tables
```

## Realtime Publication

```sql
BEGIN;
  -- Drop the publication if it exists
  DROP PUBLICATION IF EXISTS supabase_realtime;
  
  -- Create a new publication for tables we want to sync in realtime
  CREATE PUBLICATION supabase_realtime FOR TABLE 
    travel_sessions,
    session_participants,
    chat_messages,
    map_markers,
    itineraries,
    itinerary_blocks;
COMMIT;
```

## Automatic Timestamp Updates

```sql
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_travel_sessions_timestamp
BEFORE UPDATE ON travel_sessions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Similar triggers for other tables with updated_at columns
```

## Notes on Spatial Data

For map features and location-based searches, we're using:

1. **PostGIS Extension**: Provides spatial data capabilities
2. **Generated Geometry Column**: Automatically creates a proper geometry point from latitude/longitude
3. **Spatial Indexing**: For efficient spatial queries

The `spatial_ref_sys` table is automatically created when you enable the PostGIS extension. You don't need to create it manually.

## Notes on Tool Calls and Segments

For storing AI responses with tool calls and structured data:

1. **tool_calls JSONB column**: Stores the structured tool call data from OpenAI Responses API
2. **segments JSONB column**: Stores message segments with their metadata
3. **processing_metadata JSONB column**: For any additional metadata needed

Using JSONB allows for flexible storage of nested structures while maintaining query capabilities. This approach is preferable to creating separate tables for tool calls because:

- It keeps related data together
- Simplifies retrieval of complete messages
- Allows for evolving structures without schema changes
- Supports filtering and indexing on JSONB properties if needed

## Schema Evolution Strategy

When modifying the schema:

1. Document changes in this file
2. Use migrations for schema updates
3. Update TypeScript types to reflect schema changes
4. Consider backward compatibility

## JSONB Structure Documentation

### travel_sessions JSONB Fields

#### origin_data and destination_data
Stores location information with the following structure:
```json
{
  "name": "",          // Location name
  "type": "",          // Location type (city, country, etc.)
  "placeId": "",      // Google Maps Place ID
  "fullName": "",     // Full location name
  "photoUrl": null,    // URL to location photo
  "coordinates": {     // Geo coordinates
    "lat": 0,
    "lng": 0
  }
}
```

#### travelers_data
Stores traveler information with the following structure:
```json
{
  "pets": 0,           // Number of pets
  "adults": 1,         // Number of adults
  "infants": 0,        // Number of infants
  "children": 0        // Number of children
}
```

#### dates_data
Stores trip date information with the following structure:
```json
{
  "end": "",          // End date (MMDDYYYY format)
  "range": "0",       // Date flexibility range
  "start": ""         // Start date (MMDDYYYY format)
}
```

#### budget_data
Stores budget preference information with the following structure:
```json
{
  "level": "any"      // Budget level: "any", "budget", "moderate", "high-end", or "luxury"
}
```

## Index Optimization

Indexes have been created for common query patterns:
- Foreign key references
- Timestamp sorting
- Spatial queries
- Vector similarity searches
