"use client"

import React from 'react'
import MegaNavbar from '@/components/layout/public/MegaNavbar'
import FooterBar from '@/components/layout/public/FooterBar'
import CareersHero from '@/components/sections/CareersHero'
import CareersValues from '@/components/sections/CareersValues'
import CareersOpenings from '@/components/sections/CareersOpenings'
import CareersBenefits from '@/components/sections/CareersBenefits'
import CareersCTA from '@/components/sections/CareersCTA'

export default function CareersPage() {
  return (
    <>
      <MegaNavbar />
      <main className="flex flex-col min-h-screen">
        <CareersHero />
        <CareersValues />
        <CareersOpenings />
        <CareersBenefits />
        <CareersCTA />
      </main>
      <FooterBar />
    </>
  )
}
