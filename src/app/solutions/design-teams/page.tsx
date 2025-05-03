"use client"

import MegaNavbar from "@/components/layout/public/MegaNavbar"
import FooterBar from "@/components/layout/public/FooterBar"
import DesignHero from "@/components/sections/solutions/DesignHero"
import DesignUseCases from "@/components/sections/solutions/DesignUseCases"
import DesignTestimonials from "@/components/sections/solutions/DesignTestimonials"
import DesignCTA from "@/components/sections/solutions/DesignCTA"

export default function DesignTeamsPage() {
  return (
    <>
      <MegaNavbar />
      <main>
        <DesignHero />
        <DesignUseCases />
        <DesignTestimonials />
        <DesignCTA />
      </main>
      <FooterBar />
    </>
  )
}
