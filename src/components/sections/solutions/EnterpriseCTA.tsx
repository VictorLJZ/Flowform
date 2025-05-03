"use client"

import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import { ArrowRight, Building } from "lucide-react"

export default function EnterpriseCTA() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-16 sm:px-12 lg:px-16 lg:py-20 relative">
            <div className="max-w-xl relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-2 mb-6">
                  <Building className="h-5 w-5 text-slate-600" />
                  <span className="text-slate-600 font-medium">Enterprise Solutions</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  Ready for an enterprise-grade form solution?
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Contact our enterprise team to learn how FlowForm can be tailored to your organization's specific needs and security requirements.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button size="lg" className="bg-slate-800 hover:bg-slate-900 font-medium">
                    Contact enterprise sales
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="font-medium"
                  >
                    Download security whitepaper
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-200/50 rounded-full blur-3xl"></div>
            
            {/* Enterprise elements */}
            <div className="hidden lg:block absolute bottom-12 right-12">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-lg shadow-lg p-4 w-64"
              >
                <div className="text-xs font-medium text-gray-700 mb-2">Why Choose Enterprise?</div>
                
                <div className="space-y-3">
                  <div className="flex items-center p-2 bg-slate-50 rounded-md">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-700" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-800">Dedicated Support</div>
                      <div className="text-[10px] text-gray-500">Priority 24/7 assistance</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-2 bg-slate-50 rounded-md">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-700" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-800">Custom SLAs</div>
                      <div className="text-[10px] text-gray-500">Tailored to your needs</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-2 bg-slate-50 rounded-md">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-700" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                        <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                        <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-800">Data Residency</div>
                      <div className="text-[10px] text-gray-500">Regional hosting options</div>
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
