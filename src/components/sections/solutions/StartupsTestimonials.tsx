"use client"

import { motion } from "motion/react"
import { Quote } from "lucide-react"

const testimonials = [
  {
    name: "Sam Rodriguez",
    role: "Founder & CEO",
    company: "LaunchPad",
    avatar: "/images/testimonials/avatar-13.png",
    content: "FlowForm was a game-changer for validating our MVP. We were able to gather detailed user feedback at a fraction of the cost of enterprise solutions, which was crucial for our tight budget."
  },
  {
    name: "Emma Walker",
    role: "Co-Founder",
    company: "GrowthHack",
    avatar: "/images/testimonials/avatar-14.png",
    content: "The insights we gathered through FlowForm helped us pivot our product strategy early, saving us months of development time and thousands of dollars building features nobody wanted."
  },
  {
    name: "Raj Patel",
    role: "Product Lead",
    company: "NexGenAI",
    avatar: "/images/testimonials/avatar-15.png",
    content: "As an early-stage startup, we needed to validate our market quickly. FlowForm's templates and analytics made it easy to set up customer interviews and synthesize the data for our investors."
  }
]

export default function StartupsTestimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by founders and startups
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how startups use FlowForm to validate ideas and accelerate growth
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
              className="bg-orange-50 rounded-xl p-8 relative"
            >
              <Quote className="absolute top-6 right-6 h-12 w-12 text-orange-200" />
              <div className="mb-6">
                <p className="text-gray-600 relative z-10">&quot;{testimonial.content}&quot;</p>
              </div>
              <div className="flex items-center">
                <div className="mr-4 flex-shrink-0 relative w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                  {/* Using a fallback div instead of an actual image to avoid errors */}
                  <div className="absolute inset-0 flex items-center justify-center text-xl font-medium text-orange-600">
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
          <p className="text-orange-600 font-medium mb-2">Helping startups from idea to scale</p>
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
