"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

export default function CareersOpenings() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-center">
          Open Positions
        </h2>
        <p className="text-xl text-gray-500 mb-12 text-center max-w-3xl mx-auto">
          Join our team and help us build the future of form experiences
        </p>
        
        <div className="bg-gray-50 rounded-xl p-8 md:p-12 text-center max-w-3xl mx-auto">
          <h3 className="text-2xl font-semibold mb-3">No Open Positions</h3>
          <p className="text-gray-500 mb-6">
            We don&apos;t have any open positions at the moment, but we&apos;re always looking for talented individuals to join our team.
          </p>
          <p className="text-gray-500 mb-8">
            If you believe you&apos;d be a great fit for FlowForm, feel free to send us your resume and we&apos;ll keep it on file for future opportunities.
          </p>
          <Button className="flex items-center mx-auto">
            <Mail className="h-4 w-4 mr-2" />
            Contact Us
          </Button>
        </div>
      </div>
    </section>
  )
}
