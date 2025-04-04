import { Sparkles, MessageSquare, BarChart3 } from "lucide-react"

const features = [
  {
    name: "AI-Powered Forms",
    description: "Smart forms that adapt and learn from responses, providing deeper insights and better engagement.",
    icon: Sparkles,
  },
  {
    name: "Conversational Flow",
    description: "Create forms that feel like natural conversations, leading to higher completion rates.",
    icon: MessageSquare,
  },
  {
    name: "Rich Analytics",
    description: "Get detailed insights and analytics to understand your audience better and make data-driven decisions.",
    icon: BarChart3,
  },
]

const Features = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-medium text-gray-900 mb-4">
            Smarter forms for better insights
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our AI-powered platform helps you create forms that engage users and collect meaningful data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="relative p-8 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {feature.name}
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

export default Features 