"use client"

import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Megaphone } from "lucide-react"

export default function MarketingHero() {
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
              <div className="bg-blue-50 text-blue-600 rounded-full inline-flex items-center px-3 py-1 text-sm font-medium mb-6">
                <Megaphone className="w-4 h-4 mr-2" />
                <span>Marketing Teams</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                Elevate your marketing 
                <span className="text-blue-600"> with smarter forms</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Capture leads, gather customer insights, and streamline your marketing campaigns with powerful forms that convert and engage your audience.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Start for free
                </Button>
                <Button size="lg" variant="outline">
                  Watch demo
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
              <div className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-2xl p-1">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                  <div className="p-6 bg-blue-50 border-b border-blue-100">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <div className="ml-4 text-sm text-gray-500">Marketing Campaign Planner</div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-6">
                      <div className="flex justify-between">
                        <div className="text-sm font-medium text-gray-700">Lead Generation Dashboard</div>
                        <div className="text-xs text-gray-500">Last 7 days</div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">246</div>
                          <div className="text-xs text-gray-500">New Leads</div>
                          <div className="text-xs text-green-600 mt-1 flex items-center">
                            +12.5% ↑
                          </div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">58%</div>
                          <div className="text-xs text-gray-500">Conversion</div>
                          <div className="text-xs text-green-600 mt-1 flex items-center">
                            +3.2% ↑
                          </div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">$38</div>
                          <div className="text-xs text-gray-500">Cost per Lead</div>
                          <div className="text-xs text-green-600 mt-1 flex items-center">
                            -5.1% ↓
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="text-sm font-medium text-gray-700 mb-3">Campaign Performance</div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <div>Webinar Registration</div>
                            <div className="font-medium">78%</div>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full">
                            <div className="h-2 bg-blue-500 rounded-full" style={{ width: '78%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <div>Product Survey</div>
                            <div className="font-medium">65%</div>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full">
                            <div className="h-2 bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <div>Email Newsletter</div>
                            <div className="font-medium">42%</div>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full">
                            <div className="h-2 bg-blue-500 rounded-full" style={{ width: '42%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-3">Recent Submissions</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-xs font-medium">JD</div>
                            <div>
                              <div className="text-xs font-medium">John Doe</div>
                              <div className="text-xs text-gray-500">john@example.com</div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">2 min ago</div>
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 text-xs font-medium">AS</div>
                            <div>
                              <div className="text-xs font-medium">Anne Smith</div>
                              <div className="text-xs text-gray-500">anne@example.com</div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">15 min ago</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-blue-200/50 rounded-full blur-xl"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-100 rounded-full blur-xl"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
