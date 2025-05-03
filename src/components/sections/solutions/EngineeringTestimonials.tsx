"use client"

import { motion } from "motion/react"
import { Quote } from "lucide-react"

const testimonials = [
  {
    name: "Robert Chen",
    role: "Engineering Manager",
    company: "TechStack Inc",
    avatar: "/images/testimonials/avatar-10.png",
    content: "FlowForm has transformed how we collect and prioritize feature requests. The structured data helps us make better roadmap decisions and keeps our engineering team focused on what matters."
  },
  {
    name: "Olivia Nguyen",
    role: "Lead Developer",
    company: "CodeCraft Systems",
    avatar: "/images/testimonials/avatar-11.png",
    content: "The bug reporting forms have been a game-changer for our team. We now get detailed, consistent reports with all the information we need, cutting our debugging time in half."
  },
  {
    name: "James Wilson",
    role: "CTO",
    company: "DevStream",
    avatar: "/images/testimonials/avatar-12.png",
    content: "As a growing tech company, we needed a flexible tool for technical feedback collection. FlowForm's customization and API capabilities let us integrate feedback directly into our development workflow."
  }
]

export default function EngineeringTestimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by engineering teams
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how engineering professionals use FlowForm to build better software products
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-green-50 rounded-xl p-8 relative"
            >
              <Quote className="absolute top-6 right-6 h-12 w-12 text-green-200" />
              <div className="mb-6">
                <p className="text-gray-600 relative z-10">"{testimonial.content}"</p>
              </div>
              <div className="flex items-center">
                <div className="mr-4 flex-shrink-0 relative w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                  {/* Using a fallback div instead of an actual image to avoid errors */}
                  <div className="absolute inset-0 flex items-center justify-center text-xl font-medium text-green-600">
                    {testimonial.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-green-600 font-medium mb-2">Powering engineering teams at innovative companies</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 lg:gap-16 opacity-70">
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
            <div className="h-8 w-28 bg-gray-200 rounded"></div>
            <div className="h-8 w-20 bg-gray-200 rounded"></div>
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
