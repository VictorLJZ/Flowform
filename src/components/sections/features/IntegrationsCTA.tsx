"use client"

import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import { ArrowRight, Code } from "lucide-react"

export default function IntegrationsCTA() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-16 sm:px-12 lg:p-16 lg:grid lg:grid-cols-2 lg:gap-x-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Code className="h-5 w-5 text-primary" />
                <span className="text-primary font-medium">Developer API</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Build custom integrations with our API
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our developer-friendly API allows you to create custom integrations and embed FlowForm functionality directly into your applications.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-10 lg:mb-0">
                <Button size="lg" className="font-medium">
                  API Documentation
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="font-medium"
                >
                  Developer Guide
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="mt-10 lg:mt-0">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex items-center bg-gray-800 px-4 py-2">
                  <div className="flex space-x-1.5 mr-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs font-mono text-gray-400">API Request Example</div>
                </div>
                <div className="font-mono text-sm p-4 bg-gray-900 text-gray-100 overflow-x-auto">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="text-blue-400">// Make an API request to create a form</div>
                    <div className="mt-2">
                      <span className="text-purple-400">const</span> <span className="text-green-400">response</span> = <span className="text-purple-400">await</span> <span className="text-yellow-400">fetch</span>(<span className="text-green-400">'https://api.flowform.com/v1/forms'</span>, {"{"}
                    </div>
                    <div className="ml-4"><span className="text-blue-400">method:</span> <span className="text-green-400">'POST'</span>,</div>
                    <div className="ml-4"><span className="text-blue-400">headers:</span> {"{"}</div>
                    <div className="ml-8"><span className="text-blue-400">'Content-Type':</span> <span className="text-green-400">'application/json'</span>,</div>
                    <div className="ml-8"><span className="text-blue-400">'Authorization':</span> <span className="text-green-400">'Bearer YOUR_API_KEY'</span></div>
                    <div className="ml-4">{"}"},</div>
                    <div className="ml-4"><span className="text-blue-400">body:</span> <span className="text-yellow-400">JSON.stringify</span>({"{"}</div>
                    <div className="ml-8"><span className="text-blue-400">title:</span> <span className="text-green-400">'Customer Feedback Form'</span>,</div>
                    <div className="ml-8"><span className="text-blue-400">description:</span> <span className="text-green-400">'Help us improve our services'</span>,</div>
                    <div className="ml-8"><span className="text-blue-400">questions:</span> [</div>
                    <div className="ml-12">{"{"} <span className="text-blue-400">type:</span> <span className="text-green-400">'text'</span>, <span className="text-blue-400">label:</span> <span className="text-green-400">'Your Name'</span> {"}"},</div>
                    <div className="ml-12">{"{"} <span className="text-blue-400">type:</span> <span className="text-green-400">'email'</span>, <span className="text-blue-400">label:</span> <span className="text-green-400">'Email Address'</span> {"}"},</div>
                    <div className="ml-12">{"{"} <span className="text-blue-400">type:</span> <span className="text-green-400">'rating'</span>, <span className="text-blue-400">label:</span> <span className="text-green-400">'Rate our service'</span> {"}"}</div>
                    <div className="ml-8">]</div>
                    <div className="ml-4">{"}"})</div>
                    <div>{"}"});</div>
                    <div className="mt-2"><span className="text-purple-400">const</span> <span className="text-green-400">data</span> = <span className="text-purple-400">await</span> <span className="text-green-400">response</span>.<span className="text-yellow-400">json</span>();</div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
