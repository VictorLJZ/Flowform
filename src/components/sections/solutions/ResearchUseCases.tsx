"use client"

import { 
  ClipboardCheck, 
  FileText, 
  Users, 
  BarChart3,
  Lock
} from "lucide-react"

const useCases = [
  {
    title: "Academic Surveys",
    description: "Create methodologically sound surveys with advanced question types and robust validation.",
    icon: ClipboardCheck
  },
  {
    title: "Market Research",
    description: "Gather consumer insights with customizable forms that adapt based on previous responses.",
    icon: FileText
  },
  {
    title: "Focus Group Management",
    description: "Streamline participant screening, feedback collection, and session organization.",
    icon: Users
  },
  {
    title: "Data Analysis Tools",
    description: "Export clean datasets and visualize results directly through intuitive dashboards.",
    icon: BarChart3
  },
  {
    title: "IRB-Compliant Forms",
    description: "Build forms that meet institutional review board standards for ethical research conduct.",
    icon: Lock
  }
]

export default function ResearchUseCases() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Research use cases
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            FlowForm provides specialized tools for academic and market researchers to collect and analyze data effectively
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.slice(0, 3).map((useCase) => (
            <div 
              key={useCase.title} 
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <useCase.icon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {useCase.title}
              </h3>
              <p className="text-gray-600">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.slice(3).map((useCase) => (
            <div 
              key={useCase.title} 
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <useCase.icon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {useCase.title}
              </h3>
              <p className="text-gray-600">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
