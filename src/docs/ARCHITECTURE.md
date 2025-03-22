# Travel App Architecture

## Overview
A collaborative travel planning application that integrates AI assistance, map visualization, and itinerary management. The app allows users to create travel sessions where they can interact with an AI to plan trips, visualize locations on a map, and build interactive itineraries.

## Tech Stack

### Frontend
- **Framework**: Next.js with React 19
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **UI Components**: shadcn/ui
- **Maps**: Google Maps JavaScript API
- **Calendar**: React Big Calendar / FullCalendar
- **Internationalization**: next-intl
- **Real-time**: Supabase Realtime

### Backend
- **Database**: Supabase
- **Authentication**: Supabase Auth (custom styled with popup modals)
- **API Layer**: Next.js API Routes
- **AI Integration**: OpenAI Responses API with custom tool calling
- **External API**: Duffel API for flight search functionality
- **Deployment**: Vercel

## Data Model

```
- Users
  - id
  - email
  - name
  - created_at
  - preferences (JSON)

- TravelSessions
  - id
  - owner_id (foreign key to Users)
  - created_at
  - title
  - description
  - status (draft, active, completed)

- SessionParticipants
  - session_id (foreign key to TravelSessions)
  - user_id (foreign key to Users)
  - role (owner, editor, viewer)
  - joined_at

- ChatMessages
  - id
  - session_id (foreign key to TravelSessions)
  - user_id (foreign key to Users, null if AI)
  - content
  - role (user, assistant)
  - timestamp
  - embedding (vector for RAG)

- Itineraries
  - id
  - session_id (foreign key to TravelSessions)
  - day_date
  - title

- ItineraryBlocks
  - id
  - itinerary_id (foreign key to Itineraries)
  - start_time
  - end_time
  - title
  - description
  - location_id (optional foreign key to MapMarkers)
  - type (flight, activity, accommodation, transport, etc.)
  - details (JSON)

- MapMarkers
  - id
  - session_id (foreign key to TravelSessions)
  - latitude
  - longitude
  - name
  - description
  - type (hotel, attraction, restaurant, etc.)
  - details (JSON)

- FlightSearchResults
  - id
  - session_id (foreign key to TravelSessions)
  - search_params (JSON)
  - results (JSON)
  - timestamp
```

## Project Structure

```
/app
  /api
    /auth
    /sessions
    /chat
    /itinerary
    /maps
    /duffel
  /(routes)
    /dashboard
    /session/[id]
    /profile
  /components
    /ui (shadcn components)
    /auth
    /chat
    /itinerary
    /map
    /layout
  /lib
    /supabase
    /openai
    /duffel
    /utils
    /hooks
  /store (Zustand stores)
  /i18n (internationalization)
/public
  /locales
  /images
/types (centralized type definitions)
  /supabase.ts
  /api.ts
  /auth.ts
  /duffel.ts
  /openai.ts
  /map.ts
  /itinerary.ts
  /store.ts
  /components.ts
  /utils.ts
  /index.ts
```

## Feature Breakdown

### Authentication
- Custom-styled Supabase Auth with popup modals
- User profile management
- Session persistence

### Travel Sessions
- Create, join, share sessions
- Real-time collaboration
- Permission management

### AI Chat
- OpenAI Responses API integration
- 10-message context window
- RAG for historical context
- Custom tools for travel planning

### Map Integration
- Google Maps React components
- Custom markers for points of interest
- Interactive location selection
- Route visualization

### Itinerary Management
- Calendar interface
- AI-generated itinerary blocks
- Drag-and-drop editing
- Timeline visualization

### Flight Search
- Duffel API integration
- Search results display
- Flight comparison
- Saved search history

## AI Tool Integration

### Custom Tools
- **Flight Search**: Query the Duffel API for flight options
- **Location Search**: Find points of interest via Google Places API
- **Itinerary Management**: Create and modify itinerary blocks
- **Map Marker Management**: Add and update map markers

### RAG Implementation
- Vector embeddings for chat history
- Supabase pgvector for storage and retrieval
- Contextual awareness for the AI assistant

## Best Practices

### Error Handling
- Centralized error boundary system
- Contextual error messages
- Sentry integration for error tracking
- Custom error hooks for API calls

### Testing
- Jest for unit tests (70%)
- React Testing Library for component tests (20%)
- Playwright for E2E tests (10%)

## Implementation Plan

### Phase 1: Core Foundation
1. **Authentication & Session Setup**: Implement Supabase auth and the basic travel session creation flow
2. **Chat Interface**: Create a simple chat UI with OpenAI integration
3. **Basic Map Component**: Implement the Google Maps integration with simple marker functionality
4. **Minimal Itinerary View**: Build a basic calendar interface for viewing planned activities

