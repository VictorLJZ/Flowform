# FlowForm WYSIWYG Architecture

This document outlines the architecture for implementing a true WYSIWYG (What You See Is What You Get) experience in FlowForm, where the form viewer perfectly mirrors what users create in the form builder.

## Core Architecture

### 1. Shared Component Library

We will implement a shared component library used by both the form builder and form viewer:

```
├── components/
│   ├── form/
│   │   ├── blocks/ (shared between builder and viewer)
│   │   │   ├── TextInputBlock.tsx  
│   │   │   ├── MultipleChoiceBlock.tsx
│   │   │   ├── DynamicBlock.tsx
│   │   │   └── ... 
│   │   ├── FormContext.tsx (context provider)
│   │   ├── FormRenderer.tsx (shared renderer)
│   │   ├── builder/ (builder-specific components)
│   │   └── viewer/ (viewer-specific components)
```

### 2. Theme/Style Configuration System

Form styling and theme information will be stored in a dedicated database table:

```typescript
interface FormTheme {
  id: string;
  form_id: string;
  colors: {
    primary: string;
    background: string;
    text: string;
    accent: string;
    // etc.
  };
  typography: {
    fontFamily: string;
    headingSize: string;
    bodySize: string;
    // etc.
  };
  layout: {
    spacing: string;
    containerWidth: string;
    borderRadius: string;
    // etc.
  };
}
```

### 3. Enhanced Block Model

Each form block will contain both content and presentation data:

```typescript
interface FormBlock {
  id: string;
  type: 'static' | 'dynamic';
  subtype: string; 
  content: {
    title: string;
    description?: string;
    options?: Array<{value: string, label: string}>;
  };
  presentation: {
    layout: 'centered' | 'left' | 'right';
    spacing: 'compact' | 'normal' | 'spacious';
    titleSize: 'small' | 'medium' | 'large';
    optionStyle?: 'buttons' | 'cards' | 'minimal';
  };
}
```

### 4. Context Provider

A shared context provider will supply theme information and handle mode-specific behavior:

```typescript
const FormContext = createContext<{
  mode: 'builder' | 'viewer';
  theme: FormTheme;
  onBlockUpdate?: (blockId: string, data: any) => void;
  onSubmitAnswer?: (blockId: string, answer: any) => void;
}>({...});
```

## Implementation Plan

### Phase 1: Core Infrastructure

1. **Create form theme database table** 
   - Add `form_themes` table to Supabase
   - Add relationships to forms table

2. **Implement shared component structure**
   - Create directory structure for shared components
   - Implement FormContext provider
   - Create theme type definitions

### Phase 2: Shared Block Components

3. **Implement shared block components**
   - Create one component for each block type
   - Ensure components work in both builder and viewer contexts
   - Support all required styling configurations

4. **Create FormRenderer component**
   - Implement a shared rendering engine for both contexts
   - Support different behaviors based on mode

### Phase 3: Builder & Viewer Integration

5. **Replace form builder with shared components**
   - Completely rewrite form builder using shared component library
   - Add theme customization UI

6. **Replace form viewer with shared components**
   - Completely rewrite form viewer using shared component library
   - Apply theme configuration from database

## Required Changes

### Database Schema Changes

1. Add `form_themes` table with the following structure:
   - `id` (UUID, primary key)
   - `form_id` (UUID, foreign key to forms.form_id)
   - `colors` (JSONB)
   - `typography` (JSONB)
   - `layout` (JSONB)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

2. Enhance `form_blocks` table with a `presentation` column (JSONB)

### New Files to Create

1. `/src/components/form/blocks/` - All shared block components
2. `/src/components/form/FormContext.tsx` - Context provider
3. `/src/components/form/FormRenderer.tsx` - Shared renderer
4. `/src/types/theme-types.ts` - Theme type definitions
5. `/src/services/theme/` - Theme management services

### Files to Replace

1. `/src/app/dashboard/forms/builder/[formId]/components/form-builder-content.tsx`
2. `/src/app/f/[formId]/page.tsx`

### Files to Modify

1. `/src/types/supabase-types.ts` - Add theme interfaces
2. `/src/stores/formBuilderStore.ts` - Add theme management

## Benefits

- **Perfect Fidelity**: What users create is exactly what respondents see
- **Feature Extensibility**: Easy to add new styling options and block types
- **Maintainability**: Single source of truth for component rendering
- **User Experience**: Enhanced customization capabilities for form creators

## Next Steps

1. Create the theme database schema
2. Implement the core shared component structure
3. Build one example block component that works in both contexts
4. Enhance the form builder to support theme editing
5. Update the form viewer to use the shared components

This architectural approach will provide a clean, modern foundation for the FlowForm application, enabling extensive customization and ensuring perfect fidelity between builder and viewer experiences.
