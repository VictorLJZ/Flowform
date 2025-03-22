# FlowForm - Project Plan

## Project Overview

FlowForm is a dynamic form application that utilizes AI to create personalized question paths for each respondent. Instead of static forms, FlowForm starts with a configurable "Starter Question" and uses LLM-generated follow-up questions based on individual responses. The application also includes a RAG-powered analytics system that allows form creators to chat with their response data.

## Core Features

1. **Dynamic Question Generation**
   - Configurable starter question
   - AI-generated follow-up questions based on previous responses
   - Customizable response limit

2. **Form Configuration Dashboard**
   - Starter question setup
   - AI temperature adjustment
   - Custom instruction input
   - Response limit configuration

3. **Response Collection Interface**
   - Clean, distraction-free UI for respondents
   - Real-time question generation
   - Response submission and storage

4. **RAG-Powered Analytics**
   - Vector embedding of all Q&A pairs
   - Natural language chat interface for data analysis
   - Insight generation from response patterns

## Architecture

### Frontend Architecture
- Next.js app with React 19
- Pages + App Router hybrid approach
- ShadCN UI components styled with Tailwind CSS v4
- Zustand for state management

### Backend Architecture
- Serverless API routes with Next.js
- Supabase for database and authentication
- OpenAI integration for LLM capabilities and embeddings
- Vercel deployment

## Database Schema

### Tables

1. **Users**
   - `id` (primary key)
   - `email`
   - `created_at`
   - `updated_at`

2. **Forms**
   - `id` (primary key)
   - `user_id` (foreign key to Users)
   - `title`
   - `starter_question`
   - `instructions` (LLM instructions)
   - `temperature` (LLM temperature)
   - `max_questions` (limit of follow-up questions)
   - `created_at`
   - `updated_at`

3. **Respondents**
   - `id` (primary key)
   - `form_id` (foreign key to Forms)
   - `session_id` (unique identifier for the response session)
   - `created_at`
   - `completed_at` (nullable)

4. **Interactions**
   - `id` (primary key)
   - `respondent_id` (foreign key to Respondents)
   - `question` (the question asked)
   - `answer` (the response given)
   - `question_index` (order in the sequence)
   - `vector_embedding` (vector representation for RAG)
   - `created_at`

## Component Structure

### Pages
- `/` - Landing page
- `/dashboard` - Main dashboard for form management
- `/dashboard/forms` - List of created forms
- `/dashboard/forms/[id]` - Form detail and configuration
- `/dashboard/forms/[id]/analyze` - RAG-powered analytics interface
- `/forms/[id]` - Public form response interface

### Components (organized by feature)

#### Core Components
- `Layout` - Main application layout
- `AuthGuard` - Authentication wrapper
- `ErrorBoundary` - Error handling component

#### Dashboard Components
- `FormList` - Display and manage created forms
- `FormEditor` - Create/edit form configuration
- `FormStats` - Quick stats overview for forms

#### Form Components
- `DynamicForm` - Main form interface for respondents
- `Question` - Individual question display
- `AnswerInput` - Response input component
- `ProgressIndicator` - Shows progress through the form

#### Analytics Components
- `ChatInterface` - RAG-powered chat UI
- `InsightCard` - Display generated insights
- `ResponseViewer` - View individual response sessions

## State Management (Zustand Stores)

### `useAuthStore`
- User authentication state
- Login/logout functions

### `useFormConfigStore`
- Form configuration state
- Methods for updating form settings

### `useFormResponseStore`
- Current respondent's session state
- Methods for submitting responses

### `useAnalyticsStore`
- Chat history state
- Methods for querying the RAG system

## Types

### `types/user.ts`
- User-related type definitions

### `types/form.ts`
- Form configuration types
- Response types

### `types/analytics.ts`
- RAG and analytics-related types

### `types/api.ts`
- API request/response types

## API Routes

### Authentication
- `/api/auth/[...nextauth]` - Authentication endpoints

### Forms
- `/api/forms` - CRUD operations for forms
- `/api/forms/[id]/respond` - Submit responses

### AI
- `/api/ai/generate-question` - Generate next question
- `/api/ai/analyze` - RAG-powered analysis

## Implementation Phases

### Phase 1: Foundation (Week 1)
- Set up Next.js project with TypeScript
- Configure Supabase and authentication
- Implement basic UI with ShadCN and Tailwind
- Create initial database schema

### Phase 2: Form Creator Dashboard (Week 2)
- Implement form creation and configuration
- Build form management interface
- Create Zustand stores for state management

### Phase 3: Dynamic Form Interface (Week 3)
- Implement OpenAI Responses API integration
- Build the dynamic question generation system
- Create the respondent-facing form interface

