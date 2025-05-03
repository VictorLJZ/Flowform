"use client"

import MegaNavbar from "@/components/layout/public/MegaNavbar"
import FooterBar from "@/components/layout/public/FooterBar"
import AnalyticsHero from "@/components/sections/features/AnalyticsHero"
import AnalyticsFeatures from "@/components/sections/features/AnalyticsFeatures"
import AnalyticsCTA from "@/components/sections/features/AnalyticsCTA"

export default function AnalyticsPage() {
  return (
    <>
      <MegaNavbar />
      <main>
        <AnalyticsHero />
        <AnalyticsFeatures />
        <AnalyticsCTA />
      </main>
      <FooterBar />
    </>
  )
}
