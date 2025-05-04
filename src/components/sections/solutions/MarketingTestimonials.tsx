"use client"

import { motion } from "motion/react"
import { Quote } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Marketing Director",
    company: "GrowthLabs",
    avatar: "/images/testimonials/avatar-1.png",
    content: "FlowForm has transformed our lead generation process. We've doubled our conversion rates and the data integration with our CRM saves us hours of manual work every week."
  },
  {
    name: "Michael Chen",
    role: "Campaign Manager",
    company: "Elevate Digital",
    avatar: "/images/testimonials/avatar-2.png",
    content: "Creating campaign-specific forms used to take days. With FlowForm's templates and intuitive editor, we can launch new campaigns in minutes, not days."
  },
  {
    name: "Alex Rivera",
    role: "CMO",
    company: "StartupVision",
    avatar: "/images/testimonials/avatar-3.png",
    content: "The analytics dashboard gives us real-time insights into how our forms are performing. We can see exactly where potential leads are dropping off and optimize accordingly."
  }
]

export default function MarketingTestimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by marketing teams of all sizes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how other marketing professionals use FlowForm to drive results
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
              className="bg-blue-50 rounded-xl p-8 relative"
            >
              <Quote className="absolute top-6 right-6 h-12 w-12 text-blue-200" />
              <div className="mb-6">
                <p className="text-gray-600 relative z-10">&quot;{testimonial.content}&quot;</p>
              </div>
              <div className="flex items-center">
                <div className="mr-4 flex-shrink-0 relative w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                  {/* Using a fallback div instead of an actual image to avoid errors */}
                  <div className="absolute inset-0 flex items-center justify-center text-xl font-medium text-blue-600">
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
          <p className="text-blue-600 font-medium mb-2">Join 10,000+ marketing teams already using FlowForm</p>
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
