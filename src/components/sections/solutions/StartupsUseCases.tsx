"use client"

import { 
  Sparkles, 
  Users, 
  DollarSign, 
  BarChart3,
  MessageCircle
} from "lucide-react"

const useCases = [
  {
    title: "Idea Validation",
    description: "Create surveys to validate your product ideas and get feedback from potential users before building.",
    icon: Sparkles
  },
  {
    title: "Customer Development",
    description: "Gather insights from early adopters and refine your product based on real user feedback.",
    icon: Users
  },
  {
    title: "Pricing Research",
    description: "Test different pricing models and determine what users are willing to pay for your solution.",
    icon: DollarSign
  },
  {
    title: "Market Research",
    description: "Understand your target market with detailed surveys that reveal user needs and preferences.",
    icon: BarChart3
  },
  {
    title: "User Feedback Loop",
    description: "Establish an ongoing feedback system to continuously improve your product based on user input.",
    icon: MessageCircle
  }
]

export default function StartupsUseCases() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Startup use cases
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            FlowForm helps startups validate ideas, understand customers, and make data-driven decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.slice(0, 3).map((useCase) => (
            <div 
              key={useCase.title} 
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <useCase.icon className="h-6 w-6 text-orange-600" />
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
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <useCase.icon className="h-6 w-6 text-orange-600" />
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
