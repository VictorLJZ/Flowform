"use client"

import { 
  ShieldCheck, 
  Users, 
  Globe, 
  Scale,
  BarChart3
} from "lucide-react"

const useCases = [
  {
    title: "Enterprise Security",
    description: "Secure data collection with SSO, role-based access controls, encryption, and compliance with major regulations.",
    icon: ShieldCheck
  },
  {
    title: "Organization-wide Forms",
    description: "Standardize form usage across departments with centralized templates and brand consistency tools.",
    icon: Users
  },
  {
    title: "Global Deployment",
    description: "Support for multiple languages, regional data residency, and international compliance requirements.",
    icon: Globe
  },
  {
    title: "Compliance & Governance",
    description: "Meet regulatory requirements with audit logs, data retention policies, and compliance reporting.",
    icon: Scale
  },
  {
    title: "Advanced Analytics",
    description: "Enterprise-grade analytics with custom dashboards, advanced reporting, and data visualization tools.",
    icon: BarChart3
  }
]

export default function EnterpriseUseCases() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Enterprise use cases
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            FlowForm provides secure, scalable form solutions for enterprise organizations with complex needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.slice(0, 3).map((useCase) => (
            <div 
              key={useCase.title} 
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="bg-slate-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <useCase.icon className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {useCase.title}
              </h3>
              <p className="text-gray-600">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.slice(3).map((useCase) => (
            <div 
              key={useCase.title} 
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="bg-slate-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <useCase.icon className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {useCase.title}
              </h3>
              <p className="text-gray-600">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
