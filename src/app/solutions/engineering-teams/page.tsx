"use client"

import MegaNavbar from "@/components/layout/public/MegaNavbar"
import FooterBar from "@/components/layout/public/FooterBar"
import EngineeringHero from "@/components/sections/solutions/EngineeringHero"
import EngineeringUseCases from "@/components/sections/solutions/EngineeringUseCases"
import EngineeringTestimonials from "@/components/sections/solutions/EngineeringTestimonials"
import EngineeringCTA from "@/components/sections/solutions/EngineeringCTA"

export default function EngineeringTeamsPage() {
  return (
    <>
      <MegaNavbar />
      <main>
        <EngineeringHero />
        <EngineeringUseCases />
        <EngineeringTestimonials />
        <EngineeringCTA />
      </main>
      <FooterBar />
    </>
  )
}
