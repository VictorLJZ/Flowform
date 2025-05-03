"use client"

import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { MousePointerClick } from "lucide-react"

export default function FormBuilderHero() {
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
                <MousePointerClick className="w-4 h-4 mr-2" />
                <span>Drag & Drop</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                Create beautiful forms with our 
                <span className="text-primary"> intuitive builder</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Our drag-and-drop form builder makes it easy to create professional forms in minutes. No coding required.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg">
                  Try Form Builder
                </Button>
                <Button size="lg" variant="outline">
                  See Examples
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
              <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl p-1">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                  <div className="p-6 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <div className="ml-4 text-sm text-gray-500">Form Builder</div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex space-x-4">
                      <div className="w-64 bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-200">
                        <div className="font-medium text-sm text-gray-700 mb-3">Form Elements</div>
                        <div className="space-y-2">
                          <div className="bg-white rounded-md p-2 shadow-sm flex items-center justify-between">
                            <span className="text-sm">Short Text</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Drag</span>
                          </div>
                          <div className="bg-white rounded-md p-2 shadow-sm flex items-center justify-between">
                            <span className="text-sm">Long Text</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Drag</span>
                          </div>
                          <div className="bg-white rounded-md p-2 shadow-sm flex items-center justify-between">
                            <span className="text-sm">Multiple Choice</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Drag</span>
                          </div>
                          <div className="bg-white rounded-md p-2 shadow-sm flex items-center justify-between">
                            <span className="text-sm">Dropdown</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Drag</span>
                          </div>
                          <div className="bg-white rounded-md p-2 shadow-sm flex items-center justify-between">
                            <span className="text-sm">Date Picker</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Drag</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 bg-gray-50 p-4 rounded-lg border-2 border-primary/20">
                        <div className="font-medium text-sm text-gray-700 mb-3">Form Preview</div>
                        <div className="space-y-4">
                          <div className="bg-white rounded-md p-3 shadow-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Your Name
                            </label>
                            <input 
                              type="text" 
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                              placeholder="Enter your full name"
                            />
                          </div>
                          <div className="bg-white rounded-md p-3 shadow-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email Address
                            </label>
                            <input 
                              type="email" 
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                              placeholder="you@example.com"
                            />
                          </div>
                          <div className="bg-white rounded-md p-3 shadow-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              What can we help you with?
                            </label>
                            <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary/50">
                              <option>Please select an option</option>
                              <option>Support request</option>
                              <option>Feature suggestion</option>
                              <option>General inquiry</option>
                            </select>
                          </div>
                          <div className="border-2 border-primary border-dashed rounded-lg p-3 flex items-center justify-center bg-primary/5">
                            <span className="text-sm text-primary font-medium">Drop elements here</span>
                          </div>
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
