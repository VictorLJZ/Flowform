// Subscription status types
export type SubscriptionStatus = 
  | 'active' 
  | 'canceled' 
  | 'past_due' 
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired';

// Subscription plan types
export type PlanType = 'free' | 'pro' | 'business';

// Subscription table definition
export interface Subscription {
  id: string;
  user_id: string;
  workspace_id: string;
  status: SubscriptionStatus;
  plan: PlanType;
  price_id?: string | null;
  subscription_id?: string | null;
  customer_id?: string | null;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown> | null;
}

// Payment event table definition
export interface PaymentEvent {
  id: string;
  event_id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  processed: boolean;
  created_at: string;
  processed_at?: string | null;
}

// Stripe API subscription response type for webhook events
export interface SubscriptionWithTimestamps {
  id: string;
  status: string;
  current_period_start: number; // Unix timestamp
  current_period_end: number;   // Unix timestamp
  cancel_at_period_end: boolean;
  items: {
    data: Array<{
      price: {
        id: string;
        product: string;
      }
    }>
  };
}
