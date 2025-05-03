"use client"

import { 
  GitBranch, 
  Shuffle, 
  Eye, 
  SkipForward,
  ArrowRightLeft
} from "lucide-react"

const features = [
  {
    title: "Conditional Logic",
    description: "Show or hide questions based on previous answers, creating personalized paths for each respondent.",
    icon: GitBranch
  },
  {
    title: "Skip Logic",
    description: "Allow respondents to skip irrelevant sections, creating a more efficient and user-friendly experience.",
    icon: SkipForward
  },
  {
    title: "Answer Piping",
    description: "Insert answers from previous questions into later questions for a more personalized experience.",
    icon: ArrowRightLeft
  },
  {
    title: "Question Randomization",
    description: "Randomize the order of questions or answer choices to eliminate bias in your results.",
    icon: Shuffle
  },
  {
    title: "Display Logic",
    description: "Control the visibility of questions based on complex conditions including multiple previous answers.",
    icon: Eye
  }
]

export default function BranchingFeatures() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Create smarter surveys with advanced logic
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our powerful branching logic helps you create forms that feel personal to each respondent
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
