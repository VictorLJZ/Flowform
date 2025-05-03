"use client"

import MegaNavbar from "@/components/layout/public/MegaNavbar"
import FooterBar from "@/components/layout/public/FooterBar"
import GuideHeader from "@/components/sections/guides/GuideHeader"
import GuideWelcome from "@/components/sections/guides/GuideWelcome"
import GuideFormBasics from "@/components/sections/guides/GuideFormBasics"
import GuideQuestionTypes from "@/components/sections/guides/GuideQuestionTypes"
import GuideBranchingLogic from "@/components/sections/guides/GuideBranchingLogic"
import GuideResponsesAnalytics from "@/components/sections/guides/GuideResponsesAnalytics"

export default function FlowForm101GuidePage() {
  return (
    <>
      <MegaNavbar />
      <main>
        <GuideHeader />
        <GuideWelcome />
        <GuideFormBasics />
        <GuideQuestionTypes />
        <GuideBranchingLogic />
        <GuideResponsesAnalytics />
      </main>
      <FooterBar />
    </>
  )
}
