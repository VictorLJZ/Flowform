"use client"

import { 
  Users, 
  Lightbulb, 
  BarChart, 
  Megaphone,
  Mail
} from "lucide-react"

const useCases = [
  {
    title: "Lead Generation Forms",
    description: "Create conversion-optimized forms that capture qualified leads and sync directly with your CRM.",
    icon: Users,
    color: "blue"
  },
  {
    title: "Customer Surveys",
    description: "Build engaging surveys that gather insights on customer satisfaction, preferences, and behavior.",
    icon: Lightbulb,
    color: "blue"
  },
  {
    title: "Campaign Analytics",
    description: "Track form performance, analyze response patterns, and optimize your campaigns in real-time.",
    icon: BarChart,
    color: "blue"
  },
  {
    title: "Event Registration",
    description: "Streamline webinar and event signups with customizable registration forms and automated reminders.",
    icon: Megaphone,
    color: "blue"
  },
  {
    title: "Email Subscription",
    description: "Grow your email list with high-converting subscription forms embedded anywhere on your website.",
    icon: Mail,
    color: "blue"
  }
]

export default function MarketingUseCases() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Marketing use cases
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            FlowForm helps marketing teams automate data collection, generate leads, and gain valuable insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.slice(0, 3).map((useCase) => (
            <div 
              key={useCase.title} 
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <useCase.icon className="h-6 w-6 text-blue-600" />
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
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <useCase.icon className="h-6 w-6 text-blue-600" />
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
