const testimonials = [
  {
    quote: "FlowForm has transformed how we collect customer feedback. The response rate has increased by 70% since we switched.",
    author: "Sarah Chen",
    role: "Head of Product",
    company: "TechCorp",
  },
  {
    quote: "The AI-powered forms have given us insights we never knew we needed. It's like having a conversation scientist on the team.",
    author: "Michael Rodriguez",
    role: "Customer Success Lead",
    company: "GrowthMetrics",
  },
  {
    quote: "Setting up complex forms used to take days. With FlowForm, we can create engaging surveys in minutes.",
    author: "Emily Watson",
    role: "Research Director",
    company: "DataInsights",
  },
]

const Testimonials = () => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-medium text-gray-900 mb-4">
            Loved by teams worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See why thousands of companies trust FlowForm for their form needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-sm"
            >
              <blockquote className="text-gray-600 mb-6">
                "{testimonial.quote}"
              </blockquote>
              <div>
                <p className="font-medium text-gray-900">{testimonial.author}</p>
                <p className="text-gray-600 text-sm">
                  {testimonial.role} at {testimonial.company}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
