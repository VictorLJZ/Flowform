"use client"

import { motion } from "motion/react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Users, LineChart } from "lucide-react"

export default function DynamicQuestionsDemo() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            See Dynamic Questions in action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Watch how our AI adapts to create personalized question flows
          </p>
        </div>

        <Tabs defaultValue="customer-feedback" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="customer-feedback" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Customer Feedback</span>
              </TabsTrigger>
              <TabsTrigger value="market-research" className="flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                <span className="hidden sm:inline">Market Research</span>
              </TabsTrigger>
              <TabsTrigger value="job-application" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Job Applications</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="customer-feedback">
            <div className="relative max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-1">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <div className="ml-4 text-sm font-medium text-gray-700">Customer Feedback Form Demo</div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-8">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Question 1 of 3</p>
                        <h3 className="text-base font-medium text-gray-900 mb-3">How satisfied are you with our product?</h3>
                        <div className="flex space-x-4 mb-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <motion.div
                              key={rating}
                              className={`h-10 w-10 rounded-full flex items-center justify-center cursor-pointer ${
                                rating === 2 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {rating}
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div className="border-l-2 border-primary pl-4">
                        <div className="flex items-center mb-3">
                          <Badge className="bg-primary/10 text-primary border-none flex items-center mr-2">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Follow-up
                          </Badge>
                          <p className="text-sm text-gray-500">Based on your "2" rating</p>
                        </div>
                        <h3 className="text-base font-medium text-gray-900 mb-3">What aspects of the product disappointed you the most?</h3>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {['Interface', 'Performance', 'Features', 'Customer Support'].map((option) => (
                            <motion.div
                              key={option}
                              className="border border-gray-200 rounded-md p-3 cursor-pointer hover:border-primary hover:bg-primary/5 flex items-center"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="w-4 h-4 rounded-full border border-gray-300 mr-2"></div>
                              <span className="text-sm">{option}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div className="border-l-2 border-primary pl-4">
                        <div className="flex items-center mb-3">
                          <Badge className="bg-primary/10 text-primary border-none flex items-center mr-2">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Follow-up
                          </Badge>
                          <p className="text-sm text-gray-500">Based on selecting "Features"</p>
                        </div>
                        <h3 className="text-base font-medium text-gray-900 mb-3">Which specific features were you expecting that were missing?</h3>
                        <div className="border border-gray-200 rounded-md">
                          <textarea 
                            className="w-full p-3 rounded-md min-h-[80px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                            placeholder="Tell us what features you were looking for..."
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-100/40 rounded-full blur-3xl"></div>
            </div>
          </TabsContent>

          <TabsContent value="market-research">
            <div className="flex justify-center">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl w-full">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <div className="ml-4 text-sm font-medium text-gray-700">Market Research Survey Demo</div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-center text-gray-500 my-12">Select the "Customer Feedback" tab to see the demo</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="job-application">
            <div className="flex justify-center">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl w-full">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <div className="ml-4 text-sm font-medium text-gray-700">Job Application Form Demo</div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-center text-gray-500 my-12">Select the "Customer Feedback" tab to see the demo</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
