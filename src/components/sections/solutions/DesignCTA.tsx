"use client"

import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import { ArrowRight, Palette } from "lucide-react"

export default function DesignCTA() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-16 sm:px-12 lg:px-16 lg:py-20 relative">
            <div className="max-w-xl relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-2 mb-6">
                  <Palette className="h-5 w-5 text-pink-600" />
                  <span className="text-pink-600 font-medium">Design Excellence</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  Ready to improve your design research?
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Join thousands of design teams using FlowForm to collect high-quality user feedback and create better products.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button size="lg" className="bg-pink-600 hover:bg-pink-700 font-medium">
                    Start for free
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="font-medium"
                  >
                    View design templates
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100/50 rounded-full blur-3xl"></div>
            
            {/* Design elements */}
            <div className="hidden lg:block absolute bottom-12 right-12">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-lg shadow-lg p-4 w-64"
              >
                <div className="text-xs font-medium text-gray-700 mb-2">Design Feedback System</div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-50 rounded p-2">
                    <div className="w-full h-16 bg-pink-100 rounded mb-2"></div>
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-gray-500">Version A</div>
                      <div className="text-[10px] font-medium text-pink-600">72% 👍</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="w-full h-16 bg-purple-100 rounded mb-2"></div>
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-gray-500">Version B</div>
                      <div className="text-[10px] font-medium text-pink-600">28% 👍</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="bg-gray-50 p-2 rounded text-[10px] text-gray-600">
                    "I prefer Version A because the layout is more intuitive."
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-[10px] text-gray-600">
                    "Version A has better contrast and readability."
                  </div>
                  <div className="flex justify-end mt-1">
                    <div className="text-[10px] text-pink-600">View all 24 responses →</div>
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
