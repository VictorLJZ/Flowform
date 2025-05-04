"use client"

import { motion } from "motion/react"
import { Quote } from "lucide-react"

const testimonials = [
  {
    name: "Dr. Emily Rodriguez",
    role: "Professor of Sociology",
    company: "State University",
    avatar: "/images/testimonials/avatar-4.png",
    content: "FlowForm has revolutionized our research data collection. The conditional logic features allow us to create sophisticated survey flows that yield much higher quality data for our longitudinal studies."
  },
  {
    name: "Marcus Thompson",
    role: "Market Research Lead",
    company: "Consumer Insights Group",
    avatar: "/images/testimonials/avatar-5.png",
    content: "The analytics capabilities in FlowForm help us identify patterns we would have otherwise missed. We've been able to draw much more nuanced conclusions about consumer behavior."
  },
  {
    name: "Dr. Aisha Patel",
    role: "Clinical Research Director",
    company: "HealthTech Institute",
    avatar: "/images/testimonials/avatar-6.png",
    content: "As a research organization, data security is paramount. FlowForm's compliance features give us confidence that our participants' information is protected while still making the data collection process smooth."
  }
]

export default function ResearchTestimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by research professionals
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how researchers use FlowForm to collect high-quality data for impactful studies
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
              className="bg-purple-50 rounded-xl p-8 relative"
            >
              <Quote className="absolute top-6 right-6 h-12 w-12 text-purple-200" />
              <div className="mb-6">
                <p className="text-gray-600 relative z-10">&quot;{testimonial.content}&quot;</p>
              </div>
              <div className="flex items-center">
                <div className="mr-4 flex-shrink-0 relative w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                  {/* Using a fallback div instead of an actual image to avoid errors */}
                  <div className="absolute inset-0 flex items-center justify-center text-xl font-medium text-purple-600">
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
          <p className="text-purple-600 font-medium mb-2">Trusted by 5,000+ research institutions and organizations</p>
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
