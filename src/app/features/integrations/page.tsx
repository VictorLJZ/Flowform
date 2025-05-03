"use client"

import MegaNavbar from "@/components/layout/public/MegaNavbar"
import FooterBar from "@/components/layout/public/FooterBar"
import IntegrationsHero from "@/components/sections/features/IntegrationsHero"
import IntegrationsApps from "@/components/sections/features/IntegrationsApps"
import IntegrationsCTA from "@/components/sections/features/IntegrationsCTA"

export default function IntegrationsPage() {
  return (
    <>
      <MegaNavbar />
      <main>
        <IntegrationsHero />
        <IntegrationsApps />
        <IntegrationsCTA />
      </main>
      <FooterBar />
    </>
  )
}
