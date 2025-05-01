# FlowForm Subscription Schema

This document outlines the subscription tables needed for the FlowForm payment system.

## Subscription Management Tables

### 1. subscriptions

Stores user subscription information.

| Column           | Type                    | Description                       |
|------------------|-------------------------|-----------------------------------|
| id               | UUID                    | Primary key                       |
| user_id          | UUID                    | References auth.users.id          |
| workspace_id     | UUID                    | References workspaces.id          |
| status           | TEXT                    | Status (active, canceled, past_due, trialing, incomplete, incomplete_expired) |
| plan             | TEXT                    | Plan type (free, pro, business)   |
| price_id         | TEXT                    | Stripe price ID                   |
| subscription_id  | TEXT                    | Stripe subscription ID            |
| customer_id      | TEXT                    | Stripe customer ID                |
| current_period_start | TIMESTAMP WITH TIME ZONE | Current billing period start |
| current_period_end   | TIMESTAMP WITH TIME ZONE | Current billing period end   |
| cancel_at_period_end | BOOLEAN                 | Whether subscription ends at period end |
| created_at       | TIMESTAMP WITH TIME ZONE| When subscription was created     |
| updated_at       | TIMESTAMP WITH TIME ZONE| When subscription was last updated|
| metadata         | JSONB                   | Additional subscription metadata  |

#### Row Level Security Policies

| Policy Name | Command | Using (qual) | With Check |
|-------------|---------|--------------|------------|
| Users can view their own subscriptions | SELECT | `user_id = auth.uid()` | null |
| Users can view subscriptions for their workspaces | SELECT | `workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())` | null |
| Only service role can insert/update subscriptions | INSERT, UPDATE | `auth.uid() = '00000000-0000-0000-0000-000000000000'::uuid` | `auth.uid() = '00000000-0000-0000-0000-000000000000'::uuid` |

### 2. payment_events

Tracks Stripe webhook events.

| Column      | Type                    | Description                       |
|-------------|-------------------------|-----------------------------------|
| id          | UUID                    | Primary key                       |
| event_id    | TEXT                    | Stripe event ID                   |
| event_type  | TEXT                    | Stripe event type                 |
| event_data  | JSONB                   | Full event payload                |
| processed   | BOOLEAN                 | Whether event has been processed  |
| created_at  | TIMESTAMP WITH TIME ZONE| When event was received           |
| processed_at| TIMESTAMP WITH TIME ZONE| When event was processed          |

#### Row Level Security Policies

| Policy Name | Command | Using (qual) | With Check |
|-------------|---------|--------------|------------|
| Only service role can access payment events | ALL | `auth.uid() = '00000000-0000-0000-0000-000000000000'::uuid` | `auth.uid() = '00000000-0000-0000-0000-000000000000'::uuid` |
