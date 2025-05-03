"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, LayoutTemplate, Edit } from "lucide-react"

const benefits = [
  {
    title: "Save time",
    description: "Start collecting responses in minutes, not hours.",
    icon: Clock
  },
  {
    title: "Professional design",
    description: "All templates are professionally designed for high completion rates.",
    icon: LayoutTemplate
  },
  {
    title: "Fully customizable",
    description: "Easily modify any template to fit your specific needs.",
    icon: Edit
  }
]

export default function TemplatesCTA() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl shadow-sm overflow-hidden border border-indigo-100">
          <div className="px-6 py-16 sm:p-16 lg:p-20 lg:grid lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Choose a template and get started in minutes
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                With FlowForm's templates, you can create professional forms and surveys without starting from scratch.
              </p>
              
              <div className="space-y-5 mb-10">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-white">
                        <benefit.icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{benefit.title}</h3>
                      <p className="mt-1 text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button size="lg" className="font-medium">
                Explore Templates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="mt-12 lg:mt-0 relative">
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="flex space-x-1 mr-3">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="text-sm text-gray-500">Customer Feedback Template</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 p-6">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                    <div className="h-10 bg-gray-100 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                    <div className="grid grid-cols-5 gap-2 mb-6">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <div key={num} className="h-10 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-500">{num}</div>
                      ))}
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-28 mb-4"></div>
                    <div className="h-24 bg-gray-100 rounded mb-6"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
                    <div className="space-y-2 mb-6">
                      {[1, 2, 3].map((num) => (
                        <div key={num} className="h-10 bg-gray-100 rounded flex items-center">
                          <div className="w-4 h-4 rounded-full bg-gray-200 ml-3"></div>
                          <div className="h-3 bg-gray-200 rounded w-20 ml-3"></div>
                        </div>
                      ))}
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                    <div className="h-24 bg-gray-100 rounded"></div>
                  </div>
                </div>
                <div className="border-t border-gray-100 p-4 flex justify-end">
                  <div className="h-10 w-24 bg-primary rounded-md"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
