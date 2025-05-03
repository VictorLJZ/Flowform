"use client"

import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Palette } from "lucide-react"

export default function DesignHero() {
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
              <div className="bg-pink-50 text-pink-600 rounded-full inline-flex items-center px-3 py-1 text-sm font-medium mb-6">
                <Palette className="w-4 h-4 mr-2" />
                <span>Design Teams</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                Collect user feedback 
                <span className="text-pink-600"> that inspires design</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Streamline your design research process with intuitive forms for user testing, feedback collection, and design iteration.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" className="bg-pink-600 hover:bg-pink-700">
                  Start for free
                </Button>
                <Button size="lg" variant="outline">
                  See templates
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
              <div className="bg-gradient-to-r from-pink-100 to-pink-50 rounded-2xl p-1">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                  <div className="p-6 bg-pink-50 border-b border-pink-100">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <div className="ml-4 text-sm text-gray-500">User Testing Dashboard</div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-6">
                      <div className="text-sm font-medium text-gray-700 mb-3">Design Prototype Evaluation</div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-white border border-gray-200 rounded-lg p-2 relative">
                            <div className="absolute top-1 right-1 bg-pink-100 text-pink-600 text-xs px-2 py-0.5 rounded-full">Design A</div>
                            <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">Prototype Image</div>
                          </div>
                          <div className="bg-white border border-gray-200 rounded-lg p-2 relative">
                            <div className="absolute top-1 right-1 bg-pink-100 text-pink-600 text-xs px-2 py-0.5 rounded-full">Design B</div>
                            <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">Prototype Image</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-700 mb-2">Which design do you prefer?</div>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <div className="w-4 h-4 border border-pink-300 rounded-full mr-2"></div>
                            <div className="text-xs">Design A</div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-4 border border-pink-300 rounded-full mr-2 flex items-center justify-center">
                              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                            </div>
                            <div className="text-xs">Design B</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-3">User Preferences</div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-gray-700 mb-2">Rate the ease of navigation (1-5)</div>
                          <div className="flex items-center justify-between">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <div key={rating} className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full ${rating === 4 ? 'bg-pink-500 text-white' : 'border border-gray-200'} flex items-center justify-center text-xs font-medium`}>
                                  {rating}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{rating === 1 ? 'Poor' : rating === 5 ? 'Excellent' : ''}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-gray-700 mb-2">What aspects could be improved?</div>
                          <div className="p-2 bg-gray-50 rounded-lg text-xs text-gray-600 min-h-[40px]">
                            I'd like to see better contrast between the menu items and background. Also, the checkout button should be more prominent...
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-pink-200/50 rounded-full blur-xl"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-pink-100 rounded-full blur-xl"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
