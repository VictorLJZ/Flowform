"use client"

import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Rocket } from "lucide-react"

export default function StartupsHero() {
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
              <div className="bg-orange-50 text-orange-600 rounded-full inline-flex items-center px-3 py-1 text-sm font-medium mb-6">
                <Rocket className="w-4 h-4 mr-2" />
                <span>Startups</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                Validate ideas and
                <span className="text-orange-600"> grow faster</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Affordable, scalable form solutions to help startups collect crucial feedback, validate ideas, and make data-driven decisions without breaking the bank.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                  Start for free
                </Button>
                <Button size="lg" variant="outline">
                  Startup pricing
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
              <div className="bg-gradient-to-r from-orange-100 to-orange-50 rounded-2xl p-1">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                  <div className="p-6 bg-orange-50 border-b border-orange-100">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <div className="ml-4 text-sm text-gray-500">MVP Validation Dashboard</div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-6">
                      <div className="text-sm font-medium text-gray-700 mb-3">Market Validation Results</div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">87%</div>
                          <div className="text-xs text-gray-500">Problem Validation</div>
                          <div className="text-xs text-green-600 mt-1 flex items-center">
                            Users confirmed the problem
                          </div>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">74%</div>
                          <div className="text-xs text-gray-500">Solution Fit</div>
                          <div className="text-xs text-green-600 mt-1 flex items-center">
                            Would use our solution
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">63%</div>
                          <div className="text-xs text-gray-500">Willingness to Pay</div>
                          <div className="text-xs text-orange-600 mt-1 flex items-center">
                            Would pay for solution
                          </div>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">42</div>
                          <div className="text-xs text-gray-500">Early Adopters</div>
                          <div className="text-xs text-green-600 mt-1 flex items-center">
                            Waitlist signups
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-3">User Feedback</div>
                      <div className="space-y-2">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-xs text-gray-600">
                            "This solves a huge pain point for me. I've been looking for something like this for months!"
                          </div>
                          <div className="text-xs text-gray-500 mt-2">Sarah T. - Product Manager</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-xs text-gray-600">
                            "I would definitely use this. The current solutions in the market are too expensive and complicated."
                          </div>
                          <div className="text-xs text-gray-500 mt-2">John M. - Startup Founder</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-orange-200/50 rounded-full blur-xl"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-orange-100 rounded-full blur-xl"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
