"use client"

import MegaNavbar from "@/components/layout/public/MegaNavbar"
import FooterBar from "@/components/layout/public/FooterBar"
import BranchingHero from "@/components/sections/features/BranchingHero"
import BranchingFeatures from "@/components/sections/features/BranchingFeatures"
import BranchingCTA from "@/components/sections/features/BranchingCTA"

export default function BranchingPage() {
  return (
    <>
      <MegaNavbar />
      <main>
        <BranchingHero />
        <BranchingFeatures />
        <BranchingCTA />
      </main>
      <FooterBar />
    </>
  )
}
