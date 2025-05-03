"use client"

import { 
  Paintbrush as PaintBrushIcon, 
  Laptop as LaptopIcon, 
  Globe as GlobeIcon,
  Columns
} from "lucide-react"

// Custom DragDrop icon since it's not in lucide-react
const DragDropIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 4V8M10 4V20M6 16H18M8 20H12"></path>
  </svg>
);

const features = [
  {
    title: "Drag & Drop Interface",
    description: "Build forms by simply dragging and dropping elements where you want them. Rearrange with ease.",
    icon: DragDropIcon
  },
  {
    title: "Beautiful Themes",
    description: "Choose from dozens of professionally designed themes or create your own custom look and feel.",
    icon: PaintBrushIcon
  },
  {
    title: "Responsive Design",
    description: "Forms automatically adjust to look perfect on any device - desktop, tablet, or mobile.",
    icon: LaptopIcon
  },
  {
    title: "Multi-column Layouts",
    description: "Create sophisticated layouts with multi-column sections for a cleaner, more organized form.",
    icon: Columns
  },
  {
    title: "Custom Domains",
    description: "Host your forms on your own domain for a seamless brand experience.",
    icon: GlobeIcon
  }
]

export default function FormBuilderFeatures() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Build professional forms with powerful features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our intuitive form builder gives you all the tools you need to create any type of form
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
