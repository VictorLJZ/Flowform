# AI Conversation Block - Comprehensive Documentation

## Overview

The AI Conversation Block is a dynamic form component that enables AI-powered conversations with form respondents. It uses OpenAI's Responses API to generate contextually relevant follow-up questions based on previous answers, creating an interactive interview-like experience within forms.

## Key Features

- Dynamic question generation based on respondent answers
- Contextual awareness of other questions in the form
- Configurable parameters (max questions, temperature, etc.)
- Conversation persistence and resumption
- Builder and viewer modes for editing and responding
- Optimistic UI updates for seamless user experience

## Component Architecture

The AI Conversation Block follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────┐
│     AIConversationBlock     │     ┌─────────────────┐
│     (React Component)       │     │                 │
└───────────┬─────────────────┘     │                 │
            │                        │    Supabase    │
            ▼                        │   Database     │
┌─────────────────────────────┐     │                 │
│        Custom Hooks         │     │                 │
│  ┌───────────────────────┐  │     └────────┬────────┘
│  │   useAIConversation   │◄─────────────►  │
│  └───────────────────────┘  │              │
│  ┌───────────────────────┐  │              │
│  │useConversationDisplay │  │              │
│  └───────────────────────┘  │     ┌────────▼────────┐
│  ┌───────────────────────┐  │     │                 │
│  │useConversationInteract│  │     │   API Routes    │
│  └───────────────────────┘  │     │   & Services    │
│  ┌───────────────────────┐  │     │                 │
│  │useConversationNavigate│  │     └────────┬────────┘
│  └───────────────────────┘  │              │
└─────────────────────────────┘              │
                                             │
                                   ┌─────────▼────────┐
                                   │                  │
                                   │   OpenAI API     │
                                   │                  │
                                   └──────────────────┘
```

## Bug Fixes and Updates

### Recent Fixes (2023-2024)

1. **Fixed Starter Question Display and Saving**
   - Problem: The root question (starter question) wasn't showing properly in conversation history and was being saved as "What's your answer" in the database
   - Solution:
     - Enhanced the `handleSubmit` function to ensure the question is never empty
     - Added multiple fallbacks for question display (starterPrompt → title → saved question → default text)
     - Improved the question saving logic in `saveDynamicBlockResponse.ts`
     - Fixed first question display in conversation history

2. **Fixed Duplicate Question Display**
   - Problem: Both the root question and follow-up question were showing simultaneously
   - Solution:
     - Updated the display logic to only show one question at a time
     - Made the SlideWrapper title dynamic to display the current question
     - Hid the info icon version of the question when not in builder mode

3. **Fixed maxQuestions Enforcement**
   - Problem: The conversation would continue past the configured maxQuestions setting
   - Solution:
     - Consistently used settingsMaxQuestions throughout the component
     - Fixed the auto-navigation when max questions are reached
     - Added debug logging to track maxQuestions conditions

4. **Fixed Empty Placeholder Issue**
   - Problem: An empty placeholder with info icon was showing on initial load
   - Solution:
     - Only show the current question in builder mode
     - Use conditional rendering to avoid displaying empty questions

5. **Fixed API URL Construction**
   - Problem: Double protocol in API URLs (https://http://)
   - Solution:
     - Fixed the baseUrl function to properly handle URL construction
     - Added proper handling for both absolute and relative URLs

### Previous Major Bug Fixes

1. **Fixed Refresh Loops**
   - Replaced state-based revalidation tracking with refs to prevent render cycles
   - Added component mounting/unmounting tracking to prevent state updates after unmount
   - Improved SWR configuration for better caching control

2. **Fixed Race Conditions**
   - Added proper timing for revalidation calls
   - Used refs instead of state for tracking validation status
   - Implemented a consistent data flow pattern

3. **Fixed Memory Leaks**
   - Added cleanup for setTimeout and useEffect
   - Implemented proper component lifecycle management
   - Added mounted state tracking to prevent updates after unmount

4. **Fixed Type Inconsistencies**
   - Ensured consistent use of types across components and services
   - Standardized prop and type naming
   - Added proper type safety throughout the codebase

## Data Flow

1. **Initialization**:
   - Component loads with configuration (max questions, temperature)
   - For new conversations, displays starter question
   - For existing conversations, fetches conversation history

2. **User Input**:
   - User enters response to current question
   - Answer is processed locally and submitted to API
   - Optimistic UI updates show immediate feedback

3. **AI Processing**:
   - API stores the answer in the database
   - Retrieves form context (other questions in the form)
   - Sends conversation history to OpenAI with context
   - Receives and stores the generated follow-up question

4. **Conversation Continuation**:
   - Component displays new question to user
   - Process repeats until max questions reached or conversation completed
   - Component signals form to advance when conversation is complete

## Key Files and Their Roles

### Frontend Components

| File | Purpose |
|------|---------|
| `src/components/form/blocks/AIConversationBlock.tsx` | Main React component that renders the conversation UI |

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `src/hooks/useAIConversation.ts` | Manages conversation state, API fetching, and optimistic updates |
| `src/hooks/useConversationDisplay.ts` | Determines which question to display based on current state |
| `src/hooks/useConversationInteraction.ts` | Handles user input, submissions, and keyboard events |
| `src/hooks/useConversationNavigation.ts` | Manages navigation between questions in a conversation |
| `src/hooks/form/useFormSubmission.ts` | Handles form-level submission logic and navigation |

### Backend Services

| Service | Purpose |
|---------|---------|
| `src/services/ai/generateQuestion.ts` | Interfaces with OpenAI to generate questions |
| `src/services/ai/processConversation.ts` | Formats conversations for AI processing |
| `src/services/form/saveDynamicBlockResponse.ts` | Persists conversation data to database |
| `src/services/form/saveDynamicBlockConfig.ts` | Saves block configuration settings |
| `src/services/form/getFormContext.ts` | Retrieves form context for AI question generation |

### API Routes

| Route | Purpose |
|-------|---------|
| `src/app/api/conversation/answer/route.ts` | Handles answer submissions and returns next questions |
| `src/app/api/forms/[formId]/sessions/route.ts` | Manages form sessions including AI conversations |
| `src/app/api/forms/[formId]/blocks/[blockId]/question/route.ts` | Generates questions for specific blocks |

## Database Schema

The AI Conversation Block relies on several tables in the Supabase database:

### dynamic_block_configs

Stores configuration for each AI conversation block:

```typescript
interface DynamicBlockConfig {
  block_id: string;           // References form_blocks.id
  starter_question: string;   // Initial question to ask
  temperature: number;        // Controls AI creativity (0-1)
  max_questions: number;      // Maximum questions to ask
  ai_instructions: string;    // Instructions for the AI
  created_at: string;         // Timestamp
  updated_at: string;         // Timestamp
}
```

### dynamic_block_responses

Stores conversation history for each response:

```typescript
interface DynamicBlockResponse {
  id: string;                 // UUID
  response_id: string;        // References form_responses.id
  block_id: string;           // References form_blocks.id
  conversation: QAPair[];     // Array of question-answer pairs
  next_question: string;      // The next generated question
  started_at: string;         // Timestamp
  completed_at: string | null; // Timestamp when completed
  updated_at: string;         // Timestamp
}

