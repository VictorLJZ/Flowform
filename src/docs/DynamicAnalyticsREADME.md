# Flowform Dynamic Analytics Documentation

## Analytics Page Overview

The analytics page for Flowform (accessible at `/dashboard/forms/[formId]/analytics`) provides comprehensive metrics and insights for form creators. The page displays detailed analytics about form performance, user engagement, and individual question performance.

### Page Structure

1. **Header Section**
   - Breadcrumb navigation (Dashboard > Forms > [Form Name] > Analytics)
   - Form title and descriptive subtitle

2. **Tab Navigation**
   - **Responses**: Shows individual form responses and submission data
   - **Insights**: Displays aggregated metrics and visualizations
   - **AI Chat**: Provides interactive RAG-based querying of form responses
   - **Summary**: (Coming soon) Will show executive summary of form performance

3. **Insights Tab Components**
   - **Form Insights** (`<FormInsights>` component)
     - Shows high-level metrics like total views, starts, submissions, completion rate, and average time
   - **Question Metrics** (`<QuestionMetrics>` component)
     - Displays detailed performance metrics for individual questions

4. **Key Analytics Components**
   - `<FormAnalyticsDashboard>`: Main container component that fetches and displays analytics data
   - `<StatsCard>`: Displays individual KPI metrics (views, completions, etc.)
   - `<TimeSeriesChart>`: Shows trends over time for views and completions
   - `<DistributionChart>`: Visualizes traffic sources and device distribution
   - `<BlockPerformanceChart>`: Shows metrics about each block/question in the form
   - `<InsightsCard>`: Displays AI-generated insights about form performance
   - `<DateRangeSelector>`: Allows filtering analytics by different time periods
   - `<FormInsightsChatbot>`: Interactive AI chatbot for querying form response data using RAG

### Data Flow

1. The analytics page uses custom hooks like `useFormAnalyticsDashboard` and `useFormInsights` to fetch data
2. These hooks use SWR (stale-while-revalidate) for efficient data fetching and caching
3. Data is retrieved via API endpoints that connect to the Supabase database
4. Various visualization components render the fetched metrics

## Dynamic Blocks Database Storage

Dynamic blocks (specifically AI conversation blocks) are stored across multiple database tables to handle their complex structure and behavior.

### Database Tables for Dynamic Blocks

1. **form_blocks** table
   - Stores basic block information (id, form_id, type, subtype, title, etc.)
   - Dynamic blocks have `type = 'dynamic'` and appropriate `subtype`
   - The `settings` field (JSONB) contains configuration like:
     - `temperature`: Controls variability in AI responses (typically 0-1)
     - `maxQuestions`: Maximum number of questions in the conversation
     - `contextInstructions`: The starter question/prompt

2. **dynamic_block_responses** table
   - Stores the actual conversation between the AI and respondents
   - Fields:
     - `response_id`: Links to the form_responses table
     - `block_id`: Links to the form_blocks table
     - `conversation`: JSONB array of Q&A objects
     - `started_at`: When the conversation was started
     - `completed_at`: When the conversation was completed

3. **dynamic_block_analytics** table
   - Stores analytics specific to dynamic conversation blocks
   - Tracks metrics like time to answer, answer length, and sentiment
   - Connected to specific questions through `question_index` field

### Saving Dynamic Block Configurations

When a dynamic block is created or updated:

1. The frontend calls `saveDynamicBlockConfig()` with block ID and settings
2. The function maps frontend settings to database format using `mapToDynamicBlockConfig()`
3. Settings are stored in the `settings` JSONB field of the `form_blocks` table
4. The configuration includes parameters like temperature, maxQuestions, and starter question

### Saving Dynamic Block Responses

When a respondent interacts with a dynamic block:

1. The frontend sends the question, answer, and metadata to the API
2. The `saveDynamicBlockResponse()` function processes this input
3. The conversation is stored as a JSONB array in the `conversation` field
4. The AI generates the next question using the OpenAI Responses API (using GPT-4o-mini model)
5. The updated conversation and next question are saved back to the database

