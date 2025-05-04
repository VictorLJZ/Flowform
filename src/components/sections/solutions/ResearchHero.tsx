"use client"

import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Microscope } from "lucide-react"

export default function ResearchHero() {
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
              <div className="bg-purple-50 text-purple-600 rounded-full inline-flex items-center px-3 py-1 text-sm font-medium mb-6">
                <Microscope className="w-4 h-4 mr-2" />
                <span>Research Teams</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                Research made 
                <span className="text-purple-600"> simple and powerful</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Collect high-quality data for academic and market research with advanced survey tools designed for researchers and analysts.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Start for free
                </Button>
                <Button size="lg" variant="outline">
                  View research templates
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
              <div className="bg-gradient-to-r from-purple-100 to-purple-50 rounded-2xl p-1">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                  <div className="p-6 bg-purple-50 border-b border-purple-100">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <div className="ml-4 text-sm text-gray-500">Research Survey Builder</div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-6">
                      <div className="text-sm font-medium text-gray-700 mb-3">Survey Design</div>
                      <div className="space-y-4">
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="text-sm font-medium mb-2">Question Type 1: Likert Scale</div>
                          <div className="text-xs text-gray-700 mb-3">How much do you agree with the following statement?</div>
                          <div className="flex justify-between">
                            {["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"].map((option) => (
                              <div key={option} className="flex flex-col items-center">
                                <div className="w-4 h-4 border border-purple-300 rounded-full mb-1"></div>
                                <div className="text-xs text-gray-500 w-16 text-center">{option}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="text-sm font-medium mb-2">Question Type 2: Multiple Choice</div>
                          <div className="text-xs text-gray-700 mb-3">Which research methods do you commonly use?</div>
                          <div className="space-y-2">
                            {["Qualitative interviews", "Surveys", "Observational studies", "Focus groups", "Literature review"].map((option) => (
                              <div key={option} className="flex items-center">
                                <div className="w-4 h-4 border border-purple-300 rounded mr-2"></div>
                                <div className="text-xs">{option}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm font-medium text-gray-700 mb-3">
                        <div>Survey Logic</div>
                        <div className="text-purple-600 text-xs">Advanced</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs mb-2">If respondent selects &quot;Qualitative interviews&quot;, show:</div>
                        <div className="flex items-center bg-white p-2 rounded border border-gray-200">
                          <div className="mr-3 bg-purple-100 text-purple-600 rounded-full w-5 h-5 flex items-center justify-center text-xs">Q</div>
                          <div className="text-xs">How many interviews do you typically conduct?</div>
                        </div>
                        <div className="flex justify-end mt-3">
                          <div className="text-xs text-purple-600 font-medium">+ Add another condition</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-purple-200/50 rounded-full blur-xl"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-purple-100 rounded-full blur-xl"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
