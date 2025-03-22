# Form Builder Implementation

## Overview
This document outlines the implementation plan for connecting the form generation logic to the frontend UI, specifically creating a "Create new form" page accessible from the sidebar.

## Components and Structure

### 1. Page Structure
- **Location:** `/src/app/builder/create/page.tsx`
- **Purpose:** Interface for users to configure and generate new forms
- **Route:** Accessible via the "Create new form" button in the sidebar

### 2. UI Components (ShadCN)
- `Card` - Container for the form configuration inputs
- `Input` - For text fields like starter question
- `Textarea` - For longer text like instructions
- `Slider` - For temperature adjustment (0-1)
- `Input` with number type - For maximum questions
- Form validation components
- `Button` components for actions

### 3. State Management
- **Location:** `/src/stores/form-builder-store.ts`
- **Type Definitions:** `/src/types/form-builder.ts`
- **Purpose:** Manage form creation state using Zustand
- **Key State:**
  - Form configuration parameters
  - Creation status (idle, loading, success, error)
  - Validation state

### 4. API Integration
- **Endpoint:** `/src/app/api/forms/generate/route.ts`
- **Purpose:** Handle form generation requests
- **Method:** POST
- **Body:** Form generation configuration
- **Response:** Generated form structure or error

### 5. Form Generation Integration
- Leverage existing form generation logic in `/src/lib/form-generation`
- Connect through API endpoints
- Handle errors and validation

## Implementation Sequence

1. **Create basic page structure**
   - Set up the page component with layout and routing
   - Implement ShadCN components for UI

2. **Set up state management**
   - Create Zustand store for form builder
   - Define types and interfaces

3. **Implement form configuration UI**
   - Create form inputs with validation
   - Add responsive design and accessibility features

4. **Create API endpoint**
   - Set up route handler for form generation
   - Connect with existing form generation logic
   - Implement error handling

5. **Add form submission logic**
   - Connect form submission to API
   - Handle loading states and feedback

6. **Implement success state**
   - Add confirmation and next steps after form creation
   - Redirect to form preview/edit page

## User Flow

1. User navigates to "Create new form" from sidebar
2. User completes form configuration:
   - Enters starter question
   - Provides instructions for form generation
   - Adjusts temperature (creativity level)
   - Sets maximum number of questions
3. User submits form configuration
4. System generates form structure using AI
5. User is presented with success confirmation
6. User can preview or edit the generated form

## Technical Considerations

- Use proper error handling and loading states
- Ensure responsive design for all screen sizes
- Implement proper validation to prevent invalid configurations
- Optimize API calls for performance
- Follow accessibility best practices
