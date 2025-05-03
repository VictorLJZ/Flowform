"use client"

import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

export default function GuideHeader() {
  return (
    <section className="bg-gradient-to-b from-primary/10 to-white pt-20 pb-12 lg:pt-28 lg:pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center text-sm text-gray-500">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link href="/resources/guides" className="hover:text-primary">Guides</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-gray-900 font-medium">FlowForm 101</span>
        </div>
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                FlowForm 101: Getting Started
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Learn how to create forms, collect responses, and gain insights with FlowForm. This guide covers everything you need to know to get started with the platform.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
                <Button size="lg" asChild>
                  <Link href="/auth/signup">
                    Start creating for free
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/templates">
                    Browse templates
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
          
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-5 bg-primary/10">
                <h3 className="font-medium text-lg">Guide Contents</h3>
              </div>
              <ul className="divide-y divide-gray-100">
                <li>
                  <a href="#welcome" className="block px-5 py-3 hover:bg-gray-50 transition-colors">
                    <span className="font-medium text-primary">01</span>
                    <span className="ml-3 font-medium">Welcome to FlowForm</span>
                  </a>
                </li>
                <li>
                  <a href="#form-basics" className="block px-5 py-3 hover:bg-gray-50 transition-colors">
                    <span className="font-medium text-primary">02</span>
                    <span className="ml-3 font-medium">Form Basics</span>
                  </a>
                </li>
                <li>
                  <a href="#question-types" className="block px-5 py-3 hover:bg-gray-50 transition-colors">
                    <span className="font-medium text-primary">03</span>
                    <span className="ml-3 font-medium">Question Types</span>
                  </a>
                </li>
                <li>
                  <a href="#branching-logic" className="block px-5 py-3 hover:bg-gray-50 transition-colors">
                    <span className="font-medium text-primary">04</span>
                    <span className="ml-3 font-medium">Branching Logic</span>
                  </a>
                </li>
                <li>
                  <a href="#responses-analytics" className="block px-5 py-3 hover:bg-gray-50 transition-colors">
                    <span className="font-medium text-primary">05</span>
                    <span className="ml-3 font-medium">Responses & Analytics</span>
                  </a>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
