"use client"

import MegaNavbar from "@/components/layout/public/MegaNavbar"
import FooterBar from "@/components/layout/public/FooterBar"
import StartupsHero from "@/components/sections/solutions/StartupsHero"
import StartupsUseCases from "@/components/sections/solutions/StartupsUseCases"
import StartupsTestimonials from "@/components/sections/solutions/StartupsTestimonials"
import StartupsCTA from "@/components/sections/solutions/StartupsCTA"

export default function StartupsPage() {
  return (
    <>
      <MegaNavbar />
      <main>
        <StartupsHero />
        <StartupsUseCases />
        <StartupsTestimonials />
        <StartupsCTA />
      </main>
      <FooterBar />
    </>
  )
}