// Question-answer pair structure
interface QAPair {
  question: string;
  answer: string;
  timestamp: string;
  is_starter: boolean;
}
```

## OpenAI Integration

The system uses OpenAI's Responses API with the following key characteristics:

- Uses the GPT-4o-mini model for cost efficiency and speed
- Follows the March 2025 Responses API format:
  - Uses `developer` role instead of `system`
  - Uses `input` array instead of `messages`
  - Uses `output_text` for response content
- Implements state management for conversation continuity
- Provides form context to generate relevant questions

### Sample API Request Format

```typescript
const requestOptions = {
  model: "gpt-4o-mini",
  input: [
    { role: "developer", content: "You are an interviewer asking follow-up questions..." },
    { role: "assistant", content: "How has your experience been so far?" },
    { role: "user", content: "Pretty good, though some things were confusing." }
  ],
  temperature: 0.7,
  store: true
};

const response = await openai.responses.create(requestOptions);
```

## Refactoring Recommendations

### Improvements to Code Structure

1. **Simplify Hook Architecture**
   - Consider consolidating the four hooks into fewer, more focused hooks
   - Potential new structure:
     - `useAIConversation` - Core API and state management
     - `useConversationUI` - Combined display and interaction logic

2. **Simplify State Management**
   - Consolidate derived state with useMemo
   - Reduce state variables by combining related state
   - Use React Context for shared state

3. **Improve Error Handling UI**
   - Add consistent error display component
   - Implement error boundaries for better fault isolation
   - Enhance error logging and reporting

### Dead Code Removal Recommendations

1. **Remove Unused Imports**
   - `PaperPlaneIcon`, `motion`, `AnimatePresence`, etc.
   - Remove or conditionalize debug console logs

2. **Code Cleanup**
   - Replace direct state management with custom hooks
   - Remove duplicate code
   - Replace magic numbers with named constants

## Implementation and Testing Recommendations

### Implementation Best Practices

1. **Optimistic Updates**: Always implement optimistic UI updates for better UX
2. **Error Handling**: Provide graceful fallbacks when AI services fail
3. **Context Awareness**: Use form context to improve question relevance
4. **Caching**: Cache responses to reduce API calls and improve performance
5. **Conversation Persistence**: Ensure conversations can be resumed if interrupted
6. **Mobile Optimization**: Ensure the UI works well on mobile devices

### Testing Recommendations

When testing these changes, pay special attention to:

1. **Edge Cases**: Test with empty responses, long responses, and special characters.
2. **Error Recovery**: Intentionally cause errors (e.g., disconnect from network) to verify the UI handles failures gracefully.
3. **Performance**: Monitor for unnecessary re-renders or API calls during normal operation.
4. **Accessibility**: Ensure error states are properly conveyed to all users.
5. **Conversation flow**: Test that questions progress properly and max questions limit is enforced.

## Future Improvements

1. **Add comprehensive test suite** for the AI conversation components
2. **Implement centralized error tracking system**
3. **Further optimize rendering cycle** for complex conversations
4. **Enhance AI caching** to reduce API costs and improve performance
5. **Add progressive enhancement** for accessibility and fallback for no JavaScript
6. **Implement more robust caching layer** for API responses
7. **Consider using React Query** instead of SWR for better control
8. **Add more extensive logging** for production debugging
9. **Add transition animations** between questions for better UX
10. **Implement conversation history view option** for better context 