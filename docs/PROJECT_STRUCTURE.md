# FlowForm-neo Project Structure

This document outlines the organization and structure of the FlowForm-neo application, explaining key directories and their purposes.

## Top-Level Structure

```
/src                      # Source code
  /app                    # Next.js App Router pages
  /components             # Reusable React components
  /stores                 # Zustand state management
  /types                  # TypeScript type definitions
  /lib                    # Utility functions and services
  /providers              # React context providers
  /middleware.ts          # Next.js authentication middleware
/docs                     # Project documentation
/public                   # Static assets
```

## Detailed Directory Structure

### `/src/app` - Next.js App Router

The application uses Next.js App Router for routing and page structure:

```
/app
  /page.tsx              # Landing page (public)
  /f/[formId]/page.tsx   # Public form interface (no login required)
  /login/page.tsx        # Login page
  /dashboard/...         # Dashboard pages (require authentication)
```

- **Public Routes**: Routes like the homepage and form pages that don't require authentication
- **Protected Routes**: Dashboard routes that require users to be logged in

### `/src/components` - React Components

Reusable React components organized by function:

```
/components
  /layout                # Layout components
    /public              # Components for public-facing layout
    /dashboard           # Components for dashboard layout
  /sections              # Page section components for landing pages
  /forms                 # Form-related components
  /ui                    # UI primitives (from shadcn)
```

### `/src/stores` - State Management

Centralized Zustand stores for state management:

```
/stores
  /authStore.ts          # Authentication state
  /formStore.ts          # Form configuration state
  /responseStore.ts      # Form response state
  /analyticsStore.ts     # Analytics state
```

All state management is centralized in Zustand stores, following the project requirements.

### `/src/types` - TypeScript Type Definitions

Centralized type definitions:

```
/types
  /supabase-types.ts     # Supabase-related types
  /form.ts               # Form-related types
  /user.ts               # User-related types
  /api.ts                # API-related types
```

TypeScript type definitions are centralized in the types folder, following the project requirements.

### `/src/lib` - Utilities and Services

Utility functions and services:

```
/lib
  /ai                    # OpenAI integration with Responses API
  /supabase              # Supabase client configuration
    /client.ts           # Browser client
    /server.ts           # Server client
  /utils.ts              # General utility functions
```

### `/src/middleware.ts` - Authentication Middleware

Next.js middleware that handles authentication and route protection.

## Main Application Areas

The application has two main parts:

1. **Public-Facing Site**
   - Landing page with marketing content
   - Public form interfaces for users to submit responses
   - No authentication required

2. **Dashboard (Authenticated)**
   - Form creation and management
   - Response analytics and insights
   - User account management
   - Requires authentication

## Key Technologies

- **Next.js**: React framework with App Router for routing
- **React 19**: UI library
- **TypeScript**: Type safety throughout the application
- **Zustand**: State management
- **Supabase**: Database and authentication
- **Tailwind CSS v4**: Styling
- **ShadCN**: UI component library
- **OpenAI Responses API**: AI functionality
- **Bun**: JavaScript runtime

## Authentication Flow

Authentication is implemented using Supabase Auth with Server-Side Rendering (SSR) support:

1. Authentication state is managed in the auth store
2. Protected routes are guarded by middleware
3. Login/logout functionality is implemented in the authentication components

## State Management Strategy

All state is centralized in Zustand stores:
- Clear separation between UI and state
- Stores are organized by domain (auth, forms, etc.)
- Components access state through store hooks