### AI Assistant Training (Low-Cost Options)
1. **Prompt Engineering**: Invest time in crafting detailed system prompts with travel-specific instructions
2. **Few-Shot Learning**: Include travel planning examples in your prompts to guide the model
3. **RAG with Public Travel Data**: Create a small vector database of travel guides, destination information
4. **Function Calling**: Implement OpenAI function calling for structured outputs (itinerary entries, location recommendations)

### Real-Time Collaboration Solutions
1. **Operational Transforms**: Implement conflict resolution for concurrent edits
2. **Locking Mechanism**: Allow only one user to edit a specific itinerary block at a time
3. **Last-Write-Wins**: Simplest approach - last change overwrites previous changes
4. **Notification System**: Alert users when changes are made by others
5. **Supabase Realtime**: Leverage Supabase's built-in real-time capabilities with minimal custom code

### RAG Implementation Strategy
1. **Message Windowing**: Only embed/index the most recent N messages
2. **Chunking Strategy**: Split long conversations into meaningful chunks
3. **Periodic Summarization**: Create summaries of older conversations and embed those
4. **Relevance Filtering**: Only retrieve the most similar chunks based on cosine similarity
5. **Metadata Filtering**: Tag messages with metadata (dates, locations) for better retrieval

### Internationalization Approach
1. **next-intl Integration**: For text translations with namespace organization
2. **i18n Date/Time Handling**: Use libraries like `date-fns` with locale support
3. **Dynamic Currency Conversion**: Integrate with a currency API for real-time conversions
4. **Locale-Specific Components**: Create adaptable components that adjust to locale preferences
5. **Right-to-Left Support**: Ensure your layout works with RTL languages using appropriate CSS

### AI Effectiveness Metrics
1. **Completion Rate**: How often users complete a travel plan with AI assistance
2. **Edit Frequency**: How often users modify AI-generated suggestions
3. **Task Success Rate**: Measuring if the AI successfully completes specific tasks (finding hotels, activities)
4. **User Satisfaction Surveys**: Simple post-planning surveys
5. **Time-to-Plan Metrics**: Measuring how quickly users complete planning with AI vs. without

### Integration Testing Strategy
1. **Mock Services**: Create mock implementations of external APIs for testing
2. **Contract Testing**: Verify that API responses conform to expected schemas
3. **Staged Testing Environment**: Create a staging environment with test instances
4. **End-to-End Scenarios**: Test complete user journeys across all systems
5. **CI Pipeline**: Automate integration tests in your CI/CD workflow
- 80%+ coverage on core business logic

### CI/CD Pipeline
- Vercel's built-in CI/CD
- Automated testing on pull requests
- Preview deployments
- GitHub Actions for additional workflows

### SEO
- Next.js hybrid rendering
- Metadata API implementation
- Sitemap generation

### Performance
- Core Web Vitals optimization:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- Code splitting and lazy loading
- Image optimization
- Bundle analysis

### Browser Support
- Evergreen browsers (Chrome, Firefox, Safari, Edge)
- Last two major versions
- Polyfills as needed

### Security
- Content Security Policy
- CSRF protection
- Rate limiting
- Input sanitization
- Regular dependency audits
- HTTP security headers

### Backup and Recovery
- Supabase point-in-time recovery
- Scheduled backups
- Documented restore procedures
- Data export options

### Third-Party Services
- Service adapters for each API
- Environment variables for keys
- Fallback mechanisms

### Feature Flags
- Environment-based flags
- User-based flags for beta features

### Environment Management
- Development (local + branch previews)
- Staging (pre-production)
- Production (live application)

### Documentation
- README
- Architecture diagrams (C4 model)
- API documentation
- Component storybook
- Decision records

## Implementation Phases

### Phase 1: Foundation
- Project setup with Next.js, React 19, and Tailwind v4
- Supabase integration and schema creation
- Authentication flow
- Basic dashboard

### Phase 2: Core Features
- Session management
- Basic AI chat implementation
- Simple map integration
- Itinerary layout

### Phase 3: Advanced Features
- Duffel API integration
- Tool calling implementation
- Collaborative editing
- Calendar interactions

### Phase 4: Polish
- Internationalization
- Performance optimization
- Comprehensive testing
- Documentation

### Phase 5: Future Enhancements
- Mobile responsiveness
- Notifications system
- Analytics integration
- Potential migration to React Native or Swift for mobile app
