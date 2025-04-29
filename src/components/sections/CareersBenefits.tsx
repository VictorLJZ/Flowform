"use client";

import React from 'react';
import { Clock, Globe, Heart, Sparkles, BookOpen, Backpack } from 'lucide-react';

export default function CareersBenefits() {
  const benefits = [
    {
      icon: <Clock className="h-6 w-6 text-blue-500" />,
      title: "Flexible Working Hours",
      description: "Work when you're most productive with our flexible schedule policy"
    },
    {
      icon: <Globe className="h-6 w-6 text-green-500" />,
      title: "Remote-First Culture",
      description: "Work from anywhere in the world with our distributed team approach"
    },
    {
      icon: <Heart className="h-6 w-6 text-red-500" />,
      title: "Comprehensive Healthcare",
      description: "We offer premium health, dental, and vision insurance for you and your family"
    },
    {
      icon: <Sparkles className="h-6 w-6 text-purple-500" />,
      title: "Wellness Program",
      description: "Monthly wellness stipend to support your physical and mental health"
    },
    {
      icon: <BookOpen className="h-6 w-6 text-yellow-500" />,
      title: "Learning Budget",
      description: "Annual budget for courses, books, and conferences to help you grow"
    },
    {
      icon: <Backpack className="h-6 w-6 text-indigo-500" />,
      title: "Generous PTO",
      description: "Take the time you need to recharge with our unlimited vacation policy"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-50 border-t border-gray-100">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-center">
          Life at FlowForm
        </h2>
        <p className="text-xl text-gray-500 mb-12 text-center max-w-3xl mx-auto">
          We believe in creating an environment where our team can thrive
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-start space-x-4 h-full">
              <div className="flex-shrink-0">
                {benefit.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-500">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
