"use client"

import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import { ArrowRight, Microscope } from "lucide-react"

export default function ResearchCTA() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-16 sm:px-12 lg:px-16 lg:py-20 relative">
            <div className="max-w-xl relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-2 mb-6">
                  <Microscope className="h-5 w-5 text-purple-600" />
                  <span className="text-purple-600 font-medium">Research Excellence</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  Ready to elevate your research data collection?
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Join thousands of researchers using FlowForm to collect high-quality data with advanced survey tools.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-700 font-medium">
                    Start for free
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="font-medium"
                  >
                    Book a consultation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl"></div>
            
            {/* Research elements */}
            <div className="hidden lg:block absolute bottom-12 right-12">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-lg shadow-lg p-4 w-64"
              >
                <div className="text-xs font-medium text-gray-700 mb-2">Data Visualization</div>
                <div className="p-2 bg-purple-50 rounded-md">
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">Question Response Rate</div>
                    <div className="flex items-center space-x-1">
                      {[85, 78, 92, 64, 89, 72, 95].map((value, i) => (
                        <div 
                          key={i} 
                          className="bg-purple-400 w-6 rounded-sm" 
                          style={{ height: `${value * 0.6}px` }}
                        ></div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-[10px] text-gray-500">Q1</div>
                      <div className="text-[10px] text-gray-500">Q7</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Participant Demographics</div>
                    <div className="flex">
                      <div className="w-20 h-20 relative rounded-full overflow-hidden">
                        <div className="absolute inset-0" style={{ 
                          background: "conic-gradient(#8b5cf6 0% 30%, #a78bfa 30% 55%, #c4b5fd 55% 70%, #ddd6fe 70% 100%)" 
                        }}></div>
                        <div className="absolute inset-0 flex items-center justify-center w-full h-full">
                          <div className="bg-white w-12 h-12 rounded-full"></div>
                        </div>
                      </div>
                      <div className="ml-3 space-y-1 my-auto">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-purple-600 rounded-full mr-1"></div>
                          <div className="text-[10px]">Group A (30%)</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mr-1"></div>
                          <div className="text-[10px]">Group B (25%)</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-purple-300 rounded-full mr-1"></div>
                          <div className="text-[10px]">Group C (15%)</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-purple-200 rounded-full mr-1"></div>
                          <div className="text-[10px]">Group D (30%)</div>
                        </div>
                      </div>
                    </div>
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
