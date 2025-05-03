"use client"

import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export default function DynamicQuestionsHero() {
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
                <Sparkles className="w-4 h-4 mr-2" />
                <span>AI-Powered</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                Dynamic Questions 
                <span className="text-primary"> that adapt in real-time</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Create intelligent forms that evolve as users respond, unlocking deeper insights and more meaningful data with our powerful AI-driven follow-up questions.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg">
                  Try Dynamic Questions
                </Button>
                <Button size="lg" variant="outline">
                  Watch Demo
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
              <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl p-1">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                  <div className="p-6 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <div className="ml-4 text-sm text-gray-500">Dynamic Form Demo</div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How would you describe your team's workflow challenges?
                      </label>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        We struggle with organizing tasks across multiple teams and tracking progress.
                      </div>
                    </div>
                    <div className="mb-6">
                      <div className="flex items-center mb-2">
                        <Sparkles className="text-primary w-4 h-4 mr-2" />
                        <span className="text-sm font-medium text-gray-700">AI Follow-up Question</span>
                      </div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Is communication between teams a significant issue, or is it primarily about task visibility?
                      </label>
                      <div className="border border-primary/30 rounded-lg">
                        <textarea 
                          className="w-full p-3 bg-white rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="Type your response..." 
                          rows={3}
                        ></textarea>
                      </div>
                      <div className="flex justify-end mt-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <Sparkles className="w-3 h-3 mr-1 text-primary" />
                          Analyzing responses to personalize your experience
                        </div>
                      </div>
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
