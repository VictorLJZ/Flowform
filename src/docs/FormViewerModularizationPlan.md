# FormViewer Modularization Plan

This document outlines a plan to break down the large `FormViewerPage` component (~675 lines) into smaller, more manageable modules that align with our architecture.

## Modularization Goals

- Break down the component to keep files under 400 lines
- Improve testability and maintainability
- Fix React hooks order violations as part of the refactoring
- Ensure analytics tracking remains intact

## Custom Hooks to Extract

- [x] **`useFormNavigation`** (`/src/hooks/form/useFormNavigation.ts`)
  - Manages current block index, direction, and navigation
  - Functions: `handleNext`, `handlePrevious`
  - State: `currentIndex`, `direction`

- [x] **`useFormAnswers`** (`/src/hooks/form/useFormAnswers.ts`)
  - Manages form answers and persistence
  - Functions: `saveAnswer`, `initializeAnswers`
  - State: `savedAnswers`, `currentAnswer`, `answersInitialized`

- [x] **`useFormSubmission`** (`/src/hooks/form/useFormSubmission.ts`)
  - Handles submission logic, validation, and completion
  - Functions: `handleAnswer`, `validateAnswer`, `createNewSession`
  - State: `submitting`, `submitError`, `completed`, `responseId`

- [x] **`useFormAbandonment`** (`/src/hooks/form/useFormAbandonment.ts`)
  - Tracks form abandonment with analytics
  - Manages beforeunload event listeners
  
## Components to Extract

- [x] **`FormNavigationControls`** (`/src/components/form/viewer/FormNavigationControls.tsx`)
  - Navigation buttons UI (next/previous)
  - Handles disabled states and loading indicators

- [x] **`CompletionScreen`** (`/src/components/form/viewer/CompletionScreen.tsx`)
  - "Thank you" screen displayed after form completion

- [x] **`ErrorMessages`** (`/src/components/form/viewer/ErrorMessages.tsx`)
  - Validation messages and submission errors

- [x] **`BlockRenderer`** (`/src/components/form/viewer/BlockRenderer.tsx`)
  - Extracts the large `renderBlock` function to its own component
  - Handles conditional rendering of different block types
  - Prepares props for each block type

## Utility Functions to Extract

- [x] **`blockMappers.ts`** (`/src/services/form/blockMappers.ts`)
  - Pure functions for transforming backend block data to component props
  - Type-specific mapper functions

## Animation Logic to Extract

- [x] **`slideAnimations.ts`** (`/src/utils/animations/slideAnimations.ts`)
  - Animation variants and motion settings

## Final Page Component Structure

After modularization, the main `FormViewerPage` component would:

1. Import and use all the extracted hooks
2. Compose the extracted components
3. Pass state and handlers between components
4. Be responsible only for the high-level component structure

## Implementation Phases

1. Extract utility functions and animation logic (pure functions first)
2. Create UI components that don't depend on complex state
3. Build custom hooks for state management
4. Refactor the main component to use all extracted modules
5. Fix any remaining React hook order issues
6. Test thoroughly to ensure all functionality works as before

## Analytics Touchpoints to Preserve

- Form view tracking
- Block view tracking 
- Block interaction tracking
- Form abandonment tracking
- Form completion tracking

---

This modularization will help maintain clean architecture while addressing the React hooks violations and keeping files under the 400-line limit.
