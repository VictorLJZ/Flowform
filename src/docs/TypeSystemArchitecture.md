# FlowForm Type System Architecture

## Overview

FlowForm implements a three-layer type system to ensure clean separation of concerns between database, API, and UI layers. This architecture improves type safety, maintainability, and developer experience by establishing clear boundaries between layers.

## Layer Structure

### 1. Database Layer (`Db*` types)

* **Naming Convention:** `DbWorkspace`, `DbProfile`, `DbWorkspaceMember`, etc.
* **Property Style:** snake_case (`user_id`, `workspace_id`, `created_at`)
* **Optional Values:** `null` (SQL database convention)
* **Purpose:** Represent exact database schema structure
* **Example:**
  ```typescript
  interface DbProfile {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
  }
  ```

### 2. API Layer (`Api*` types)

* **Naming Convention:** `ApiWorkspace`, `ApiProfile`, `ApiWorkspaceMember`, etc.
* **Property Style:** camelCase (`userId`, `workspaceId`, `createdAt`)
* **Optional Values:** `undefined` (TypeScript convention)
* **Purpose:** Represent data transferred between client and server
* **Example:**
  ```typescript
  interface ApiProfile {
    id: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
  }
  ```

### 3. UI Layer (`Ui*` types)

* **Naming Convention:** `UiWorkspace`, `UiProfile`, `UiWorkspaceMember`, etc.
* **Property Style:** camelCase with UI-specific properties
* **Optional Values:** `undefined` (TypeScript convention)
* **Purpose:** Represent data displayed in UI components with additional presentation properties
* **Example:**
  ```typescript
  interface UiProfile {
    id: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
    displayName: string;  // Computed property (email if no fullName)
    initials: string;     // Computed for avatar displays
    createdAt: string;
    updatedAt: string;
  }
  ```

## Type Transformations

Transformations between layers are handled by dedicated utility functions in the `/src/utils/type-utils/` directory.

### DB to API Transformations

* **Purpose:** Convert database objects to API format
* **Location:** `src/utils/type-utils/*/DbToApi*.ts` files
* **Transformations:**
  * Convert snake_case to camelCase
  * Convert `null` to `undefined` for optional values
* **Example:**
  ```typescript
  export function dbToApiProfile(dbProfile: DbProfile): ApiProfile {
    return {
      id: dbProfile.id,
      email: dbProfile.email,
      fullName: dbProfile.full_name === null ? undefined : dbProfile.full_name,
      avatarUrl: dbProfile.avatar_url === null ? undefined : dbProfile.avatar_url,
      createdAt: dbProfile.created_at,
      updatedAt: dbProfile.updated_at
    };
  }
  ```

### API to UI Transformations

* **Purpose:** Add UI-specific properties to API objects
* **Location:** `src/utils/type-utils/*/ApiToUi*.ts` files
* **Transformations:**
  * Add computed properties for display
  * Format dates and other values for presentation
  * No `null` to `undefined` conversion needed (API layer already uses `undefined`)
* **Example:**
  ```typescript
  export function apiToUiProfile(profile: ApiProfile): UiProfile {
    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl,
      displayName: profile.fullName || profile.email,
      initials: getInitials(profile.fullName),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    };
  }
  ```

### API to DB Transformations

* **Purpose:** Convert API objects back to database format for write operations
* **Location:** `src/utils/type-utils/*/ApiToDb*.ts` files
* **Transformations:**
  * Convert camelCase to snake_case
  * Convert `undefined` to `null` for optional values
* **Example:**
  ```typescript
  export function workspaceInputToDb(input: ApiWorkspaceInput): Omit<DbWorkspace, 'id' | 'updated_at'> {
    return {
      name: input.name,
      description: input.description === undefined ? null : input.description,
      created_by: input.createdBy,
      created_at: new Date().toISOString(),
      logo_url: input.logoUrl === undefined ? null : input.logoUrl,
      settings: input.settings === undefined ? null : input.settings
    };
  }
  ```

## Layer Boundaries

To maintain clean architecture, components should follow these rules:

1. **Database Services**
   * Should accept and return DB layer types
   * Example: Supabase query functions

2. **API Endpoints & Services**
   * Should consume and return API layer types
   * Should transform DB types to API types before returning
   * Example: API route handlers

3. **React Components**
   * Should primarily use UI layer types
   * Should never directly use DB layer types
   * Example: React components like `<MembersList />`

4. **Custom Hooks**
   * Should return UI types when used directly by components
   * Example: `useWorkspaceMembers()` returning `UiWorkspaceMember[]`

## Benefits of This Architecture

1. **Type Safety:** Clear type boundaries help catch errors at compile time
2. **Consistent Conventions:** Standardized handling of optional values:
   * Database: `null` (SQL standard)
   * TypeScript: `undefined` (TypeScript convention)
3. **Maintainability:** Separation of concerns improves code organization
4. **Developer Experience:** Consistent patterns make it easier to understand the codebase
5. **UI Flexibility:** UI-specific computed properties are isolated from API/DB concerns

## Handling Optional Values

* **Database Layer:** Use `null` for optional values
   * This matches SQL database conventions
   * Example: `full_name: string | null`

* **API & UI Layers:** Use `undefined` for optional values
   * This matches TypeScript conventions (optional properties)
   * Example: `fullName?: string` (equivalent to `fullName: string | undefined`)

* **Transformations:**
   * **DB → API:** Convert `null` to `undefined`
     ```typescript
     fullName: dbProfile.full_name === null ? undefined : dbProfile.full_name
     ```
   * **API → DB:** Convert `undefined` to `null`
     ```typescript
     full_name: input.fullName === undefined ? null : input.fullName
     ```

## Best Practices

1. Always use the appropriate transformation utilities when crossing layer boundaries
2. Never mix types from different layers (e.g., don't use DB types in UI components)
3. Format data for display only in the UI layer or in API-to-UI transformations
4. Validate data at each boundary to ensure type safety
5. Use TypeScript's optional properties (`prop?:`) in API and UI layers instead of union types (`prop: type | undefined`)
6. Always maintain consistency in how optional values are handled
