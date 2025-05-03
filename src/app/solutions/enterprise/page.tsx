"use client"

import MegaNavbar from "@/components/layout/public/MegaNavbar"
import FooterBar from "@/components/layout/public/FooterBar"
import EnterpriseHero from "@/components/sections/solutions/EnterpriseHero"
import EnterpriseUseCases from "@/components/sections/solutions/EnterpriseUseCases"
import EnterpriseTestimonials from "@/components/sections/solutions/EnterpriseTestimonials"
import EnterpriseCTA from "@/components/sections/solutions/EnterpriseCTA"

export default function EnterprisePage() {
  return (
    <>
      <MegaNavbar />
      <main>
        <EnterpriseHero />
        <EnterpriseUseCases />
        <EnterpriseTestimonials />
        <EnterpriseCTA />
      </main>
      <FooterBar />
    </>
  )
}
