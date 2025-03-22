# Session State Management

## Overview
This document outlines the architecture and implementation details for session management in the Sword Travel application.

## Core Components

### Session Components
Each session consists of:
1. **Chat Component**: Conversation interface between users and AI
2. **Map Component**: Visual display of locations and points of interest
3. **Itinerary/Calendar Component**: Calendar with movable event blocks
4. **Trip Details Bar**: Core trip information (origin, destination, dates, travelers, budget)

### UI Layout
- **Left Section**: Chat component
- **Right Section**: Map/Itinerary with toggle between:
  - Map view
  - Itinerary view
  - Combined view (Map on top, Itinerary on bottom)

## Session Data Structure

### Core Trip Details
- **Origin**: Starting location (optional at creation)
- **Destination**: Travel destination (optional at creation)
- **Dates**: Trip duration (optional at creation)
- **Travelers**: Number of people (optional at creation)
- **Budget**: Trip budget (optional at creation)

All trip details can be modified after session creation.

### Session States
- **Active**: Default state, visible to users
- **Inactive**: Hidden from users when "deleted" (soft delete)

## Collaboration Model

### User Roles
- **Owner**: Can add/remove participants, full edit privileges
- **Participant**: Full edit privileges (same as owner except user management)

### Real-time Collaboration Features
- Multiple users can edit simultaneously
- Presence indicators showing active users
- Chat attribution (which user sent which message)
- Supabase Realtime for syncing changes
- Last-write-wins conflict resolution strategy (as specified in architecture doc)

## Session Creation
- Simple button click creates a new empty session
- No initial information required
- All details can be filled in later

## State Management Architecture

### Technology Stack
- **Client-side State**: Zustand stores
- **Persistence Layer**: Supabase
- **Real-time Updates**: Supabase Realtime

### Data Flow
1. User actions update Zustand store (optimistic updates)
2. Changes sync to Supabase
3. Supabase Realtime broadcasts changes to other clients
4. Other clients update their Zustand store

### Persistence Strategy

#### Zustand Store Structure
- **Active Session Data**:
  - Core trip details (origin, destination, dates, travelers, budget)
  - UI state (active view, expanded panels)
  - Most recent chat messages (15 for AI context)
  - Current map view/bounds
  - Itinerary items for visible date range

#### Direct Supabase Queries
- Historical chat messages (with pagination)
- All map markers (load on demand based on map bounds)
- Itinerary items outside current view
- Session participants and permissions
- Session metadata

#### Syncing Strategy
- Subscribe to Supabase Realtime for active session changes
- Implement debounced writes to prevent excessive database calls
- Cache frequently accessed data using React Query or SWR

### Error Recovery During Network Disconnections
1. **Offline Queue System**:
   - When network is disconnected, queue changes in localStorage
   - Upon reconnection, process the queue in order
   - Show a subtle "Reconnecting..." or "Working offline" indicator

2. **Heartbeat Mechanism**:
   - Periodically check connection status with small pings
   - If disconnected, switch to offline mode
   - When reconnected, trigger sync process

3. **Version Control**:
   - Include a last_updated timestamp with each update
   - Resolve conflicts using last-write-wins strategy
   - Provide a visual indicator when syncing changes

## AI Integration

### Chat to Map/Itinerary Flow
- Locations mentioned in chat can be pulled out and displayed on map
- Events generated from chat become calendar blocks

### AI Context Window
- Include past 15 messages in context window
- Rely on RAG for deeper historical context

### Tool Calls
- AI uses tool calls to add events to the calendar
- Events with location components automatically link to map markers

### Map Marker Color Coding
- **Navy Blue**: User-approved event locations / events linked to calendar
- **White**: AI-suggested locations not yet approved or linked to events

### RAG Implementation
- All messages will be embedded for retrieval
- Vector embeddings stored in Supabase
- Contextual awareness for the AI assistant
- Rely on Supabase performance for embedding storage and retrieval

