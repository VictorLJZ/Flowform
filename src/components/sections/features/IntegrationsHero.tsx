"use client"

import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Link2 } from "lucide-react"

export default function IntegrationsHero() {
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
                <Link2 className="w-4 h-4 mr-2" />
                <span>Connect Everything</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                Powerful 
                <span className="text-primary"> integrations</span> with your favorite tools
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Connect FlowForm with 100+ apps and services to streamline your workflows and automate data sharing.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg">
                  Browse Integrations
                </Button>
                <Button size="lg" variant="outline">
                  Developer API
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
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-3 mb-2">
                    <h3 className="text-center text-base font-medium text-gray-800 mb-4">Popular Integrations</h3>
                  </div>
                  {/* Integration logos - Row 1 */}
                  <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-center">
                    <div className="h-12 w-12 bg-[#0073C0] rounded-lg flex items-center justify-center text-white font-bold text-xl">Z</div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-center">
                    <div className="h-12 w-12 bg-[#FF5722] rounded-lg flex items-center justify-center text-white font-bold text-xl">G</div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-center">
                    <div className="h-12 w-12 bg-[#00A1E0] rounded-lg flex items-center justify-center text-white font-bold text-xl">S</div>
                  </div>
                  
                  {/* Integration logos - Row 2 */}
                  <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-center">
                    <div className="h-12 w-12 bg-[#4A154B] rounded-lg flex items-center justify-center text-white font-bold text-xl">S</div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-center">
                    <div className="h-12 w-12 bg-[#1C66FB] rounded-lg flex items-center justify-center text-white font-bold text-xl">M</div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-center">
                    <div className="h-12 w-12 bg-[#1EC677] rounded-lg flex items-center justify-center text-white font-bold text-xl">H</div>
                  </div>
                  
                  {/* Integration diagram */}
                  <div className="col-span-3 mt-4">
                    <div className="bg-white rounded-xl shadow-sm p-4">
                      <div className="flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold">FF</div>
                          </div>
                          <div className="text-sm font-medium text-gray-700">FlowForm</div>
                        </div>
                        <div className="mx-4 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                          </svg>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="h-16 w-16 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                            <div className="h-10 w-10 bg-[#0073C0] rounded-lg flex items-center justify-center text-white font-bold">Z</div>
                          </div>
                          <div className="text-sm font-medium text-gray-700">Zapier</div>
                        </div>
                        <div className="mx-4 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                          </svg>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="flex space-x-2">
                            <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <div className="h-5 w-5 bg-gray-500 rounded flex items-center justify-center text-white font-bold text-xs">1</div>
                            </div>
                            <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <div className="h-5 w-5 bg-gray-500 rounded flex items-center justify-center text-white font-bold text-xs">2</div>
                            </div>
                            <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <div className="h-5 w-5 bg-gray-500 rounded flex items-center justify-center text-white font-bold text-xs">3</div>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-700 mt-2">Your Apps</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-blue-100 rounded-full blur-xl"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
