"use client";

import React from 'react';
import Image from 'next/image';

export default function CareersHero() {
  return (
    <section className="py-16 md:py-24 bg-white border-b border-gray-100">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Join our mission to make forms better
        </h1>
        <p className="text-xl text-gray-500 mb-8 max-w-3xl mx-auto">
          We&apos;re building the next generation of intelligent form tools that help businesses connect with their users
        </p>
        <div className="mt-8">
          <Image 
            src="/images/team.jpg" 
            alt="FlowForm Team" 
            width={1200}
            height={600}
            className="rounded-lg shadow-md max-w-4xl mx-auto"
            onError={() => {
              // This will be handled by Next.js built-in error handling
              console.log('Image failed to load, falling back to placeholder');
            }}
          />
        </div>
      </div>
    </section>
  )
}
