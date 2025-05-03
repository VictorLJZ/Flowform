"use client"

import MegaNavbar from "@/components/layout/public/MegaNavbar"
import FooterBar from "@/components/layout/public/FooterBar"
import ResearchHero from "@/components/sections/solutions/ResearchHero"
import ResearchUseCases from "@/components/sections/solutions/ResearchUseCases"
import ResearchTestimonials from "@/components/sections/solutions/ResearchTestimonials"
import ResearchCTA from "@/components/sections/solutions/ResearchCTA"

export default function ResearchTeamsPage() {
  return (
    <>
      <MegaNavbar />
      <main>
        <ResearchHero />
        <ResearchUseCases />
        <ResearchTestimonials />
        <ResearchCTA />
      </main>
      <FooterBar />
    </>
  )
}
