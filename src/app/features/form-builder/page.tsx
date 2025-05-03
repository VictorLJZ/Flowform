"use client"

import MegaNavbar from "@/components/layout/public/MegaNavbar"
import FooterBar from "@/components/layout/public/FooterBar"
import FormBuilderHero from "@/components/sections/features/FormBuilderHero"
import FormBuilderFeatures from "@/components/sections/features/FormBuilderFeatures"
import FormBuilderCTA from "@/components/sections/features/FormBuilderCTA"

export default function FormBuilderPage() {
  return (
    <>
      <MegaNavbar />
      <main>
        <FormBuilderHero />
        <FormBuilderFeatures />
        <FormBuilderCTA />
      </main>
      <FooterBar />
    </>
  )
}
