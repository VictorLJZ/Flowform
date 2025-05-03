"use client"

import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import { ArrowRight, Megaphone } from "lucide-react"

export default function MarketingCTA() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-16 sm:px-12 lg:px-16 lg:py-20 relative">
            <div className="max-w-xl relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-2 mb-6">
                  <Megaphone className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-600 font-medium">Marketing Success</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  Ready to transform your marketing data collection?
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Join thousands of marketing teams using FlowForm to capture leads, gain insights, and drive campaign success.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 font-medium">
                    Start free trial
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="font-medium"
                  >
                    Schedule a demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl"></div>
            
            {/* Marketing elements */}
            <div className="hidden lg:block absolute bottom-12 right-12">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-lg shadow-lg p-4 w-64"
              >
                <div className="text-xs font-medium text-gray-700 mb-2">Marketing Template Gallery</div>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-blue-50 rounded-md h-24 flex items-center justify-center">
                      <div className="text-xs text-gray-500">Template {i}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-blue-600 flex items-center justify-end">
                  View all templates
                  <ArrowRight className="ml-1 h-3 w-3" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
