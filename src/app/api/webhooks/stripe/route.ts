import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Use the latest API version
});

// Webhook signing secret from your Stripe dashboard
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    // Get the request body as text
    const payload = await req.text();
    
    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature');
    
    if (!signature || !endpointSecret) {
      console.error('Missing stripe signature or webhook secret');
      return NextResponse.json(
        { error: 'Missing stripe signature or webhook secret' },
        { status: 400 }
      );
    }

    // Verify the event
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient();
    
    // Log the event to the database for audit purposes
    const { data: eventData, error: eventError } = await supabase
      .from('payment_events')
      .insert({
        event_id: event.id,
        event_type: event.type,
        event_data: event.data.object,
        processed: false,
      });
      
    if (eventError) {
      console.error('Error logging payment event:', eventError);
    }

    // Handle the event based on its type
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Only process if payment was successful
        if (session.payment_status === 'paid') {
          await handleSuccessfulPayment(session, supabase);
        }
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription, supabase);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(subscription, supabase);
        break;
      }
      
      // Add more event types as needed
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark the event as processed
    const { error: updateError } = await supabase
      .from('payment_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('event_id', event.id);
      
    if (updateError) {
      console.error('Error updating payment event status:', updateError);
    }

    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle a successful payment from Stripe Checkout
 */
async function handleSuccessfulPayment(
  session: Stripe.Checkout.Session,
  supabase: any
) {
  try {
    // Extract the customer ID and metadata
    const customerId = session.customer as string;
    const userId = session.client_reference_id; // This should be set when creating the checkout session
    const metadata = session.metadata || {};
    
    if (!userId) {
      console.error('No user ID found in session metadata');
      return;
    }
    
    // Get the subscription ID if available
    let subscriptionId = session.subscription as string;
    
    // If no subscription, this might be a one-time payment
    if (!subscriptionId) {
      console.log('One-time payment detected, handling accordingly');
      // For one-time payments, you might want to create a manual subscription record
      // with a specific duration
      
      // Determine the plan from metadata or line items
      const planName = metadata.plan || 'pro'; // Default to pro if not specified
      
      // Create a subscription record without a Stripe subscription ID
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          workspace_id: metadata.workspace_id,
          status: 'active',
          plan: planName,
          customer_id: customerId,
          current_period_start: new Date().toISOString(),
          // For one-time payments, set end date based on the plan duration
          current_period_end: new Date(
            new Date().setMonth(new Date().getMonth() + (planName === 'pro' ? 1 : 12))
          ).toISOString(),
          cancel_at_period_end: true,
          metadata: { 
            checkout_session_id: session.id,
            payment_intent: session.payment_intent
          }
        });
        
      if (error) {
        console.error('Error creating subscription record:', error);
      }
      
      return;
    }
    
    // For subscription payments, get the subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Get the price ID and product details
    const priceId = subscription.items.data[0].price.id;
    const productId = subscription.items.data[0].price.product as string;
    
    // Get the product to determine the plan name
    const product = await stripe.products.retrieve(productId);
    const planName = product.metadata.plan_name || 
                    (priceId.includes('pro') ? 'pro' : 
                     priceId.includes('business') ? 'business' : 'pro');
    
    // Create or update the subscription in the database
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        workspace_id: metadata.workspace_id,
        status: subscription.status,
        plan: planName,
        price_id: priceId,
        subscription_id: subscriptionId,
        customer_id: customerId,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        metadata: { checkout_session_id: session.id }
      }, {
        onConflict: 'user_id,workspace_id'
      });
      
    if (error) {
      console.error('Error updating subscription:', error);
    }
    
    console.log(`Subscription ${subscriptionId} processed for user ${userId}`);
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription,
  supabase: any
) {
  try {
    // Find the subscription in our database
    const { data: existingSubscriptions, error: findError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('subscription_id', subscription.id);
      
    if (findError || !existingSubscriptions || existingSubscriptions.length === 0) {
      console.error('Subscription not found in database:', subscription.id);
      return;
    }
    
    const existingSubscription = existingSubscriptions[0];
    
    // Update the subscription details
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingSubscription.id);
      
    if (updateError) {
      console.error('Error updating subscription:', updateError);
    }
    
    console.log(`Subscription ${subscription.id} updated`);
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

/**
 * Handle subscription cancellations
 */
async function handleSubscriptionCancellation(
  subscription: Stripe.Subscription,
  supabase: any
) {
  try {
    // Find the subscription in our database
    const { data: existingSubscriptions, error: findError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('subscription_id', subscription.id);
      
    if (findError || !existingSubscriptions || existingSubscriptions.length === 0) {
      console.error('Subscription not found in database:', subscription.id);
      return;
    }
    
    const existingSubscription = existingSubscriptions[0];
    
    // Update the subscription status
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('id', existingSubscription.id);
      
    if (updateError) {
      console.error('Error updating subscription:', updateError);
    }
    
    console.log(`Subscription ${subscription.id} canceled`);
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}
