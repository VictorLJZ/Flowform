# JSONB Migration Plan for Trip Details

## Overview

This document outlines the plan to migrate trip details in the Sword Travel application from individual columns to structured JSONB fields. This approach will provide better data organization, flexibility, and a more maintainable codebase.

## Current Structure

Currently, the `travel_sessions` table uses separate scalar columns for trip details:

```sql
origin TEXT,
destination TEXT,
start_date TIMESTAMP WITH TIME ZONE,
end_date TIMESTAMP WITH TIME ZONE,
date_flexibility INTEGER,
travelers INTEGER,
budget TEXT CHECK (budget IN ('any', 'budget', 'moderate', 'high-end', 'luxury'))
```

## New JSONB Structure

We will replace these columns with structured JSONB fields:

### Origin & Destination

Both origin and destination will use the same structure:

```json
{
  "name": "",
  "type": "",
  "placeId": "",
  "fullName": "",
  "photoUrl": null,
  "coordinates": {
    "lat": 0,
    "lng": 0
  }
}
```

### Travelers

```json
{
  "pets": 0,
  "adults": 1,
  "infants": 0,
  "children": 0
}
```

### Dates

```json
{
  "end": "YYYY-MM-DD",    // ISO 8601 format
  "range": "0",          // Flexibility in days
  "start": "YYYY-MM-DD"  // ISO 8601 format
}
```

### Budget

```json
{
  "level": "any"
}
```

## Implementation Plan

### 1. Database Schema Changes

```sql
-- Drop old columns and add new JSONB columns
ALTER TABLE travel_sessions
DROP COLUMN origin,
DROP COLUMN destination,
DROP COLUMN start_date,
DROP COLUMN end_date,
DROP COLUMN date_flexibility,
DROP COLUMN travelers,
DROP COLUMN budget,
ADD COLUMN origin_data JSONB DEFAULT '{"name":"","type":"","placeId":"","fullName":"","photoUrl":null,"coordinates":{"lat":0,"lng":0}}',
ADD COLUMN destination_data JSONB DEFAULT '{"name":"","type":"","placeId":"","fullName":"","photoUrl":null,"coordinates":{"lat":0,"lng":0}}',
ADD COLUMN travelers_data JSONB DEFAULT '{"pets":0,"adults":1,"infants":0,"children":0}',
ADD COLUMN dates_data JSONB DEFAULT '{"end":"","range":"0","start":""}', -- Will store dates in ISO 8601 format (YYYY-MM-DD)
ADD COLUMN budget_data JSONB DEFAULT '{"level":"any"}';
```

### 2. TypeScript Type Updates

#### New Types in `/src/types/session.ts`

```typescript
// Location structure for Origin/Destination
export interface LocationData {
  name: string;
  type: string;
  placeId: string;
  fullName: string;
  photoUrl: string | null;
  coordinates: {
    lat: number;
    lng: number;
  };
}

// Travelers structure
export interface TravelersData {
  pets: number;
  adults: number;
  infants: number;
  children: number;
}

// Dates structure
export interface DatesData {
  start: string; // ISO 8601 format (YYYY-MM-DD)
  end: string;   // ISO 8601 format (YYYY-MM-DD)
  range: string; // String representation of flexibility in days
}

// Budget structure
export interface BudgetData {
  level: 'any' | 'budget' | 'moderate' | 'high-end' | 'luxury';
}

// Updated TripDetails interface
export interface TripDetails {
  origin?: LocationData;
  destination?: LocationData;
  travelers?: TravelersData;
  dates?: DatesData;
  budget?: BudgetData;
}
```

#### Update Supabase Types in `/src/types/supabase.ts`

```typescript
export type TravelSessionRow = {
  id: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  title: string | null;
  description: string | null;
  status: 'active' | 'inactive';
  origin_data: LocationData | null;
  destination_data: LocationData | null;
  travelers_data: TravelersData | null;
  dates_data: DatesData | null;
  budget_data: BudgetData | null;
};

// Also update TravelSessionInsert and TravelSessionUpdate similarly
```

## Implementation Checklist

### Database Changes

- [x] Update `DatabaseSchema.md` to reflect the new JSONB structure
- [x] Prepare SQL migration script to update the Supabase schema
- [ ] Update date format from MMDDYYYY to ISO 8601 (YYYY-MM-DD)
- [ ] Execute migration on development environment
- [ ] Verify database schema changes

### Type Definitions

- [x] Update `/src/types/session.ts` with new interfaces
  - [x] Add `LocationData` interface
  - [x] Add `TravelersData` interface
  - [x] Add `DatesData` interface
  - [x] Add `BudgetData` interface
  - [x] Update `TripDetails` interface to use new types
- [x] Update `/src/types/supabase.ts`
  - [x] Update `TravelSessionRow` type
  - [x] Update `TravelSessionInsert` type
  - [x] Update `TravelSessionUpdate` type

### Application Code Updates

- [x] Update `/src/store/session-core-store.ts`
  - [x] Modify state to use new JSONB-structured fields
  - [x] Update setter/getter methods
  - [x] Update any methods that interact with trip details

- [ ] Update form components
  - [ ] Location selection components for origin/destination
  - [ ] Date selection components
  - [ ] Traveler selection components
  - [ ] Budget selection components

- [x] Update `/src/store/session-store.ts`
  - [x] Update real-time subscription handling for new fields
  - [x] Modify any Supabase queries that filter by the changed fields

- [ ] Update UI components that display trip details
  - [ ] Trip overview components
  - [ ] Session details pages
  - [ ] Any components that directly read or display trip details

### Testing

- [ ] Test creating new sessions with JSONB fields
- [ ] Test updating session details
- [ ] Test UI components that interact with these fields
- [ ] Verify realtime updates work correctly with new structure

## Benefits of JSONB Approach

1. **Structured Data**: Better organization of related information
2. **Flexibility**: Easier to extend with new fields without schema changes
3. **Type Safety**: More precise TypeScript types for complex nested structures
4. **Performance**: Reduced column count and better indexed JSON queries
5. **Feature Enhancement**: Support for richer data like coordinates, place IDs, and photos

## Notes on Implementation

- When implementing location selection, ensure all fields in the LocationData structure are populated
- For date fields, maintain string format (`MMDDYYYY`) for consistency with UI
- Default values are important for backward compatibility
- Consider adding helper functions for common operations on these JSONB fields
