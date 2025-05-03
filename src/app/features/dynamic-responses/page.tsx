"use client"

import MegaNavbar from "@/components/layout/public/MegaNavbar"
import FooterBar from "@/components/layout/public/FooterBar"
import DynamicQuestionsHero from "@/components/sections/features/DynamicQuestionsHero"
import DynamicQuestionsFeatures from "@/components/sections/features/DynamicQuestionsFeatures"
import DynamicQuestionsDemo from "@/components/sections/features/DynamicQuestionsDemo"
import DynamicQuestionsCTA from "@/components/sections/features/DynamicQuestionsCTA"

export default function DynamicQuestionsPage() {
  return (
    <>
      <MegaNavbar />
      <main>
        <DynamicQuestionsHero />
        <DynamicQuestionsFeatures />
        <DynamicQuestionsDemo />
        <DynamicQuestionsCTA />
      </main>
      <FooterBar />
    </>
  )
}
