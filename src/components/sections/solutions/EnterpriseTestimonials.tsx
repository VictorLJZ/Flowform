"use client"

import { motion } from "motion/react"
import { Quote } from "lucide-react"

const testimonials = [
  {
    name: "Jennifer Blackwell",
    role: "CIO",
    company: "Global Enterprises",
    avatar: "/images/testimonials/avatar-16.png",
    content: "After evaluating multiple enterprise form solutions, we chose FlowForm for its robust security features and flexible deployment options. The SSO integration and advanced access controls perfectly meet our complex organizational requirements."
  },
  {
    name: "Michael Thornton",
    role: "VP of IT Security",
    company: "FortuneTech",
    avatar: "/images/testimonials/avatar-17.png",
    content: "As a heavily regulated company, compliance is our top priority. FlowForm's audit trails, data governance features, and security certifications give us confidence that our data collection practices meet the most stringent requirements."
  },
  {
    name: "Sarah Richardson",
    role: "Global Head of Digital",
    company: "Monarch Industries",
    avatar: "/images/testimonials/avatar-18.png",
    content: "Standardizing our form processes across 12 countries and 8 languages was a massive challenge. FlowForm's enterprise solution made this possible with excellent localization support and centralized management capabilities."
  }
]

export default function EnterpriseTestimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by leading enterprises
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how enterprise organizations use FlowForm to secure their data collection
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
              className="bg-slate-50 rounded-xl p-8 relative"
            >
              <Quote className="absolute top-6 right-6 h-12 w-12 text-slate-200" />
              <div className="mb-6">
                <p className="text-gray-600 relative z-10">"{testimonial.content}"</p>
              </div>
              <div className="flex items-center">
                <div className="mr-4 flex-shrink-0 relative w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                  {/* Using a fallback div instead of an actual image to avoid errors */}
                  <div className="absolute inset-0 flex items-center justify-center text-xl font-medium text-slate-600">
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
          <p className="text-slate-600 font-medium mb-2">Serving Fortune 500 companies worldwide</p>
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