### Dynamic Block Conversation Flow

1. User sees the starter question configured by the form creator
2. User responds to the question
3. Response is saved in the database
4. AI generates a contextual follow-up question based on previous answers
5. This process continues until reaching the configured maximum questions
6. Upon completion, the conversation is marked complete in the database

## Analytics Tracking for Dynamic Blocks

The system tracks detailed analytics for dynamic blocks:

1. **User Interactions**
   - Time spent on each question
   - Answer length and complexity
   - Navigation patterns (editing previous answers)
   - Block view and interaction events

2. **Performance Metrics**
   - Completion rates for AI conversations
   - Average time to complete the conversation
   - Drop-off points within the conversation
   - Metrics on user engagement with each question

3. **Advanced Analytics** (Phase 6, in progress)
   - Sentiment analysis of responses
   - Topic extraction from responses
   - Comparison between different conversation configurations

## Implementation Details

1. **Event Tracking System**
   - Events like block views, interactions, and form completions are tracked
   - Events are queued and batched for efficient database operations
   - Visitor identification system maintains anonymous visitor IDs

2. **Analytics Tables**
   - `form_views`: Tracks form view events with visitor information
   - `form_metrics`: Stores aggregated metrics for overall form performance
   - `block_metrics`: Tracks performance of individual blocks
   - `form_interactions`: Records detailed user interactions with form elements
   - `dynamic_block_analytics`: Specific metrics for AI conversation blocks

3. **API Integration**
   - Analytics data is exposed through API endpoints
   - SWR hooks provide efficient data fetching and caching
   - Components use the fetched data to render visualizations 

# RAG Chatbot Implementation Plan for Form Analytics

This section outlines a step-by-step implementation plan for adding a RAG (Retrieval Augmented Generation) chatbot to the form analytics dashboard, allowing users to ask questions about their form responses.

## 1. Database Setup

### 1.1 Create Vector Storage Extension

```sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

### 1.2 Create Embedding Tables

```sql
-- Table for storing embeddings of conversations
CREATE TABLE conversation_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(form_id),
  block_id UUID NOT NULL REFERENCES form_blocks(id),
  response_id UUID NOT NULL REFERENCES form_responses(id),
  conversation_text TEXT NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index for faster vector similarity search
  CONSTRAINT fk_form_id FOREIGN KEY (form_id) REFERENCES forms(form_id),
  CONSTRAINT fk_block_id FOREIGN KEY (block_id) REFERENCES form_blocks(id),
  CONSTRAINT fk_response_id FOREIGN KEY (response_id) REFERENCES form_responses(id)
);

