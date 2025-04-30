"use client";

import { Switch } from '@/components/ui/switch'

interface PricingHeroProps {
  isAnnual: boolean;
  setIsAnnual: (value: boolean) => void;
}

export default function PricingHero({ isAnnual, setIsAnnual }: PricingHeroProps) {
  return (
    <section className="py-16 md:py-24 bg-white border-b border-gray-100">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Choose the right plan for your needs
        </h1>
        <p className="text-xl text-gray-500 mb-8 max-w-3xl mx-auto">
          Build better forms with the features that help you understand your customers
        </p>
        
        {/* Billing toggle */}
        <div className="flex items-center justify-center mb-10 mt-10">
          <span className={`mr-3 text-sm ${!isAnnual ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <Switch
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
          />
          <span className={`ml-3 text-sm ${isAnnual ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
            Annually <span className="text-green-500 font-medium">(Save ~16%)</span>
          </span>
        </div>
      </div>
    </section>
  )
}