### Phase 4: RAG Analytics (Week 4)
- Implement vector embeddings for Q&A pairs
- Build the chat interface for data analysis
- Create analytics visualization components

### Phase 5: Testing & Deployment (Week 5)
- End-to-end testing
- Performance optimization
- Production deployment

## Responsibilities

### Developer 1
- Frontend components
- UI/UX implementation
- Zustand state management
- Form response interface

### Developer 2
- Backend API routes
- OpenAI integration
- RAG implementation
- Database design and Supabase integration

## Technology Details

### OpenAI Integration

We'll use the new OpenAI Responses API with GPT-4o-mini model, following these guidelines:

- Use "developer" instead of "system" for system messages
- Use the proper input format for the Responses API
- Implement proper function calling format
- Use state management for maintaining conversation context

### Supabase Integration

- PostgreSQL database with vector extension for embeddings
- Row-level security for proper data isolation
- Supabase Auth for user authentication

### Frontend Implementation

- React 19 with Server Components where appropriate
- Tailwind CSS v4 for styling
- ShadCN for accessible UI components
- Proper error handling and loading states

## Project Directory Structure

```
flowform/
├── .git/
├── .github/                      # GitHub workflow configurations
├── public/                       # Static assets
│   ├── images/
│   └── favicon.ico
├── src/                          # Source code
│   ├── app/                      # App Router routes
│   │   ├── (auth)/               # Auth-protected routes group
│   │   │   ├── dashboard/
│   │   │   │   ├── forms/
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── analyze/
│   │   │   │   │   │   │   └── page.tsx     # RAG analytics page
│   │   │   │   │   │   └── page.tsx         # Form detail page
│   │   │   │   │   └── page.tsx             # Forms list page
│   │   │   │   └── page.tsx                 # Dashboard home
│   │   │   └── layout.tsx                   # Auth layout with protection
│   │   ├── api/                             # API routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts             # Auth API routes
│   │   │   ├── forms/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── respond/
│   │   │   │   │       └── route.ts         # Response submission API
│   │   │   │   └── route.ts                 # Form CRUD operations
│   │   │   └── ai/
│   │   │       ├── generate-question/
│   │   │       │   └── route.ts             # Question generation API
│   │   │       └── analyze/
│   │   │           └── route.ts             # RAG analysis API
│   │   ├── forms/
│   │   │   └── [id]/
│   │   │       └── page.tsx                 # Public form page
│   │   ├── layout.tsx                       # Root layout
│   │   └── page.tsx                         # Landing page
│   ├── components/                          # UI components
│   │   ├── ui/                              # ShadCN components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── core/                            # Core components
│   │   │   ├── layout.tsx
│   │   │   ├── auth-guard.tsx
│   │   │   └── error-boundary.tsx
│   │   ├── dashboard/                       # Dashboard components
│   │   │   ├── form-list.tsx
│   │   │   ├── form-editor.tsx
│   │   │   └── form-stats.tsx
│   │   ├── form/                            # Form components
│   │   │   ├── dynamic-form.tsx
│   │   │   ├── question.tsx
│   │   │   ├── answer-input.tsx
│   │   │   └── progress-indicator.tsx
│   │   └── analytics/                       # Analytics components
│   │       ├── chat-interface.tsx
│   │       ├── insight-card.tsx
│   │       └── response-viewer.tsx
│   ├── hooks/                               # Custom hooks
│   │   └── use-form-navigation.ts
│   ├── lib/                                 # Utility libraries
│   │   ├── supabase.ts                      # Supabase client
│   │   ├── openai.ts                        # OpenAI client
│   │   ├── auth.ts                          # Auth utilities
│   │   └── utils.ts                         # General utilities
│   ├── stores/                              # Zustand stores
│   │   ├── auth-store.ts
│   │   ├── form-config-store.ts
│   │   ├── form-response-store.ts
│   │   └── analytics-store.ts
│   ├── types/                               # TypeScript types
│   │   ├── user.ts
│   │   ├── form.ts
│   │   ├── analytics.ts
│   │   └── api.ts
│   └── styles/                              # Global styles
│       └── globals.css
├── prisma/                                  # Prisma schema (if used)
│   └── schema.prisma
├── .env.local                               # Local environment variables
├── .env.example                             # Example environment variables
├── .eslintrc.json                           # ESLint configuration
├── .prettierrc                              # Prettier configuration
├── next.config.js                           # Next.js configuration
├── package.json                             # Dependencies
├── postcss.config.js                        # PostCSS configuration
├── tailwind.config.js                       # Tailwind configuration
├── tsconfig.json                            # TypeScript configuration
└── README.md                                # Project documentation
```
