"use client"

import MegaNavbar from "@/components/layout/public/MegaNavbar"
import FooterBar from "@/components/layout/public/FooterBar"
import MarketingHero from "@/components/sections/solutions/MarketingHero"
import MarketingUseCases from "@/components/sections/solutions/MarketingUseCases"
import MarketingTestimonials from "@/components/sections/solutions/MarketingTestimonials"
import MarketingCTA from "@/components/sections/solutions/MarketingCTA"

export default function MarketingTeamsPage() {
  return (
    <>
      <MegaNavbar />
      <main>
        <MarketingHero />
        <MarketingUseCases />
        <MarketingTestimonials />
        <MarketingCTA />
      </main>
      <FooterBar />
    </>
  )
}
