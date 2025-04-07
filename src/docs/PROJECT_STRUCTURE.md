# FlowForm-neo Project Structure

This document outlines the organization and structure of the FlowForm-neo application, explaining the purpose of each directory and key files.

## Directory Structure

```
/src
  /app                     # Next.js App Router pages
    /page.tsx              # Landing page (public)
    /f/[formId]/page.tsx   # Public form interface (no login required)
    /login/page.tsx        # Login page
    /dashboard/...         # Dashboard pages (require authentication)
  /components              # Reusable React components
    /layout                # Layout components like navigation
      /public              # Components for public-facing layout
      /dashboard           # Components for dashboard layout
    /sections              # Page section components (for landing page)
    /forms                 # Form-related components
    /ui                    # UI primitives (from shadcn)
  /stores                  # Centralized Zustand stores
    /authStore.ts          # Authentication state
    /formStore.ts          # Form configuration state
    /responseStore.ts      # Form response state
    /analyticsStore.ts     # Analytics state
  /types                   # Centralized TypeScript type definitions
    /supabase-types.ts     # Supabase-related types
    /form.ts               # Form-related types
    /user.ts               # User-related types
    /api.ts                # API-related types
  /lib                     # Utility functions and services
    /ai                    # OpenAI integration with Responses API
    /supabase              # Supabase client configuration
      /client.ts           # Browser client
      /server.ts           # Server client
    /utils.ts              # General utility functions
  /middleware.ts           # Next.js middleware for authentication
  /docs                    # Internal documentation
```

## Directory Details

### `/src/app`
Contains all Next.js App Router pages, which follow the file-based routing pattern. 

- **Landing Page**: The homepage accessible to all users (`/page.tsx`)
- **Form Interface**: Public interface for filling out forms (`/f/[formId]/page.tsx`)
- **Login Page**: Authentication page (`/login/page.tsx`)
- **Dashboard**: Admin area that requires authentication (`/dashboard/*`)

### `/src/components`
Houses all reusable React components, organized by function:

- **Layout Components**: Page layouts and navigation elements
  - **Public Layout**: Navigation and layout for the public site
  - **Dashboard Layout**: Navigation and layout for the admin dashboard
- **Sections**: Major page sections used in the landing page
- **Forms**: Form-related components for data collection
- **UI**: Component primitives from shadcn UI library

### `/src/stores`
Centralized state management using Zustand, following the project requirements:

- **authStore.ts**: Manages authentication state and user information
- **formStore.ts**: Handles form configuration and management
- **responseStore.ts**: Manages form responses
- **analyticsStore.ts**: Handles analytics data and processing

### `/src/types`
Centralized TypeScript type definitions, following the project requirements:

- **supabase-types.ts**: Database table types and Supabase-related interfaces
- **form.ts**: Types related to form configuration and display
- **user.ts**: User and authentication-related types
- **api.ts**: API request/response types

### `/src/lib`
Utility functions and services:

- **AI Integration**: OpenAI services using the new Responses API
- **Supabase Configuration**: Browser and server clients for Supabase
- **utils.ts**: General utility functions for common tasks

### `/src/middleware.ts`
Next.js middleware that handles authentication and route protection.

## Key Technologies

- **Next.js** with App Router
- **React 19**
- **TypeScript**
- **Zustand** for state management
- **Supabase** for database and auth (with SSR)
- **Tailwind CSS v4**
- **ShadCN UI** components
- **OpenAI Responses API** for AI integration
- **Bun** as the JavaScript runtime

## Core Functionality

The application consists of two main parts:

1. **Public Site**
   - Landing page with marketing sections
   - Public form interface for collecting responses

2. **Dashboard (Authenticated)**
   - Form creation and configuration
   - Response analytics
   - User management
