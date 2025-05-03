"use client"

import { 
  MousePointer, 
  EyeIcon, 
  Users, 
  RefreshCcw,
  MessageCircle
} from "lucide-react"

const useCases = [
  {
    title: "Usability Testing",
    description: "Collect detailed feedback on design prototypes with custom-built forms that capture user interactions.",
    icon: MousePointer
  },
  {
    title: "Design Critiques",
    description: "Streamline the review process with structured feedback forms that keep critique focused and constructive.",
    icon: EyeIcon
  },
  {
    title: "User Persona Research",
    description: "Gather qualitative and quantitative data to inform and validate your user personas and journey maps.",
    icon: Users
  },
  {
    title: "Iterative Testing",
    description: "Test multiple design versions and analyze user preferences to inform design decisions.",
    icon: RefreshCcw
  },
  {
    title: "UI/UX Feedback",
    description: "Collect specific feedback on UI elements, information architecture, and overall user experience.",
    icon: MessageCircle
  }
]

export default function DesignUseCases() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Design use cases
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            FlowForm helps design teams collect valuable user feedback to create exceptional user experiences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.slice(0, 3).map((useCase) => (
            <div 
              key={useCase.title} 
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="bg-pink-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <useCase.icon className="h-6 w-6 text-pink-600" />
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
              <div className="bg-pink-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <useCase.icon className="h-6 w-6 text-pink-600" />
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
