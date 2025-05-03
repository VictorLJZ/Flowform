"use client"

import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import { ArrowRight, BarChart3 } from "lucide-react"

export default function AnalyticsCTA() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-16 sm:px-12 lg:px-16 lg:py-20 relative">
            <div className="max-w-xl relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-2 mb-6">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span className="text-primary font-medium">Actionable Insights</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  Make data-driven decisions with powerful analytics
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Understand your form performance and respondent behaviors to continuously improve your data collection.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button size="lg" className="font-medium">
                    Get started for free
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="font-medium"
                  >
                    See analytics in action
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100/50 rounded-full blur-3xl"></div>
            
            {/* Floating chart elements */}
            <div className="hidden lg:block absolute bottom-12 right-12">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-lg shadow-lg p-4 w-48"
              >
                <div className="text-xs font-medium text-gray-700 mb-2">Response Trends</div>
                <div className="flex items-end space-x-1 h-24">
                  {[30, 45, 25, 60, 35, 45, 70, 50, 65, 75].map((height, index) => (
                    <div 
                      key={index} 
                      style={{ height: `${height}%` }}
                      className="w-3 bg-primary rounded-t-sm"
                    ></div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white rounded-lg shadow-lg p-3 w-32 mt-3 ml-12"
              >
                <div className="text-xs font-medium text-gray-700 mb-2">Completion</div>
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/20 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold">87%</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="w-8 h-1 bg-primary rounded-full"></div>
                    <div className="w-6 h-1 bg-primary rounded-full"></div>
                    <div className="w-4 h-1 bg-primary rounded-full"></div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
