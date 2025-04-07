"use client";

import MegaNavbar from "@/components/layout/public/MegaNavbar";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import Testimonials from "@/components/sections/Testimonials";
import CallToAction from "@/components/sections/CallToAction";

export default function Home() {
  return (
    <>
      <MegaNavbar />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <CallToAction />
      </main>
    </>
  );
}
