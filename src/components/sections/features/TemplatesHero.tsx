"use client"

import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { LayoutTemplate } from "lucide-react"
import Image from "next/image"

export default function TemplatesHero() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-primary/10 text-primary rounded-full inline-flex items-center px-3 py-1 text-sm font-medium mb-6">
                <LayoutTemplate className="w-4 h-4 mr-2" />
                <span>Ready-to-Use</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                Templates for 
                <span className="text-primary"> every use case</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Get started quickly with pre-built form templates designed for businesses, researchers, educators, and more. Customize to fit your needs in minutes.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg">
                  Browse Templates
                </Button>
                <Button size="lg" variant="outline">
                  See Customer Stories
                </Button>
              </div>
            </motion.div>
          </div>
          <div className="lg:col-span-6 mt-12 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-6">
                  <div className="bg-blue-50 rounded-xl p-4 shadow-sm">
                    <div className="mb-2 flex items-center">
                      <div className="bg-blue-500 w-3 h-3 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-blue-700">Customer Feedback</span>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-3 text-sm text-gray-600">
                      20+ questions designed to capture detailed product feedback
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 shadow-sm">
                    <div className="mb-2 flex items-center">
                      <div className="bg-green-500 w-3 h-3 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-green-700">Event Registration</span>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-3 text-sm text-gray-600">
                      Simple yet complete registration with scheduling options
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-6 pt-10">
                  <div className="bg-purple-50 rounded-xl p-4 shadow-sm">
                    <div className="mb-2 flex items-center">
                      <div className="bg-purple-500 w-3 h-3 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-purple-700">Market Research</span>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-3 text-sm text-gray-600">
                      Comprehensive survey with demographic and preference questions
                    </div>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 shadow-sm">
                    <div className="mb-2 flex items-center">
                      <div className="bg-amber-500 w-3 h-3 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-amber-700">Job Application</span>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-3 text-sm text-gray-600">
                      Professional application form with resume upload and screening
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-100 rounded-full blur-xl"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
