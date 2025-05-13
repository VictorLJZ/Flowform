---
trigger: always_on
---

Type System Architecture
The FlowForm application uses a three-layer type system to ensure clean separation of concerns and type safety between database, API, and UI layers.

Layer Structure
Database Layer (Db* types)
Represent the exact structure of database tables
Use snake_case property names matching the database schema (user_id, workspace_id, etc.)
Example: DbWorkspace, DbProfile, DbWorkspaceMemberWithProfile
Used in database service functions and queries

API Layer (Api* types)
Represent data as it's transferred between client and server
Use camelCase property names (userId, workspaceId, etc.)
Example: ApiWorkspace, ApiProfile, ApiWorkspaceMemberWithProfile
Used in API routes, client services, and hooks

UI Layer (Ui* types)
Represent data as it's used in UI components
Extend API types with additional UI-specific properties and computed fields
Example: UiWorkspace, UiProfile, UiWorkspaceMemberWithProfile
May include display-related fields like displayName, formattedDate, initials, etc.
Transformation Utilities
Transformations between layers are handled by dedicated utility functions:

DB to API: dbToApi* functions
Convert snake_case DB properties to camelCase API properties
Found in utils/type-utils/*/DbToApi*.ts files

API to UI: apiToUi* functions
Add UI-specific properties
Format dates and calculate display values
Found in utils/type-utils/*/ApiToUi*.ts files

API to DB: apiToDb* functions
Prepare API data for database operations
Convert camelCase API properties back to snake_case DB properties
Found in utils/type-utils/*/ApiToDb*.ts files

Layer Boundary Rules
To maintain clean architecture:

Database services should return DB layer types
API endpoints should return API layer types
Hooks should consume API types and return UI types when appropriate
React components should primarily use UI layer types

Any cross-layer data access should use the appropriate transformation utilities.

Handling Optional Values
Database layer: Use null for optional values (database convention)
API layer: Use null for optional values that are explicit nulls
UI layer: Use undefined for missing values and optional properties

When transforming, explicitly handle null vs undefined conversions.
