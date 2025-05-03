"use client"

import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import { ArrowRight, Sparkles } from "lucide-react"

export default function DynamicQuestionsCTA() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-primary to-blue-600 rounded-3xl shadow-xl overflow-hidden">
          <div className="px-6 py-16 sm:px-12 sm:py-24 lg:px-16 lg:py-24 relative">
            <div className="relative z-10 max-w-3xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-2 mb-6">
                  <Sparkles className="h-5 w-5 text-white" />
                  <span className="text-white/90 font-medium">AI-Powered Forms</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                  Start creating smarter forms today
                </h2>
                <p className="text-xl text-white/90 mb-8">
                  Transform the way you collect data with intelligent forms that adapt to each respondent in real-time.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button size="lg" variant="secondary" className="font-medium">
                    Get started for free
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white hover:border-white/40 font-medium"
                  >
                    Schedule a demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
