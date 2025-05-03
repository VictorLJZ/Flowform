"use client"

import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { GitBranch } from "lucide-react"

export default function BranchingHero() {
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
                <GitBranch className="w-4 h-4 mr-2" />
                <span>Advanced Logic</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                Powerful Branching 
                <span className="text-primary"> for smarter surveys</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Create personalized paths through your forms with our powerful conditional logic. Show or hide questions based on previous answers.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg">
                  Try Logic Builder
                </Button>
                <Button size="lg" variant="outline">
                  View Examples
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
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-1">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                  <div className="p-6 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <div className="ml-4 text-sm text-gray-500">Logic Flow Builder</div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-center">
                      <div className="relative">
                        {/* First question node */}
                        <div className="mb-14 w-64 bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-200 relative z-10">
                          <div className="text-sm font-medium text-blue-800 mb-2">Start Question</div>
                          <div className="text-sm text-gray-700 mb-2">How often do you exercise?</div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="bg-white p-1 rounded border border-gray-200 text-center">Daily</div>
                            <div className="bg-white p-1 rounded border border-gray-200 text-center">Weekly</div>
                            <div className="bg-white p-1 rounded border border-gray-200 text-center">Rarely</div>
                          </div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-8 bg-gray-200"></div>
                        </div>
                        
                        {/* Branching paths */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="relative">
                            <div className="h-16 border-l-2 border-b-2 border-gray-300 absolute -top-8 left-1/2 w-1/2 -ml-px rounded-bl-lg"></div>
                            <div className="bg-green-50 rounded-lg p-3 shadow-sm border border-green-200 text-sm">
                              <div className="text-xs font-medium text-green-800 mb-2">If "Daily"</div>
                              <div className="text-xs text-gray-700">What type of exercises?</div>
                            </div>
                          </div>
                          <div className="relative">
                            <div className="h-8 border-t-2 border-gray-300 absolute -top-8 left-0 w-full"></div>
                            <div className="bg-blue-50 rounded-lg p-3 shadow-sm border border-blue-200 text-sm">
                              <div className="text-xs font-medium text-blue-800 mb-2">If "Weekly"</div>
                              <div className="text-xs text-gray-700">How many days?</div>
                            </div>
                          </div>
                          <div className="relative">
                            <div className="h-16 border-r-2 border-b-2 border-gray-300 absolute -top-8 right-1/2 w-1/2 -mr-px rounded-br-lg"></div>
                            <div className="bg-amber-50 rounded-lg p-3 shadow-sm border border-amber-200 text-sm">
                              <div className="text-xs font-medium text-amber-800 mb-2">If "Rarely"</div>
                              <div className="text-xs text-gray-700">Why not more often?</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Common path */}
                        <div className="grid grid-cols-3 gap-4 items-start">
                          <div className="relative col-span-3">
                            <div className="h-8 border-l-2 border-r-2 border-b-2 border-gray-300 absolute -top-4 left-1/3 right-1/3 rounded-b-lg"></div>
                            <div className="bg-purple-50 rounded-lg p-3 shadow-sm border border-purple-200 text-sm mt-8 w-64 mx-auto">
                              <div className="text-xs font-medium text-purple-800 mb-2">End: All Paths</div>
                              <div className="text-xs text-gray-700">Health goals for next year?</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-purple-100 rounded-full blur-xl"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
