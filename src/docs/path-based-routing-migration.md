# Path-Based Routing Migration Guide

## Overview

This document outlines the architectural considerations for migrating from query parameter-based workspace selection to a path-based routing approach. The goal is to create a more RESTful URL structure where workspaces are represented as path segments rather than query parameters.

## Current Architecture

Currently, FlowForm uses query parameters for workspace selection:

```
/dashboard?workspace=uuid-of-workspace
/dashboard/settings?workspace=uuid-of-workspace
```

## Target Architecture

The target architecture will use path-based routing following Typeform's approach, which decouples forms from workspaces in the URL structure:

```
# Workspace context
/dashboard/workspace/{workspaceId}/
/dashboard/workspace/{workspaceId}/settings

# Forms as separate resources (not nested under workspaces)
/dashboard/form/{formId}
/dashboard/form/{formId}/create
/dashboard/form/{formId}/preview
/dashboard/form/{formId}/results
```

This approach maintains workspace context in application state rather than the URL when working with forms.

## Benefits of This Approach

1. **Streamlined Form URLs**: Forms have cleaner, more shareable URLs without workspace context
2. **Workspace-Context for Admin**: Workspace management explicitly shows context in the URL
3. **More Flexible Relationships**: Forms can be moved between workspaces without URL changes
4. **Improved SEO**: Path segments are better for SEO than query parameters
5. **Consistent with Typeform's UX**: Familiar pattern for users who have used similar products

## Migration Planning

### 1. Next.js App Router Considerations

The App Router requires specific folder structures for route definition:

- Create a `/app/dashboard/workspace/[workspaceId]` directory for workspace management
- Maintain separate `/app/dashboard/form/[formId]` directory for forms
- Keep form pages independent of workspace URL structure
- Update all `page.tsx` files to accommodate the appropriate contexts

### 2. Component Updates

- Update all navigation components to include workspace context
- Update all links to use the new URL structure
- Ensure breadcrumbs correctly display the workspace hierarchy

### 3. Route Parameter and State Management

- For workspace pages: Replace query parameter access (`searchParams.get('workspace')`) with route parameters (`params.workspaceId`)
- For form pages: Maintain workspace context in application state
- Create a mechanism to persist current workspace selection across form navigation
- Ensure the workspace switcher updates both state and URL appropriately

### 4. API Endpoints

- Consider whether API endpoints should mirror the frontend structure
- Update any API routes that need to be workspace-specific

### 5. State Management

- Update Zustand store to handle workspace selection via route parameters for workspace pages
- Implement state persistence for workspace context when navigating to form pages
- Ensure SWR cache keys account for workspace context even when not in URL
- Update workspace switching logic to navigate using the new URL structure while preserving context

### 6. Authorization & Access Control

- Implement middleware to validate workspace access permissions
- Handle cases where users attempt to access unauthorized workspaces
- Create proper redirection flows for unauthorized access

### 7. Navigation Guards

- Implement navigation guards to prevent unauthorized workspace access
- Handle edge cases like invalid workspace IDs
- Create fallback behavior when workspace IDs don't exist

### 8. Testing Considerations

- Write comprehensive tests for the new routing structure
- Test all permutations of workspace access
- Ensure backward compatibility with existing links
- Test navigation flows between workspaces

## Migration Strategy

### Phase 1: Preparation

1. Create a parallel path-based routing structure without removing query parameter support
2. Build navigation guards and access control for the new routes
3. Create utility functions to generate URLs for both old and new structures

### Phase 2: Component Migration

1. Update shared components to support both routing patterns
2. Gradually migrate individual page components to the new structure
3. Test each page thoroughly after migration

### Phase 3: Transition

1. Implement redirects from old to new URL patterns
2. Update all internal links to use the new structure
3. Monitor error rates and user feedback

### Phase 4: Cleanup

1. Remove old query parameter handling code
2. Remove redirects after sufficient time has passed
3. Clean up any unused components or helpers

## Potential Challenges

1. **Context Preservation**: Maintaining workspace context when navigating between forms
2. **Deep Linking**: Ensuring all shared/bookmarked links continue to work
3. **Browser History**: Handling browser history correctly during the transition
4. **Breadcrumb Navigation**: Showing correct workspace context even when not in URL
5. **Form Ownership**: Managing which workspace a form belongs to without URL indicators
6. **Third-party Integrations**: Updating any external tools that link to your app
7. **Performance**: Monitoring performance impacts of the state persistence mechanism

## Conclusion

Moving to path-based routing is a significant architectural improvement but requires careful planning and execution. By following this guide, you can minimize disruption while achieving a more maintainable and user-friendly URL structure.

## Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [URL Structure Best Practices](https://developers.google.com/search/docs/crawling-indexing/url-structure)
- [REST API URL Design](https://restfulapi.net/resource-naming/)
