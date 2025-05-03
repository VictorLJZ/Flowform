"use client"

import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { BarChart } from "lucide-react"

export default function AnalyticsHero() {
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
                <BarChart className="w-4 h-4 mr-2" />
                <span>Deep Insights</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                Advanced Analytics 
                <span className="text-primary"> for data-driven decisions</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Gain valuable insights from your form responses with our powerful analytics tools. Visualize trends, track completion rates, and understand your audience better.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg">
                  Explore Analytics
                </Button>
                <Button size="lg" variant="outline">
                  View Demo Report
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
              <div className="bg-gradient-to-r from-primary/5 to-blue-50 rounded-2xl p-1">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                  <div className="p-6 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <div className="ml-4 text-sm text-gray-500">Form Analytics Dashboard</div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between mb-6">
                      <div className="bg-gray-50 rounded-lg p-3 w-1/3 mr-3">
                        <div className="text-xs text-gray-500 mb-1">Total Responses</div>
                        <div className="text-2xl font-bold text-gray-900">1,284</div>
                        <div className="text-xs text-green-600 mt-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 mr-1">
                            <path d="m5 12 5 5 10-10"></path>
                          </svg>
                          12.5% increase
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 w-1/3 mr-3">
                        <div className="text-xs text-gray-500 mb-1">Completion Rate</div>
                        <div className="text-2xl font-bold text-gray-900">86.3%</div>
                        <div className="text-xs text-green-600 mt-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 mr-1">
                            <path d="m5 12 5 5 10-10"></path>
                          </svg>
                          4.2% increase
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 w-1/3">
                        <div className="text-xs text-gray-500 mb-1">Avg. Time</div>
                        <div className="text-2xl font-bold text-gray-900">2m 14s</div>
                        <div className="text-xs text-red-600 mt-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 mr-1">
                            <path d="m19 9-7 7-7-7"></path>
                          </svg>
                          0.8% increase
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <div className="text-sm font-medium text-gray-700">Response Volume</div>
                        <div className="text-xs text-gray-500">Last 7 days</div>
                      </div>
                      <div className="h-40 bg-gray-50 rounded-lg p-3">
                        <div className="h-full flex items-end justify-between">
                          {[35, 58, 43, 70, 64, 45, 80].map((value, index) => (
                            <div key={index} className="flex flex-col items-center">
                              <div className="w-8 bg-primary rounded-t-sm" style={{ height: `${value}%` }}></div>
                              <div className="text-xs text-gray-500 mt-1">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <div className="text-sm font-medium text-gray-700">Top Form Questions</div>
                        <div className="text-xs text-primary">View all</div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-700">How did you hear about us?</div>
                          <div className="text-xs font-medium">96% completion</div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: '96%' }}></div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-700">Would you recommend our product?</div>
                          <div className="text-xs font-medium">92% completion</div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-700">Rate your experience (1-5)</div>
                          <div className="text-xs font-medium">89% completion</div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: '89%' }}></div>
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