### Structured AI Responses Storage
- **Tool Calls**: Store structured tool call data in a JSONB column
- **Message Segments**: Store message segments with metadata in a JSONB column
- **Processing Metadata**: Additional metadata in a separate JSONB column
- Use PostGIS extension for efficient spatial data handling

## Session Lifecycle

### Creation
- No information required at initialization
- All trip details can start empty and be filled in later

### Initialization and Cleanup
- Sessions are properly containerized to prevent state leakage
- When entering a session, its data is loaded and subscriptions are created
- When leaving a session, all state is reset and subscriptions are cleaned up
- The active session ID is tracked in a central store to prevent cross-session interference

### Deletion
- Sessions are never truly deleted
- "Deleted" sessions transition to inactive state
- Inactive sessions are not shown to users but remain in the database

## Dashboard View

### Session Summary
- Key details display for each session
- Visual indicators of session status
- Preview of destination/trip details

## Future Enhancements
- Undo/redo functionality for itinerary and map changes
- Notification system for collaborative changes
- Advanced conflict resolution strategies

## Implementation Details

### Chat State Management Implementation

#### Message Streaming Strategy
- **Local State First**: During streaming, messages are stored only in Zustand state
- **Finalize on Completion**: Only save to Supabase once the complete message is received
- **UI Optimizations**: Update UI in real-time while streaming chunks arrive
- **Structured Data Storage**: Store tool calls and metadata in JSONB columns

#### Offline Handling and Recovery
- **Queue System**: Store operations in localStorage during network disconnections
- **Operation Tracking**: Track pending operations with unique IDs and timestamps
- **Reconnection Processing**: Process queued operations in order when network is restored
- **Conflict Resolution**: Use timestamp-based last-write-wins strategy

#### OpenAI Embeddings Implementation
- **Embedding Creation**: Use OpenAI's text-embedding-ada-002 model
- **Vector Storage**: Store embeddings in Supabase via pgvector extension
- **Similarity Search**: Implement semantic search using cosine similarity
- **Embedding Triggers**: Automatically create embeddings for each new message

#### AI Context Management
- **Fixed Context Window**: Include 15 most recent messages in API calls
- **RAG Augmentation**: Use vector search for deeper historical context
- **Context Pruning**: Summarize older messages for extended conversations
- **Tool Call Persistence**: Store structured tool call data for future context

### Error Handling
- **Graceful Degradation**: Maintain UI functionality when offline
- **Clear Error Messages**: Display user-friendly error notifications
- **Retry Mechanisms**: Implement exponential backoff for failed operations

### Performance Optimizations
- **Message Virtualization**: Only render messages visible in the viewport
- **Chunked Rendering**: Render message chunks as they arrive
- **Debounced Supabase Writes**: Batch database operations
- **Memoized Components**: Use React.memo and useMemo/useCallback
- **Selective Subscriptions**: Surgical Zustand subscriptions
- **Optimistic UI Updates**: Update UI first, sync with database later
- **Local Caching**: Use SWR or React Query for repeated data fetches
- **Pagination**: Efficient loading of chat history in chunks

### Security
- Role-based access control
- Data validation on both client and server
- Session token verification

### Session Containerization
- **Session Container Component**: Manages the lifecycle of session resources
- **Active Session Tracking**: Central store tracks which session is currently active
- **Subscription Management**: Registry of active subscriptions for proper cleanup
- **Operation Guards**: Checks in async operations prevent cross-session interference
- **State Reset**: Complete state cleanup when switching between sessions
- **Isolated State**: Each session has its own dedicated state that doesn't leak

## Implementation Starting Points

1. **Session Type Definitions**: Define TypeScript interfaces for session data structures
2. **Zustand Session Store**: Create the foundational state management for sessions
3. **Supabase Schema**: Set up the database tables for session data
4. **Basic Session CRUD**: Implement create, read, update, delete operations
5. **Session Component Shell**: Create the basic UI layout for sessions
6. **API Routes**: Set up the Next.js API routes for session management