-- Create vector index
CREATE INDEX ON conversation_embeddings USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);
```

### 1.3 Create Chat History Table

```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(form_id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_form_id FOREIGN KEY (form_id) REFERENCES forms(form_id),
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_session_id FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
);
```

## 2. Backend Services Implementation

### 2.1 Embedding Generation Service

**File: `src/services/ai/generateEmbeddings.ts`**

```typescript
// Implementation for generating embeddings from conversations using OpenAI
```

### 2.2 Vector Search Service

**File: `src/services/ai/searchVectorDb.ts`**

```typescript
// Implementation for searching embeddings using vector similarity
```

### 2.3 Conversation Preprocessing

**File: `src/services/analytics/preprocessConversations.ts`**

```typescript
// Implementation for transforming dynamic block conversations into suitable format for embeddings
```

### 2.4 RAG Implementation

**File: `src/services/ai/ragService.ts`**

```typescript
// Implementation of the core RAG functionality - retrieval and context construction
```

### 2.5 Batch Embedding Processing

**File: `src/services/analytics/batchEmbeddingProcessor.ts`**

```typescript
// For processing existing conversations
```

## 3. API Endpoints

### 3.1 Chat API

**File: `src/app/api/analytics/chat/route.ts`**

Implemented with the following functionality:
- POST endpoint to create chat messages and generate RAG responses
- GET endpoint to retrieve chat history for a session
- Authentication using Supabase SSR with proper cookie handling
- Integration with RAG services for context-aware responses

### 3.2 Embedding Processing API 

**File: `src/app/api/analytics/embeddings/process/route.ts`**

Implemented with the following functionality:
- POST endpoint to process form conversations and generate embeddings
- Authentication and form access verification 
- Integration with conversation preprocessing service
- Modern Supabase SSR cookie handling for security

## 4. Frontend Implementation

### 4.1 Chat Component

**File: `src/components/analytics/FormInsightsChatbot.tsx`**

```typescript
// Main chat interface component
```

### 4.2 Chat Input Component

**File: `src/components/analytics/ChatInput.tsx`**

```typescript
// Component for chat input and controls
```

### 4.3 Message Display Component

**File: `src/components/analytics/ChatMessages.tsx`**

```typescript
// Component for displaying chat messages
```

### 4.4 Suggested Questions Component

**File: `src/components/analytics/SuggestedQuestions.tsx`**

```typescript
// Component showing suggested questions to ask
```

### 4.5 Chat History Component

**File: `src/components/analytics/ChatHistory.tsx`**

```typescript
// Component for viewing and managing chat history
```

## 5. Frontend Hooks

### 5.1 Chat Hook

**File: `src/hooks/analytics/useFormInsightsChat.ts`**

```typescript
// Hook for managing chat state and API calls
```

### 5.2 Embedding Processing Hook

**File: `src/hooks/analytics/useEmbeddingProcessor.ts`**

```typescript
// Hook for managing embedding generation process
```

## 6. Types

### 6.1 Chat Types

**File: `src/types/chat-types.ts`**

```typescript
// Type definitions for chat functionality
```

### 6.2 Embedding Types

**File: `src/types/embedding-types.ts`**

```typescript
// Type definitions for embeddings
```

## 7. Integration with Analytics Page

### 7.1 Update Analytics Page

**File: `src/app/dashboard/forms/[formId]/analytics/page.tsx`**

```typescript
// Add chat tab to the analytics page
```

### 7.2 Analytics Layout Updates

**File: `src/components/analytics/FormAnalyticsLayout.tsx`**

```typescript
// Update layout to accommodate the chat interface
```

## 8. Implementation Checklist

### 8.1 Database Setup
- [x] Add vector extension to Supabase
- [x] Create conversation_embeddings table
- [x] Create chat_sessions and chat_messages tables
- [x] Set up appropriate indexes and constraints

### 8.2 Backend Implementation
- [x] Create embedding generation service
- [x] Implement conversation preprocessing
- [x] Build vector search functionality
- [x] Implement RAG context builder
- [ ] Create batch processing for existing conversations

### 8.3 API Routes
- [x] Implement chat API endpoint
- [x] Create embedding processing endpoint
- [ ] Build chat history management endpoints

### 8.4 Frontend Components
- [x] Build main chat interface
- [x] Create message display component
- [x] Implement chat input component
- [ ] Add suggested questions component
- [ ] Build chat history component

### 8.5 Frontend Hooks
- [x] Implement useFormInsightsChat hook
- [x] Create useEmbeddingProcessor hook
- [ ] Add chat session management functionality

### 8.6 Integration
- [x] Update analytics page to include chat tab
- [x] Add chat interface to page layout
- [x] Set default tab to "insights" for proper analytics view
- [ ] Create state management for chat/analytics context

### 8.7 Testing
- [ ] Test embedding generation with sample conversations
- [ ] Verify vector search accuracy
- [ ] Test chat functionality end-to-end
- [ ] Ensure proper error handling and loading states

### 8.8 Deployment
- [ ] Update database schema in production
- [ ] Process existing conversations for embeddings
- [ ] Deploy updated application

## 9. System Flow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  User Interface │     │  API Endpoints  │     │    Supabase     │
│   (React/Next)  │────▶│   (Next.js)     │────▶│    Database     │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       │                       │
         │                       │                       │
┌────────▼────────┐     ┌────────▼────────┐     ┌────────▼────────┐
│   SWR Hooks     │     │ Backend Services│     │   Vector DB     │
│                 │◀────│                 │◀────│   (pgvector)    │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 │
                         ┌───────▼───────┐
                         │   OpenAI API  │
                         │ (Responses API)│
                         └───────────────┘
```

