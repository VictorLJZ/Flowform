"use client"

import { useState } from 'react'
import MegaNavbar from '@/components/layout/public/MegaNavbar'
import FooterBar from '@/components/layout/public/FooterBar'
import PricingHero from '@/components/sections/PricingHero'
import PricingPlans from '@/components/sections/PricingPlans'
import PricingBrands from '@/components/sections/PricingBrands'
import PricingFAQ from '@/components/sections/PricingFAQ'

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  
  return (
    <>
      <MegaNavbar />
      <main className="flex flex-col min-h-screen">
        <PricingHero isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
        <PricingPlans isAnnual={isAnnual} />
        <PricingBrands />
        <PricingFAQ />
      </main>
      <FooterBar />
    </>
  )
}
