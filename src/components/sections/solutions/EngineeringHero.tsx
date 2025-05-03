"use client"

import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Code } from "lucide-react"

export default function EngineeringHero() {
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
              <div className="bg-green-50 text-green-600 rounded-full inline-flex items-center px-3 py-1 text-sm font-medium mb-6">
                <Code className="w-4 h-4 mr-2" />
                <span>Engineering Teams</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                Build better products with 
                <span className="text-green-600"> data-driven insights</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Collect technical feedback, prioritize features, and make informed engineering decisions with specialized forms built for development teams.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Start for free
                </Button>
                <Button size="lg" variant="outline">
                  View documentation
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
              <div className="bg-gradient-to-r from-green-100 to-green-50 rounded-2xl p-1">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                  <div className="p-6 bg-green-50 border-b border-green-100">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <div className="ml-4 text-sm text-gray-500">Feature Prioritization Tool</div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-6">
                      <div className="text-sm font-medium text-gray-700 mb-3">Feature Requests</div>
                      <div className="space-y-2">
                        <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <Code className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">API Webhook Integration</div>
                              <div className="text-xs text-gray-500">Requested by 48 users</div>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <div key={star} className={`w-5 h-5 rounded-full flex items-center justify-center ${star <= 4 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                                <div className="text-xs">★</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <Code className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">GraphQL Support</div>
                              <div className="text-xs text-gray-500">Requested by 36 users</div>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <div key={star} className={`w-5 h-5 rounded-full flex items-center justify-center ${star <= 3 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                                <div className="text-xs">★</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <Code className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">Performance Optimization</div>
                              <div className="text-xs text-gray-500">Requested by 52 users</div>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <div key={star} className={`w-5 h-5 rounded-full flex items-center justify-center ${star <= 5 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                                <div className="text-xs">★</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-3">Technical Requirements</div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-700 mb-2">What programming language do you primarily use?</div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="text-xs">JavaScript/TypeScript</div>
                            <div className="text-xs font-medium">65%</div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1">
                            <div className="text-xs">Python</div>
                            <div className="text-xs font-medium">20%</div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '20%' }}></div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1">
                            <div className="text-xs">Other</div>
                            <div className="text-xs font-medium">15%</div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '15%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-green-200/50 rounded-full blur-xl"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-green-100 rounded-full blur-xl"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
