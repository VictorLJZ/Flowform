"use client"

import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import { ArrowRight, Rocket } from "lucide-react"

export default function StartupsCTA() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-16 sm:px-12 lg:px-16 lg:py-20 relative">
            <div className="max-w-xl relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-2 mb-6">
                  <Rocket className="h-5 w-5 text-orange-600" />
                  <span className="text-orange-600 font-medium">Startup Special</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  Ready to validate your ideas and grow faster?
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Join hundreds of startups using FlowForm to collect essential feedback and make data-driven decisions at startup-friendly prices.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700 font-medium">
                    Get startup discount
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="font-medium"
                  >
                    Book a demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100/50 rounded-full blur-3xl"></div>
            
            {/* Startup special elements */}
            <div className="hidden lg:block absolute bottom-12 right-12">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-lg shadow-lg p-4 w-64"
              >
                <div className="text-xs font-medium text-gray-700 mb-2">Startup Special Offer</div>
                <div className="bg-orange-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium">Pro Plan</div>
                    <div className="flex items-center">
                      <div className="text-xs line-through text-gray-500 mr-1">$49</div>
                      <div className="text-base font-bold text-orange-600">$29</div>
                      <div className="text-xs text-gray-500">/mo</div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-orange-600 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Unlimited forms</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-orange-600 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Advanced analytics</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-orange-600 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">1,000 responses/month</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-orange-600 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Priority support</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  <span className="text-orange-600 font-semibold">41% discount</span> for startups less than 2 years old with less than $1M in funding
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
