"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import MegaNavbar from "@/components/layout/public/MegaNavbar"
import FooterBar from "@/components/layout/public/FooterBar"
import { ChevronRight, BookOpen, FileText, Users, BarChart3, Code, Lightbulb } from "lucide-react"

const guides = [
  {
    title: "FlowForm 101",
    description: "Learn the basics of creating forms, collecting responses, and analyzing data.",
    href: "/guide/flowform-101",
    icon: BookOpen,
    category: "Getting Started",
    time: "15 min read"
  },
  {
    title: "Form Design Best Practices",
    description: "Design principles and tips for creating effective, user-friendly forms.",
    href: "/resources/guides",
    icon: FileText,
    category: "Form Design",
    time: "10 min read",
    comingSoon: true
  },
  {
    title: "Collecting Customer Feedback",
    description: "Learn how to create effective customer feedback forms and surveys.",
    href: "/resources/guides",
    icon: Users,
    category: "Use Cases",
    time: "8 min read",
    comingSoon: true
  },
  {
    title: "Advanced Analytics",
    description: "Master FlowForm's analytics tools to gain deeper insights from your data.",
    href: "/resources/guides",
    icon: BarChart3,
    category: "Analytics",
    time: "12 min read",
    comingSoon: true
  },
  {
    title: "Developer Guide: API & Webhooks",
    description: "Integrate FlowForm with your applications using our API and webhooks.",
    href: "/resources/guides",
    icon: Code,
    category: "Development",
    time: "20 min read",
    comingSoon: true
  },
  {
    title: "Form Strategy for Marketers",
    description: "Strategic approaches to using forms for lead generation and marketing campaigns.",
    href: "/resources/guides",
    icon: Lightbulb,
    category: "Marketing",
    time: "15 min read",
    comingSoon: true
  },
]

export default function GuidesPage() {
  return (
    <>
      <MegaNavbar />
      <main>
        <section className="bg-gradient-to-b from-primary/10 to-white pt-20 pb-16 lg:pt-28 lg:pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="mb-8 flex items-center text-sm text-gray-500">
              <Link href="/" className="hover:text-primary">Home</Link>
              <ChevronRight className="h-4 w-4 mx-2" />
              <Link href="/resources" className="hover:text-primary">Resources</Link>
              <ChevronRight className="h-4 w-4 mx-2" />
              <span className="text-gray-900 font-medium">Guides</span>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                FlowForm Guides & Resources
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mb-8">
                Learn everything you need to know about creating effective forms, collecting valuable data, and getting the most out of FlowForm.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {guides.map((guide, index) => (
                <motion.div
                  key={guide.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className={`h-full ${guide.comingSoon ? 'opacity-70' : ''}`}>
                    <CardContent className="p-6">
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                        <guide.icon className="h-6 w-6" />
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-primary bg-primary/5 px-3 py-1 rounded-full">
                          {guide.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {guide.time}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {guide.title}
                        {guide.comingSoon && (
                          <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Coming Soon</span>
                        )}
                      </h3>
                      <p className="text-gray-600 mb-6 text-sm">
                        {guide.description}
                      </p>
                      <div>
                        {guide.comingSoon ? (
                          <Button variant="outline" disabled className="w-full">
                            Coming Soon
                          </Button>
                        ) : (
                          <Button asChild className="w-full">
                            <Link href={guide.href}>
                              Read Guide
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-16 bg-primary/5 rounded-xl p-8 border border-primary/10">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-2/3">
                  <h2 className="text-2xl font-bold mb-3">Can't find what you're looking for?</h2>
                  <p className="text-gray-600 mb-6 md:mb-0">
                    Our support team is here to help. Check out the help center or contact us directly for personalized assistance.
                  </p>
                </div>
                <div className="md:w-1/3 md:text-right">
                  <Button asChild variant="outline">
                    <Link href="/resources/help">
                      Visit Help Center
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterBar />
    </>
  )
}
