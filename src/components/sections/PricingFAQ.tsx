"use client";

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

// FAQ data
const faqs = [
  [
    { type: "question", content: 'What are the benefits of a paid vs free plan?' },
    { type: "answer", content: 'The free plan allows you to create unlimited forms with up to 100 responses per month. Paid plans offer more responses, additional users, advanced features like logic branching, custom branding, and premium support.' }
  ],
  [
    { type: "question", content: 'Can I upgrade, downgrade, or switch between plans?' },
    { type: "answer", content: 'Yes, you can upgrade or downgrade your plan at any time. When upgrading, you\'ll be billed the prorated amount for the remainder of your billing cycle. When downgrading, the new lower price will apply at the start of your next billing cycle.' }
  ],
  [
    { type: "question", content: 'Do you offer discounts if I pay yearly instead of monthly?' },
    { type: "answer", content: 'Yes, we offer approximately 16-17% discount when paying annually instead of monthly, which equals about 2 months free.' }
  ],
  [
    { type: "question", content: 'Is there a limit to the number of responses I can collect?' },
    { type: "answer", content: 'Each plan has a specified monthly response limit. If you exceed this limit, you\'ll be charged a small fee per additional response or you can upgrade to a higher tier plan.' }
  ],
  [
    { type: "question", content: 'What happens if I cancel my subscription?' },
    { type: "answer", content: 'You can continue using FlowForm until the end of your current billing cycle. After that, your account will be downgraded to the free plan with its limitations.' }
  ],
  [
    { type: "question", content: 'How secure is FlowForm?' },
    { type: "answer", content: 'FlowForm takes security seriously. We use industry-standard encryption, regular security audits, and secure data handling practices. Business and Enterprise plans include additional security features like SSO and HIPAA compliance.' }
  ],
  [
    { type: "question", content: 'What can I do with my data once it\'s collected?' },
    { type: "answer", content: 'You can view responses within FlowForm, export to CSV/Excel, connect to third-party tools via our integrations, analyze results with our built-in analytics, and set up email notifications for new responses.' }
  ],
];

export default function PricingFAQ() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container px-4 md:px-6 mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Frequently asked questions
        </h2>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => {
            // Extract question and answer from the array
            const questionObj = faq[0];
            const answerObj = faq[1];
            
            return (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">
                  {questionObj.content}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-500">
                    {answerObj.content}
                  </p>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
        
        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">
            Have additional questions?
          </p>
          <Button asChild>
            <Link href="/contact">
              Contact our sales team
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