## 10. Example System Prompts

### Basic RAG Prompt

```
You are an analytics assistant for form creators using Flowform. Your task is to help form owners understand patterns in their form responses, particularly from AI conversation blocks.

I'll provide you with relevant form responses based on the user's question. Use ONLY the information provided to answer their questions. If the information isn't in the provided context, admit that you don't know rather than guessing.

Focus on identifying:
1. Common themes and patterns
2. Unusual or standout responses
3. Quantitative insights when possible
4. Actionable suggestions for the form creator

CONTEXT:
{context}

QUESTION:
{question}
```

### Tool-Based RAG Prompt

```
You are an analytics assistant for form creators using Flowform. Your task is to help form owners understand patterns in their form responses.

You have access to a tool called 'search_form_responses' that can search for relevant form response data. Only use this tool when you need specific information from form submissions to answer a question.

For simple greetings, clarification questions, or general knowledge inquiries, respond directly without using the tool.

When using the search tool:
1. Create a specific, focused query related to the user's question
2. Request an appropriate number of results based on query complexity
3. Use the retrieved information to provide insights about:
   - Common themes and patterns
   - Unusual or standout responses
   - Quantitative insights when possible
   - Actionable suggestions for the form creator

If the retrieved information doesn't address the user's question, acknowledge this and explain what information is missing.
```

## 10. Recent Updates and Changes

### 10.1 Page Structure Updates
- Added AI Chat tab to the analytics page
- Set default tab to "insights" to ensure static analytics are displayed first
- Integrated FormInsightsChatbot component in the chat tab

### 10.2 API Implementation
- Implemented chat and embedding API routes using modern Supabase authentication
- Used @supabase/ssr package instead of deprecated @supabase/auth-helpers-nextjs
- Implemented proper cookie handling with getAll() and setAll() methods

### 10.3 Component Structure
- Added FormInsightsChatbot component to handle chat interface
- Set up tab organization to allow toggling between different analytics views
- Created responsive layout for the chat interface

### 10.4 Next Steps
- Complete implementation of suggested questions component
- Add chat history management
- Implement loading states and error handling
- Test with real form data

This implementation plan focuses on the core RAG functionality while maintaining a manageable scope for an initial version. Each component is designed to integrate with the existing codebase structure and follows the established patterns of the application. 

## Chat Session Management & Modal UI Best Practices

### Chat Session Clearing Functionality

- The analytics dashboard now supports clearing all chat sessions for a form via a dedicated UI button ("Clear All") in the chat history sidebar.
- When the user clicks "Clear All", a confirmation alert dialog appears, warning about the irreversible deletion of all chat sessions and messages for the form.
- The clear operation is performed via a dedicated API endpoint (`/api/analytics/chat/sessions/clear?formId=...`), which:
  - Authenticates the user
  - Deletes all chat messages and sessions for the specified form and user in Supabase
  - Returns a success or error response
- The frontend uses a Zustand store (`useChatSessionsStore`) to manage chat session state. The `clearAllSessions(formId)` method:
  - Calls the API endpoint
  - Updates the local store state to remove all sessions and reset the current session
  - Handles loading and error states for a smooth UX

### Alert Dialog UI Improvements

