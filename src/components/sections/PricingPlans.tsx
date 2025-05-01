"use client";

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// Pricing plans data
const plans = [
  {
    name: 'Free',
    description: 'For individuals just getting started',
    price: { monthly: 0, annually: 0 },
    ctaText: 'Sign up',
    ctaLink: '/signup',
    popular: false,
    features: [
      '100 responses/mo',
      '1 user',
      'Unlimited forms',
      'Basic form elements',
      'Email notifications',
      'FlowForm branding',
    ],
  },
  {
    name: 'Pro',
    description: 'For professionals and small teams',
    price: { monthly: 20, annually: 17 },
    ctaText: 'Get Pro',
    ctaLinks: {
      monthly: 'https://buy.stripe.com/cN2eWQc1O4D08lqeUU',
      annually: 'https://buy.stripe.com/00g5mg0j6d9w1X228a'
    },
    popular: true,
    features: [
      '1,000 responses/mo',
      '3 users',
      'Unlimited forms',
      'Advanced form elements',
      'Logic branching',
      'File uploads',
      'Custom thank you page',
      'Remove FlowForm branding',
      'Custom subdomain',
    ],
  },
  {
    name: 'Business',
    description: 'For orgs needing advanced features',
    price: { monthly: 60, annually: 50 },
    ctaText: 'Get Business',
    ctaLinks: {
      monthly: 'https://buy.stripe.com/14kaGAfe0c5s1X2145',
      annually: 'https://buy.stripe.com/00gdSMfe03yWgRW003'
    },
    popular: false,
    features: [
      '10,000 responses/mo',
      '10 users',
      'Everything in Pro',
      'Drop-off rates',
      'Conversion tracking',
      'Salesforce integration',
      'Enterprise dashboard',
      'Multi-language forms',
      'Advanced security',
      'Priority support and live chat',
    ],
  },
  {
    name: 'Enterprise',
    description: 'Custom solutions for large orgs',
    price: { monthly: null, annually: null },
    ctaText: 'Contact Sales',
    ctaLink: '/contact',
    popular: false,
    features: [
      'Tailored response limits',
      'Custom number of users',
      'Dedicated account manager',
      'Premium support',
      'Custom domains',
      'Single Sign-On (SSO)',
      'HIPAA compliance',
      'Custom integrations',
      'Data residency options',
      'High volume capability',
    ],
  },
];

interface PricingPlansProps {
  isAnnual: boolean;
}

export default function PricingPlans({ isAnnual }: PricingPlansProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  
  // Function to handle payment button clicks
  const handlePaymentClick = useCallback(async (planName: string, planData: { monthly: string, annually: string }) => {
    // Mark this button as loading
    setIsLoading(planName);
    
    // Select the appropriate payment link based on billing cycle
    const paymentLink = isAnnual ? planData.annually : planData.monthly;
    
    try {
      // Check if user is logged in
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Auth error:', error);
        // If there's an auth error, redirect to login
        router.push(`/login?returnTo=${encodeURIComponent('/pricing')}&plan=${encodeURIComponent(planName.toLowerCase())}&annual=${isAnnual}`);
        return;
      }
      
      if (!user) {
        // Not logged in - redirect to login with return URL
        const loginUrl = `/login?returnTo=${encodeURIComponent('/pricing')}&plan=${encodeURIComponent(planName.toLowerCase())}&annual=${isAnnual}`;
        console.log('Redirecting to login with parameters:', { planName, isAnnual, loginUrl });
        router.push(loginUrl);
      } else {
        // User is logged in - proceed to payment
        if (paymentLink.startsWith('http')) {
          // External payment link - open in new tab
          window.open(paymentLink, '_blank');
        } else {
          // Internal link - navigate within the app
          router.push(paymentLink);
        }
      }
    } catch (err) {
      console.error('Payment click error:', err);
    } finally {
      setIsLoading(null);
    }
  }, [router]);
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`bg-white rounded-xl shadow-sm border ${plan.popular ? 'border-primary ring-2 ring-primary' : 'border-gray-200'} p-6 flex flex-col h-full relative`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-0 right-0 flex justify-center">
                  <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="mb-5">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
              </div>
              
              <div className="mb-6">
                {plan.price.monthly !== null ? (
                  <>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">
                        ${isAnnual ? plan.price.annually : plan.price.monthly}
                      </span>
                      <span className="text-gray-500 ml-1">/mo</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {isAnnual ? 'billed annually' : 'billed monthly'}
                    </p>
                  </>
                ) : (
                  <div className="text-xl font-semibold">Custom pricing</div>
                )}
              </div>
              
              <div className="space-y-3 flex-grow">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Button 
                  className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => plan.ctaLinks ? handlePaymentClick(plan.name, plan.ctaLinks) : handlePaymentClick(plan.name, { monthly: plan.ctaLink, annually: plan.ctaLink })}
                  disabled={isLoading === plan.name}
                >
                  {isLoading === plan.name ? 'Loading...' : plan.ctaText}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Link 
            href="/features/comparison"
            className="text-primary hover:underline font-medium"
          >
            Compare all features in detail
          </Link>
        </div>
      </div>
    </section>
  )
}
