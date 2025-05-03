"use client"

import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  Download,
  Filter
} from "lucide-react"

const features = [
  {
    title: "Real-time Reporting",
    description: "Monitor form submissions as they happen with instant updates and live dashboards.",
    icon: BarChart3
  },
  {
    title: "Response Visualization",
    description: "Turn complex data into clear, actionable insights with beautiful charts and graphs.",
    icon: PieChart
  },
  {
    title: "Trend Analysis",
    description: "Identify patterns over time to understand how responses and engagement change.",
    icon: LineChart
  },
  {
    title: "Data Filtering",
    description: "Segment your data to focus on specific time periods, demographics, or response types.",
    icon: Filter
  },
  {
    title: "Export Options",
    description: "Download your data in multiple formats for further analysis or reporting.",
    icon: Download
  }
]

export default function AnalyticsFeatures() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Powerful analytics at your fingertips
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get valuable insights from your form responses with our comprehensive analytics tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.slice(0, 3).map((feature) => (
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

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.slice(3).map((feature) => (
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