- The alert dialog for clearing chat history is implemented using a custom dialog system based on Radix UI primitives.
- The dialog system uses a portal to render the modal at the document body level, ensuring it appears above all other content and is not affected by parent stacking contexts.
- The dialog overlay uses a semi-transparent black background (`bg-black/50`) to dim the rest of the UI and focus attention on the modal.
- The dialog content now uses a solid background (`bg-background`), rounded corners, and a drop shadow for a clean, modern look.
- The confirmation dialog includes:
  - A warning icon in a colored circle
  - A bold, prominent title (e.g., "Clear Chat History")
  - A detailed description of the consequences
  - A divider and additional context for the user
  - Clear, accessible action buttons ("Cancel" and a red "Clear History" with a loading spinner when processing)
- The dialog is fully responsive and centered on the screen.

### Customizing Dialog Appearance

- To change the dialog's appearance, update the `DialogContent` component in `src/components/ui/dialog.tsx`.
- The default background is set to `bg-background` for proper contrast and separation from the overlay.
- The overlay and content use high `z-index` values to ensure they appear above all other UI elements.
- Animations are provided for opening/closing transitions for a polished feel.

### Best Practices for Modal UI in Analytics Dashboard

- Always use a portal-based dialog/modal system to avoid stacking and overlap issues.
- Use a solid background for modal content to prevent underlying UI from showing through.
- Provide clear, accessible action buttons and feedback for destructive actions (like clearing data).
- Use loading indicators and disable actions while processing to prevent duplicate requests.
- Ensure dialogs are responsive and accessible (keyboard navigation, focus management, etc.).

### Example: Clearing All Chat Sessions

1. User clicks "Clear All" in the chat history sidebar.
2. Alert dialog appears, centered and above all content, with a warning and confirmation buttons.
3. User confirms; the dialog shows a loading spinner while the operation is in progress.
4. On success, the dialog closes and the chat history is cleared from both the UI and the database.
5. On error, an error message is shown in the dialog.

## 11. Intelligent Tool-Based RAG Implementation

The RAG system has been enhanced to use a tool-based approach, where the AI model decides when to search for relevant data rather than searching for every query. This approach improves efficiency, user experience, and result quality.

### 11.1 Function-Based RAG Architecture

```
┌───────────────────┐     ┌─────────────────────┐
│   User Query      │────▶│   Gemini Model      │
└───────────────────┘     │   with RAG Tool     │
                          └──────────┬──────────┘
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │   Does query need   │ No  ┌─────────────────┐
                          │    form data?       │────▶│ Direct Response │
                          └──────────┬──────────┘     └─────────────────┘
                                     │ Yes
                                     ▼
                          ┌─────────────────────┐
                          │  Call RAG Function  │
                          │  with refined query │
                          └──────────┬──────────┘
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │  Vector DB Search   │
                          │  for relevant data  │
                          └──────────┬──────────┘
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │  Generate Response  │
                          │  using retrieved    │
                          │  context            │
                          └─────────────────────┘
```

### 11.2 Benefits of Tool-Based RAG

1. **Efficiency**: Only searches the database when necessary, reducing database load
2. **Better UX**: Simple questions get immediate responses without database lookups
3. **Transparency**: Users can see when their form data is being searched
4. **Improved Relevance**: The model can refine search queries for better results
5. **Natural Conversations**: Maintains conversational flow for non-data questions

### 11.3 Implementation Details

The RAG system uses Gemini's function calling capabilities to implement a `search_form_responses` tool with the following parameters:

- **query**: The refined search query for finding relevant form responses
- **maxResults**: The number of results to retrieve (dynamically chosen by the model)

When the model determines that form data is needed to answer a question, it calls this function, which:

1. Executes the vector similarity search with the refined query
2. Returns the most relevant form responses as context
3. The model then uses this context to generate a comprehensive answer

### 11.4 UI Feedback

The UI has been enhanced to provide feedback when the RAG tool is being used:

- Shows "Searching form responses..." indicator during search
- Potentially displays which responses informed the answer
- Maintains a clean interface when RAG is not needed

This tool-based approach creates a more natural, efficient, and effective conversation experience when analyzing form data.

--- 