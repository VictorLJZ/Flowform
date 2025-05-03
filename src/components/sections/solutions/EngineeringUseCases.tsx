"use client"

import { 
  CheckCircle, 
  Bug, 
  LineChart, 
  GitBranch,
  Database
} from "lucide-react"

const useCases = [
  {
    title: "Feature Prioritization",
    description: "Collect and prioritize feature requests from users, stakeholders, and team members to inform your roadmap.",
    icon: CheckCircle
  },
  {
    title: "Bug Tracking",
    description: "Create detailed bug report forms that capture all the information developers need to reproduce and fix issues.",
    icon: Bug
  },
  {
    title: "Performance Monitoring",
    description: "Gather user feedback on application performance and identify areas that need optimization.",
    icon: LineChart
  },
  {
    title: "Release Testing",
    description: "Build structured feedback forms for QA teams and beta testers to evaluate new releases.",
    icon: GitBranch
  },
  {
    title: "Technical Requirements",
    description: "Collect detailed technical specifications and requirements from stakeholders and clients.",
    icon: Database
  }
]

export default function EngineeringUseCases() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Engineering use cases
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            FlowForm helps engineering teams gather technical feedback and make data-driven development decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.slice(0, 3).map((useCase) => (
            <div 
              key={useCase.title} 
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <useCase.icon className="h-6 w-6 text-green-600" />
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
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <useCase.icon className="h-6 w-6 text-green-600" />
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
