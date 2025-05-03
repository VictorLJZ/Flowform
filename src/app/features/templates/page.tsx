"use client"

import MegaNavbar from "@/components/layout/public/MegaNavbar"
import FooterBar from "@/components/layout/public/FooterBar"
import TemplatesHero from "@/components/sections/features/TemplatesHero"
import TemplatesCategories from "@/components/sections/features/TemplatesCategories"
import TemplatesCTA from "@/components/sections/features/TemplatesCTA"

export default function TemplatesPage() {
  return (
    <>
      <MegaNavbar />
      <main>
        <TemplatesHero />
        <TemplatesCategories />
        <TemplatesCTA />
      </main>
      <FooterBar />
    </>
  )
}
