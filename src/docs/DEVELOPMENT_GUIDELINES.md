# FlowForm-neo Development Guidelines

This document outlines the development guidelines and best practices for the FlowForm-neo application.

## State Management

All state management is centralized in Zustand stores located in the `/src/stores` directory. Each store focuses on a specific domain:

### Store Organization

- **authStore.ts**: Authentication state and user session management
- **formStore.ts**: Form configuration, creation, and management
- **responseStore.ts**: Form responses and submission state
- **analyticsStore.ts**: Analytics processing and data visualization state

### Using Stores

```typescript
// Example of using a store
import { useFormStore } from '@/stores/formStore';

function FormComponent() {
  // Only select the specific state and actions needed
  const { forms, isLoading, fetchForms } = useFormStore();
  
  // Use state and actions...
}
```

## Type Safety

All TypeScript type definitions are centralized in the `/src/types` directory:

### Type Organization

- **supabase-types.ts**: Database schema and Supabase-related types
- **form.ts**: Form configuration and display types
- **user.ts**: User authentication and profile types
- **api.ts**: API request/response interfaces

### Using Types

```typescript
// Example of importing and using types
import { FormRecord } from '@/types/supabase-types';
import { FormDisplayProps } from '@/types/form';
```

## OpenAI Integration

The application uses the new OpenAI Responses API instead of the deprecated Chat Completions API:

### Key Differences

1. Use `input` instead of `messages`
2. Use `developer` role instead of `system`
3. Response structure is different - use `output_text` helper property
4. Function calling uses a different format

### Responses API Example

```typescript
// Correct usage with Responses API
const response = await openai.responses.create({
  model: "gpt-4o-mini",
  input: [
    { role: "developer", content: "System instructions" },
    { role: "user", content: "User message" }
  ],
  temperature: 0.7
});

// Access content
console.log(response.output_text);
```

## Authentication with Supabase

The project uses the SSR-compatible Supabase client:

### Client Configuration

- Browser client at `/src/lib/supabase/client.ts`
- Server client at `/src/lib/supabase/server.ts`
- Middleware for session management at `/src/middleware.ts`

### Protected Routes

All routes under `/dashboard` require authentication. The middleware redirects unauthenticated users to the login page.

## Component Guidelines

### Component Organization

- Keep components focused on a single responsibility
- Group related components in appropriate subdirectories
- Use composition over inheritance
- Limit file size to under 400 lines; refactor larger components

### Component Props

- Define prop interfaces in the same file as the component
- Use destructuring for props
- Provide default values where appropriate

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children 
}: ButtonProps) {
  // Component implementation
}
```

## File Structure

Keep files organized according to the established directory structure:

- **New components** should be added to the appropriate subdirectory in `/components`
- **New stores** should be added to the `/stores` directory
- **New types** should be added to the `/types` directory
- **New utility functions** should be added to the `/lib` directory

## Code Style

- Use TypeScript for all files
- Use functional components with hooks
- Use arrow functions for component definitions
- Use async/await for asynchronous operations
- Use try/catch for error handling

## Performance Considerations

- Keep components small and focused
- Use memoization for expensive calculations
- Use server components where appropriate
- Implement proper error boundaries
- Use suspense boundaries for loading states
