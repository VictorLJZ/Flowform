"use client"

import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import { ArrowRight, MousePointerClick } from "lucide-react"

export default function FormBuilderCTA() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-primary/5 to-indigo-50 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-16 sm:px-12 lg:px-16 relative">
            <div className="max-w-xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-2 mb-6">
                  <MousePointerClick className="h-5 w-5 text-primary" />
                  <span className="text-primary font-medium">No coding required</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  Start building beautiful forms today
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Our intuitive drag-and-drop builder makes it easy to create custom forms for any purpose.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button size="lg" className="font-medium">
                    Start building for free
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="font-medium"
                  >
                    Watch tutorial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
            
            {/* Decorative element */}
            <div className="hidden lg:block absolute bottom-0 right-0 w-72 h-72">
              <div className="relative w-full h-full">
                <motion.div 
                  className="absolute top-10 right-10 bg-white rounded-lg shadow-lg p-4"
                  initial={{ x: 10, y: 10 }}
                  animate={{ x: 0, y: 0 }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: "mirror", 
                    duration: 2,
                    ease: "easeInOut" 
                  }}
                >
                  <div className="w-24 h-6 bg-primary/10 rounded mb-2"></div>
                  <div className="w-32 h-8 bg-gray-100 rounded"></div>
                </motion.div>
                <motion.div 
                  className="absolute bottom-20 right-20 bg-white rounded-lg shadow-lg p-4"
                  initial={{ x: -10, y: -10 }}
                  animate={{ x: 0, y: 0 }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: "mirror", 
                    duration: 2.5,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                >
                  <div className="w-20 h-6 bg-blue-100 rounded mb-2"></div>
                  <div className="w-28 h-8 bg-gray-100 rounded"></div>
                </motion.div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white opacity-20 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
