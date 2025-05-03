"use client"

import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  GraduationCap, 
  Users, 
  LineChart, 
  Briefcase, 
  Calendar 
} from "lucide-react"

const categories = [
  {
    title: "Business",
    icon: Building2,
    templates: ["Customer Feedback", "Lead Generation", "Contact Forms", "Order Forms"],
    color: "bg-blue-500/10",
    textColor: "text-blue-600"
  },
  {
    title: "Education",
    icon: GraduationCap,
    templates: ["Course Evaluation", "Student Registration", "Quiz Builder", "Lesson Feedback"],
    color: "bg-purple-500/10",
    textColor: "text-purple-600"
  },
  {
    title: "HR & Recruiting",
    icon: Users,
    templates: ["Job Application", "Employee Onboarding", "Performance Review", "Exit Interview"],
    color: "bg-pink-500/10",
    textColor: "text-pink-600"
  },
  {
    title: "Market Research",
    icon: LineChart,
    templates: ["Consumer Survey", "Product Testing", "Brand Awareness", "Competitive Analysis"],
    color: "bg-amber-500/10",
    textColor: "text-amber-600"
  },
  {
    title: "Non-Profit",
    icon: Briefcase,
    templates: ["Volunteer Registration", "Donation Forms", "Event Feedback", "Grant Applications"],
    color: "bg-green-500/10",
    textColor: "text-green-600"
  },
  {
    title: "Events",
    icon: Calendar,
    templates: ["Registration Form", "RSVP", "Post-Event Survey", "Speaker Submission"],
    color: "bg-indigo-500/10",
    textColor: "text-indigo-600"
  }
]

export default function TemplatesCategories() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Templates for every industry
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse our extensive library of professionally designed templates, or create your own from scratch
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <motion.div
              key={category.title}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <div className={`p-6 ${category.color}`}>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center">
                    <category.icon className={`w-6 h-6 ${category.textColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold ml-4 text-gray-900">
                    {category.title}
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  {category.templates.map((template) => (
                    <li key={template} className="flex items-center text-gray-700">
                      <span className="w-2 h-2 rounded-full bg-gray-300 mr-3"></span>
                      {template}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full">
                  View Templates
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
