"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

export default function CareersCTA() {
  return (
    <section className="py-16 md:py-24 bg-blue-50">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Interested in joining our team?
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Even though we don&apos;t have open positions right now, we&apos;re always looking to connect with talented individuals who share our vision
        </p>
        <Button size="lg" className="flex items-center mx-auto">
          <Mail className="h-4 w-4 mr-2" />
          Get in Touch
        </Button>
      </div>
    </section>
  )
}
