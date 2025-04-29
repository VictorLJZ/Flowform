"use client";

export default function PricingBrands() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl text-center">
        <h2 className="text-3xl font-bold mb-12">
          Join thousands of teams who power their forms with FlowForm
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 items-center justify-items-center opacity-70">
          {['airbnb', 'uber', 'shopify', 'netflix', 'spotify', 'slack'].map((brand) => (
            <div key={brand} className="h-8 w-32">
              {/* Replace with actual brand logos */}
              <div className="h-full w-full bg-gray-200 rounded flex items-center justify-center text-sm font-medium">
                {brand.charAt(0).toUpperCase() + brand.slice(1)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
