"use client";

import React from 'react';
import { Rocket, Heart, Lightbulb, Users } from 'lucide-react';

export default function CareersValues() {
  const values = [
    {
      icon: <Rocket className="h-8 w-8 text-blue-500" />,
      title: "Innovation First",
      description: "We push boundaries and challenge the status quo to build better form experiences"
    },
    {
      icon: <Users className="h-8 w-8 text-purple-500" />,
      title: "User-Centered",
      description: "Every decision we make starts with the question: how does this benefit our users?"
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-yellow-500" />,
      title: "Continuous Learning",
      description: "We're curious by nature and committed to growing both personally and professionally"
    },
    {
      icon: <Heart className="h-8 w-8 text-red-500" />,
      title: "Work with Heart",
      description: "We're passionate about what we do and we bring that energy to our work every day"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-center">
          Our Values
        </h2>
        <p className="text-xl text-gray-500 mb-12 text-center max-w-3xl mx-auto">
          These principles guide everything we do at FlowForm
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center text-center h-full">
              <div className="mb-4">
                {value.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
              <p className="text-gray-500">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
