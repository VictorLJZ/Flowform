"use client"

import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import { ArrowRight, Code } from "lucide-react"

export default function EngineeringCTA() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-16 sm:px-12 lg:px-16 lg:py-20 relative">
            <div className="max-w-xl relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-2 mb-6">
                  <Code className="h-5 w-5 text-green-600" />
                  <span className="text-green-600 font-medium">Engineering Excellence</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  Ready to build better software?
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Join thousands of engineering teams using FlowForm to collect technical feedback and make data-driven development decisions.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 font-medium">
                    Start for free
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="font-medium"
                  >
                    View API documentation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-100/50 rounded-full blur-3xl"></div>
            
            {/* Engineering elements */}
            <div className="hidden lg:block absolute bottom-12 right-12">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-lg shadow-lg p-4 w-64"
              >
                <div className="text-xs font-medium text-gray-700 mb-2">API Integration</div>
                <div className="bg-gray-900 rounded p-3 font-mono text-[10px] text-green-400">
                  <div className="mb-1 text-gray-500">// Submit form data via API</div>
                  <div>const response = await fetch(</div>
                  <div className="ml-4">'/api/forms/submit',</div>
                  <div className="ml-4">{'{'}</div>
                  <div className="ml-8">method: 'POST',</div>
                  <div className="ml-8">headers: {'{'} 'Content-Type': 'application/json' {'}'},</div>
                  <div className="ml-8">body: JSON.stringify(formData)</div>
                  <div className="ml-4">{'}'}</div>
                  <div>);</div>
                  <div className="mt-1">const result = await response.json();</div>
                </div>
                
                <div className="mt-3">
                  <div className="text-xs text-gray-700 mb-1">Webhook Configuration</div>
                  <div className="flex items-center justify-between bg-gray-50 rounded-md p-2 mb-2">
                    <div className="text-[10px]">API Key</div>
                    <div className="text-[10px] font-mono bg-gray-100 px-2 py-0.5 rounded">••••••••••••</div>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 rounded-md p-2">
                    <div className="text-[10px]">Endpoint URL</div>
                    <div className="text-[10px] font-mono text-green-600">POST /webhook</div>
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
