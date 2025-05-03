"use client"

import { 
  Brain, 
  LineChart, 
  Workflow, 
  LayoutList 
} from "lucide-react"

const features = [
  {
    title: "Intelligent Context Awareness",
    description: "Our AI analyzes previous answers to craft smart follow-up questions that dig deeper into important topics.",
    icon: Brain
  },
  {
    title: "Personalized Response Paths",
    description: "Each user receives a unique journey based on their responses, creating a conversational experience that feels human.",
    icon: Workflow
  },
  {
    title: "Rich Data Collection",
    description: "Gather more meaningful insights with contextual questions that adapt to each respondent's unique situation.",
    icon: LayoutList
  },
  {
    title: "Response Analysis Dashboard",
    description: "Visualize how different response paths performed and identify the most valuable question sequences.",
    icon: LineChart
  }
]

export default function DynamicQuestionsFeatures() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            The smartest way to ask questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Dynamic Questions transforms standard forms into intelligent conversations that adapt in real-time to each respondent
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature) => (
            <div 
              key={feature.title} 
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
